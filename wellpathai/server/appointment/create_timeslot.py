from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from datetime import datetime, timedelta
from .calendar_init import calendar_service, CALENDAR_ID  # Import CALENDAR_ID

# Initialize Firestore
db = firestore.client()

# Blueprint for timeslot creation
create_timeslot_blueprint = Blueprint("create_timeslot", __name__)

@create_timeslot_blueprint.route("/api/timeslots/create", methods=["POST"])
def create_timeslot():
    try:
        data = request.get_json()
        
        # Extract data from request
        start_time = data.get('startTime')  # ISO format string
        duration = data.get('duration')  # Duration in minutes
        
        # Validate input
        if not all([start_time, duration]):
            return jsonify({"error": "Missing required fields"}), 400
            
        # Convert start_time string to datetime
        start_datetime = datetime.fromisoformat(start_time)
        end_datetime = start_datetime + timedelta(minutes=int(duration))
        
        # Create event in Google Calendar
        event = {
            'summary': 'Available Appointment Slot',
            'start': {
                'dateTime': start_datetime.isoformat(),
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': end_datetime.isoformat(),
                'timeZone': 'UTC',
            },
            'extendedProperties': {
                'private': {
                    'isAvailable': 'true'
                }
            }
        }
        
        # Insert event to calendar using CALENDAR_ID
        calendar_event = calendar_service.events().insert(
            calendarId=CALENDAR_ID,  # Use CALENDAR_ID instead of 'primary'
            body=event
        ).execute()
        
        # Store timeslot in Firestore
        timeslot_ref = db.collection('timeslots').document()
        timeslot_ref.set({
            'eventId': calendar_event['id'],
            'startTime': start_datetime.isoformat(),
            'endTime': end_datetime.isoformat(),
            'isAvailable': True,
            'createdAt': datetime.utcnow().isoformat()
        })
        
        return jsonify({
            "message": "Timeslot created successfully",
            "timeslotId": timeslot_ref.id,
            "eventId": calendar_event['id']
        }), 201
        
    except Exception as e:
        print(f"Error creating timeslot: {e}")  # Add debug logging
        return jsonify({"error": str(e)}), 500