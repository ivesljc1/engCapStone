import requests
from datetime import datetime, timedelta

# API endpoint
base_url = "http://localhost:5002"  # Updated to match app.py port

def book_appointment():
    try:
        # First, create a timeslot
        create_timeslot_data = {
            "startTime": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "duration": 30
        }
        
        print(f"\nCreating timeslot with data: {create_timeslot_data}")
        
        # Create timeslot
        create_response = requests.post(
            f"{base_url}/api/timeslots/create",
            json=create_timeslot_data
        )
        
        # Debug output
        print(f"Create Response Status: {create_response.status_code}")
        print(f"Create Response Headers: {create_response.headers}")
        print(f"Create Response Text: {create_response.text}")
        
        if create_response.status_code != 201:
            try:
                error_data = create_response.json()
                print("Failed to create timeslot:", error_data)
            except requests.exceptions.JSONDecodeError:
                print("Failed to create timeslot. Response was not JSON:", create_response.text)
            return
        
        timeslot_id = create_response.json()["timeslotId"]
        print(f"\nCreated timeslot: {timeslot_id}")
        
        # Book the appointment
        booking_data = {
            "timeslotId": timeslot_id,
            "userId": "test_user_123"
        }
        
        print(f"\nBooking appointment with data: {booking_data}")
        
        book_response = requests.post(
            f"{base_url}/api/appointments/book",
            json=booking_data
        )
        
        # Debug output
        print(f"Book Response Status: {book_response.status_code}")
        print(f"Book Response Headers: {book_response.headers}")
        print(f"Book Response Text: {book_response.text}")
        
        if book_response.status_code == 201:
            print("\nAppointment booked successfully!")
            print("Appointment ID:", book_response.json()["appointmentId"])
        else:
            try:
                error_data = book_response.json()
                print("Failed to book appointment:", error_data)
            except requests.exceptions.JSONDecodeError:
                print("Failed to book appointment. Response was not JSON:", book_response.text)

    except requests.exceptions.ConnectionError:
        print(f"Failed to connect to server at {base_url}. Is the server running?")
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}")

if __name__ == "__main__":
    book_appointment()