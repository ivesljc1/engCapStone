import unittest
from unittest.mock import patch, MagicMock, mock_open
import json
from datetime import datetime, timedelta
from flask import Flask
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase for testing
cred = credentials.Certificate("server/wellpathai-firebase-adminsdk-k0jhw-273e518091.json")
try:
    firebase_admin.initialize_app(cred)
except ValueError:
    pass

from server.appointment.create_timeslot import create_timeslot_blueprint
from server.appointment.make_appointment import make_appointment_blueprint

class TestAppointmentService(unittest.TestCase):
    @patch('server.appointment.calendar_setup.os.path.exists')
    @patch('builtins.open', new_callable=mock_open, read_data='{"calendar_id": "test_calendar_id"}')
    @patch('server.appointment.calendar_init.build')
    def setUp(self, mock_build, mock_file, mock_exists):
        """Set up test environment before each test"""
        # Mock calendar file existence check
        mock_exists.return_value = True
        
        # Mock calendar service
        self.mock_calendar_service = MagicMock()
        mock_build.return_value = self.mock_calendar_service
        
        # Import blueprints after mocking
        from server.appointment.create_timeslot import create_timeslot_blueprint
        from server.appointment.make_appointment import make_appointment_blueprint
        
        # Set up Flask test app
        self.app = Flask(__name__)
        self.app.register_blueprint(create_timeslot_blueprint)
        self.app.register_blueprint(make_appointment_blueprint)
        self.client = self.app.test_client()


    def test_calendar_creation(self):
        """Test calendar creation (should only happen once)"""
        with patch('server.appointment.calendar_setup.os.path.exists') as mock_exists, \
             patch('builtins.open', new_callable=mock_open) as mock_file, \
             patch('server.appointment.calendar_setup.build') as mock_build:
            
            # Mock that calendar doesn't exist yet
            mock_exists.return_value = False
            
            # Mock calendar service with proper chain
            mock_calendar = MagicMock()
            mock_insert = MagicMock()
            mock_insert.execute.return_value = {'id': 'new_calendar_id'}
            mock_calendar.calendars.return_value.insert.return_value = mock_insert
            mock_build.return_value = mock_calendar
            
            # Import to trigger calendar setup
            from server.appointment.calendar_setup import setup_calendar
            
            # Run setup
            calendar_id = setup_calendar()
            
            # Verify calendar was created
            self.assertEqual(calendar_id, 'new_calendar_id')
            mock_calendar.calendars.return_value.insert.assert_called_once_with(
                body={'summary': 'WellPath Appointments', 'timeZone': 'UTC'}
            )

    def test_create_timeslot(self):
        """Test creating a new timeslot"""
        with patch('server.appointment.create_timeslot.db') as mock_db, \
             patch('server.appointment.create_timeslot.calendar_service') as mock_calendar_service:  # Add this patch
            
            start_time = datetime.utcnow() + timedelta(days=1)
            
            # Mock Firestore
            mock_doc = MagicMock()
            mock_doc.id = 'timeslot123'
            mock_db.collection.return_value.document.return_value = mock_doc
            
            # Mock calendar event creation with proper chain
            mock_insert = MagicMock()
            mock_insert.execute.return_value = {'id': 'calendar_event_123'}
            mock_events = MagicMock()
            mock_events.insert.return_value = mock_insert
            mock_calendar_service.events.return_value = mock_events
            
            # Create timeslot
            response = self.client.post(
                '/api/timeslots/create',
                data=json.dumps({
                    'startTime': start_time.isoformat(),
                    'duration': 30
                }),
                content_type='application/json'
            )
            
            # Verify response
            self.assertEqual(response.status_code, 201)
            
            # Verify calendar API call
            mock_calendar_service.events.return_value.insert.assert_called_once_with(
                calendarId='test_calendar_id',
                body=unittest.mock.ANY
            )
            
            # Verify Firestore call
            mock_doc.set.assert_called_once()

    def test_calendar_reuse(self):
        """Test calendar ID reuse when it already exists"""
        with patch('server.appointment.calendar_setup.os.path.exists') as mock_exists, \
             patch('builtins.open', new_callable=mock_open, read_data='{"calendar_id": "existing_calendar_id"}') as mock_file:
            
            # Mock that calendar exists
            mock_exists.return_value = True
            
            # Import to trigger calendar setup
            from server.appointment.calendar_setup import setup_calendar
            
            # Run setup
            calendar_id = setup_calendar()
            
            # Verify existing ID was returned
            self.assertEqual(calendar_id, 'existing_calendar_id')
            mock_file().write.assert_not_called()

    def test_admin_create_multiple_timeslots(self):
        """Test admin creating multiple timeslots for a day"""
        with patch('server.appointment.create_timeslot.db') as mock_db, \
             patch('server.appointment.create_timeslot.calendar_service') as mock_calendar:
            
            mock_calendar.events.return_value.insert.return_value.execute.return_value = {
                'id': 'calendar_event_123'
            }
            
            # Create 3 consecutive timeslots
            base_time = datetime.utcnow() + timedelta(days=1)
            created_slots = []
            
            for i in range(3):
                mock_doc = MagicMock()
                mock_doc.id = f'timeslot_{i}'
                mock_db.collection.return_value.document.return_value = mock_doc
                
                timeslot_data = {
                    'startTime': (base_time + timedelta(hours=i)).isoformat(),
                    'duration': 30
                }
                
                response = self.client.post(
                    '/api/timeslots/create',
                    data=json.dumps(timeslot_data),
                    content_type='application/json'
                )
                
                self.assertEqual(response.status_code, 201)
                created_slots.append(json.loads(response.data))
            
            self.assertEqual(len(created_slots), 3)

    def test_user_view_available_timeslots(self):
        """Test user viewing available timeslots"""
        with patch('server.appointment.make_appointment.db') as mock_db:
            # Create mock available timeslots
            mock_slots = []
            for i in range(2):
                mock_slot = MagicMock()
                mock_slot.id = f'timeslot_{i}'
                mock_slot.to_dict.return_value = {
                    'startTime': datetime.utcnow() + timedelta(days=1, hours=i),
                    'endTime': datetime.utcnow() + timedelta(days=1, hours=i, minutes=30),
                    'isAvailable': True
                }
                mock_slots.append(mock_slot)
            
            # Set up query chain
            mock_query = MagicMock()
            mock_query.stream.return_value = mock_slots
            mock_db.collection.return_value.where.return_value = mock_query
            
            # Make request
            response = self.client.get('/api/appointments/available')
            
            # Assertions
            self.assertEqual(response.status_code, 200)
            available_slots = json.loads(response.data)
            self.assertEqual(len(available_slots), 2)
            self.assertTrue(all('startTime' in slot for slot in available_slots))
            self.assertTrue(all('endTime' in slot for slot in available_slots))

    def test_user_book_appointment(self):
        """Test user booking an available timeslot"""
        with patch('server.appointment.make_appointment.db') as mock_db, \
             patch('server.appointment.make_appointment.calendar_service') as mock_calendar:
            
            # Create datetime objects
            start_time = datetime.utcnow() + timedelta(days=1)
            end_time = start_time + timedelta(minutes=30)
            
            # Mock Firestore timeslot with serializable datetime
            mock_timeslot = MagicMock()
            mock_timeslot.exists = True
            mock_timeslot.to_dict.return_value = {
                'isAvailable': True,
                'eventId': 'calendar_event_123',
                'startTime': start_time.isoformat(),  # Convert to ISO string
                'endTime': end_time.isoformat()       # Convert to ISO string
            }
            
            # Set up Firestore mocks
            mock_doc_ref = MagicMock()
            mock_doc_ref.get.return_value = mock_timeslot
            mock_db.collection.return_value.document.return_value = mock_doc_ref
            
            # Mock calendar event
            mock_calendar.events.return_value.get.return_value.execute.return_value = {
                'id': 'calendar_event_123',
                'summary': 'Available Appointment Slot',
                'start': {'dateTime': start_time.isoformat()},
                'end': {'dateTime': end_time.isoformat()},
                'metadata': {}
            }
            
            mock_calendar.events.return_value.update.return_value.execute.return_value = {
                'id': 'calendar_event_123',
                'summary': 'Appointment with Patient user123',
                'start': {'dateTime': start_time.isoformat()},
                'end': {'dateTime': end_time.isoformat()},
                'metadata': {'isAvailable': False}
            }
            
            # Create a mock appointment document
            mock_appointment = MagicMock()
            mock_appointment.id = 'appointment123'
            mock_appointment_ref = MagicMock()
            mock_appointment_ref.id = 'appointment123'
            
            # Update mock_db to handle both collections
            def mock_collection_side_effect(collection_name):
                mock_collection = MagicMock()
                if collection_name == 'timeslots':
                    mock_collection.document.return_value = mock_doc_ref
                elif collection_name == 'appointments':
                    mock_collection.document.return_value = mock_appointment_ref
                return mock_collection
                
            mock_db.collection.side_effect = mock_collection_side_effect
            
            # Book appointment
            booking_data = {
                'timeslotId': 'timeslot123',
                'userId': 'user123'
            }
            
            response = self.client.post(
                '/api/appointments/book',
                data=json.dumps(booking_data),
                content_type='application/json'
            )
            
            # Debug output
            print(f"Response status: {response.status_code}")
            print(f"Response data: {response.data.decode()}")
            
            # Assertions
            self.assertEqual(response.status_code, 201)
            booking_result = json.loads(response.data)
            self.assertIn('appointmentId', booking_result)
            
            # Verify Firestore operations
            mock_db.collection.assert_any_call('timeslots')
            mock_db.collection.assert_any_call('appointments')

    def test_book_unavailable_timeslot(self):
        """Test attempting to book an already booked timeslot"""
        with patch('server.appointment.make_appointment.db') as mock_db:
            # Mock an unavailable timeslot
            mock_timeslot = MagicMock()
            mock_timeslot.exists = True
            mock_timeslot.to_dict.return_value = {
                'isAvailable': False,
                'eventId': 'calendar_event_123'
            }
            
            mock_doc_ref = MagicMock()
            mock_doc_ref.get.return_value = mock_timeslot
            mock_db.collection.return_value.document.return_value = mock_doc_ref
            
            # Attempt to book
            booking_data = {
                'timeslotId': 'timeslot123',
                'userId': 'user123'
            }
            
            response = self.client.post(
                '/api/appointments/book',
                data=json.dumps(booking_data),
                content_type='application/json'
            )
            
            # Assertions
            self.assertEqual(response.status_code, 400)
            response_data = json.loads(response.data)
            self.assertEqual(response_data['error'], 'Timeslot is no longer available')

if __name__ == '__main__':
    unittest.main()