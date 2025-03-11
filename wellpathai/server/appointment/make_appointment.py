from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from google.oauth2 import service_account
from googleapiclient.discovery import build
from datetime import datetime
from .calendar_init import calendar_service, CALENDAR_ID
from case.case import add_appointment_to_case



# Initialize Firestore
db = firestore.client()

# Blueprint for making appointments
make_appointment_blueprint = Blueprint("make_appointment", __name__)

@make_appointment_blueprint.route("/api/appointments/available", methods=["GET"])
def get_available_timeslots():
    try:
        # Query Firestore for available timeslots
        timeslots = db.collection('timeslots').where('isAvailable', '==', True).stream()
        
        available_slots = []
        for slot in timeslots:
            slot_data = slot.to_dict()
            available_slots.append({
                'id': slot.id,
                'startTime': slot_data['startTime'].isoformat(),
                'endTime': slot_data['endTime'].isoformat()
            })
            
        return jsonify(available_slots), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@make_appointment_blueprint.route("/api/appointments/book", methods=["POST"])
def book_appointment():
    try:
        data = request.get_json()
        
        # Extract data from request
        timeslot_id = data.get('timeslotId')
        user_id = data.get('userId')
        case_id = data.get('caseId')  # Optional case ID
        
        # Validate input
        if not all([timeslot_id, user_id]):
            return jsonify({"error": "Missing required fields"}), 400
            
        # Get timeslot from Firestore
        timeslot_ref = db.collection('timeslots').document(timeslot_id)
        timeslot = timeslot_ref.get()
        
        if not timeslot.exists:
            return jsonify({"error": "Timeslot not found"}), 404
            
        timeslot_data = timeslot.to_dict()
        
        # Check if timeslot is available
        if not timeslot_data.get('isAvailable', False):
            return jsonify({"error": "Timeslot is not available"}), 400
            
        # Parse datetime strings if they're in ISO format
        start_time = datetime.fromisoformat(timeslot_data['startTime']) if isinstance(timeslot_data['startTime'], str) else timeslot_data['startTime']
        end_time = datetime.fromisoformat(timeslot_data['endTime']) if isinstance(timeslot_data['endTime'], str) else timeslot_data['endTime']
        
        try:

            # Update Google Calendar event
            event = calendar_service.events().get(
                calendarId=CALENDAR_ID,
                eventId=timeslot_data['eventId']
            ).execute()
            
            event['summary'] = f'Appointment with Patient {user_id}'
            event['description'] = f'Booked appointment for user {user_id}'
            event['extendedProperties'] = {
                'private': {
                    'isAvailable': 'false',
                    'userId': user_id
                }
            }

            print(f"Updating calendar event: {timeslot_data['eventId']}")
            print(f"Calendar ID: {CALENDAR_ID}")
            print(f"Updated event data: {event}")
        
            updated_event = calendar_service.events().update(
                calendarId=CALENDAR_ID,
                eventId=timeslot_data['eventId'],
                body=event,
                sendUpdates='all'
            ).execute()
        
            print(f"Calendar event updated: {updated_event['id']}")
        
        except Exception as e:
            print(f"Error updating calendar event: {e}")
            raise
        
        # Update Firestore
        timeslot_ref.update({
            'isAvailable': False,
            'userId': user_id,
            'bookedAt': datetime.utcnow().isoformat()  # Convert to ISO string
        })
        
        # Create appointment record
        appointment_data = {
            'timeslotId': timeslot_id,
            'userId': user_id,
            'startTime': start_time.isoformat(),  # Convert to ISO string
            'endTime': end_time.isoformat(),      # Convert to ISO string
            'status': 'confirmed',
            'createdAt': datetime.utcnow().isoformat()  # Convert to ISO string
        }
            
        appointment_ref = db.collection('appointments').document()
        appointment_ref.set(appointment_data)
        
        # If case_id is provided, update the case with the appointment ID
        if case_id:
            try:
                success = add_appointment_to_case(case_id, appointment_ref.id)
                if not success:
                    print(f"Warning: Failed to add appointment {appointment_ref.id} to case {case_id}")
            except Exception as e:
                print(f"Error adding appointment to case: {str(e)}")
                # Continue with the appointment creation even if adding to case fails
        
        return jsonify({
            "message": "Appointment booked successfully",
            "appointmentId": appointment_ref.id
        }), 201
        
    except Exception as e:
        print(f"Error in book_appointment: {str(e)}")
        return jsonify({"error": str(e)}), 500