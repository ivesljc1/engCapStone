from flask import Blueprint, request, jsonify
import hmac
import hashlib
import firebase_admin
import pytz
from datetime import datetime
from firebase_admin import credentials, firestore

# Initialize Firebase (only once in the main app)
db = firestore.client()

# Define Blueprint
webhook_bp = Blueprint("webhooks", __name__)

@webhook_bp.route('/api/cal-webhook', methods=['POST'])
def cal_webhook():
    """Handle incoming webhooks from Cal.com."""

    data = request.get_json()
    print(data, flush=True)

    if not data or "payload" not in data:
        return jsonify({"error": "Invalid payload"}), 400

    # Extract event type
    event_type = data.get("triggerEvent")  # "BOOKING_CREATED" or "BOOKING_CANCELLED"

    # Extract appointment details from payload
    payload = data["payload"]
    event_id = payload.get("uid")
    event_name = payload.get("eventTitle", "Unknown Event")
    start_time_utc = payload.get("startTime")
    end_time_utc = payload.get("endTime")
    cancellation_reason = payload.get("cancellationReason", "No reason provided")
    status = payload.get("status", "Unknown")

    attendees = payload.get("attendees", [])
    if attendees:
        attendee = attendees[0]
        attendee_email = attendee.get("email", "Unknown")
        attendee_name = attendee.get("name", "Unknown")
        attendee_timezone = attendee.get("timeZone", "UTC")
    else:
        attendee_email = "Unknown"
        attendee_name = "Unknown"
        attendee_timezone = "UTC"

    # Convert UTC time to attendee's time zone
    try:
        utc_tz = pytz.utc
        user_tz = pytz.timezone(attendee_timezone)

        # Convert start time
        start_dt_utc = datetime.fromisoformat(start_time_utc.replace("Z", "+00:00"))
        start_dt_local = start_dt_utc.astimezone(user_tz)
        start_time_local = start_dt_local.strftime("%Y-%m-%d %H:%M:%S %Z")

        # Convert end time
        end_dt_utc = datetime.fromisoformat(end_time_utc.replace("Z", "+00:00"))
        end_dt_local = end_dt_utc.astimezone(user_tz)
        end_time_local = end_dt_local.strftime("%Y-%m-%d %H:%M:%S %Z")

    except Exception as e:
        print(f"⚠️ Time conversion error: {e}", flush=True)
        start_time_local = start_time_utc
        end_time_local = end_time_utc

    if event_type == "BOOKING_CREATED":
        db.collection("appointments").document(event_id).set({
            "event_id": event_id,
            "email": attendee_email,
            "name": attendee_name,
            "start_time": start_time_local,
            "end_time": end_time_local,
            "event_name": event_name,
            "time_zone": attendee_timezone,
            "status": "confirmed",
        })
        print(f"✅ Appointment Created: {event_id} (Local Time: {start_time_local} - {end_time_local})", flush=True)

    elif event_type == "BOOKING_CANCELLED":
        db.collection("appointments").document(event_id).update({
            "status": "canceled",
            "cancellation_reason": cancellation_reason,
            "time_zone": attendee_timezone,
            "start_time": start_time_local,
            "end_time": end_time_local,
        })
        print(f"❌ Appointment Canceled: {event_id} (Local Time: {start_time_local} - {end_time_local})", flush=True)

    return jsonify({"status": "success"}), 200