import requests
import json
from datetime import datetime

# API endpoint
base_url = "http://localhost:5002"

def test_case_service():
    """
    Test the case service by creating a case, adding items to it, and retrieving it
    """
    try:
        # 1. Create a test user (if needed)
        user_id = "3kwzcrjxbSNe2epjo3DmYLnxAIp1"  # Use an existing test user ID
        
        # 2. Create a new case
        print("\n=== Creating a new case ===")
        create_case_data = {
            "userId": user_id,
            "title": "Test Case",
            "description": "This is a test case for the case service"
        }
        
        create_response = requests.post(
            f"{base_url}/api/cases/create",
            json=create_case_data
        )
        
        print(f"Create Case Response Status: {create_response.status_code}")
        print(f"Create Case Response: {create_response.text}")
        
        if create_response.status_code != 201:
            print("Failed to create case")
            return
        
        case_id = create_response.json()["caseId"]
        print(f"Created case with ID: {case_id}")
        
        # 3. Initialize a questionnaire for the case
        print("\n=== Initializing a questionnaire for the case ===")
        init_questionnaire_data = {
            "user_id": user_id
        }
        
        init_response = requests.post(
            f"{base_url}/api/questionnaire/initialize",
            json=init_questionnaire_data
        )
        
        print(f"Init Questionnaire Response Status: {init_response.status_code}")
        print(f"Init Questionnaire Response: {init_response.text}")
        
        if init_response.status_code != 201:
            print("Failed to initialize questionnaire")
            return
        
        questionnaire_id = init_response.json()["questionnaire_id"]
        print(f"Initialized questionnaire with ID: {questionnaire_id}")
        
        # 4. Record an answer to the first question
        print("\n=== Recording an answer to the first question ===")
        record_answer_data = {
            "questionnaire_id": questionnaire_id,
            "user_id": user_id,
            "question_id": "q1",
            "answer": "General Health Advice",
            "case_id": case_id
        }
        
        record_response = requests.post(
            f"{base_url}/api/questionnaire/record-answer",
            json=record_answer_data
        )
        
        print(f"Record Answer Response Status: {record_response.status_code}")
        print(f"Record Answer Response: {record_response.text}")
        
        # 5. Create a timeslot
        print("\n=== Creating a timeslot ===")
        create_timeslot_data = {
            "startTime": (datetime.utcnow().isoformat()),
            "duration": 30
        }
        
        timeslot_response = requests.post(
            f"{base_url}/api/timeslots/create",
            json=create_timeslot_data
        )
        
        print(f"Create Timeslot Response Status: {timeslot_response.status_code}")
        print(f"Create Timeslot Response: {timeslot_response.text}")
        
        if timeslot_response.status_code != 201:
            print("Failed to create timeslot")
            return
        
        timeslot_id = timeslot_response.json()["timeslotId"]
        print(f"Created timeslot with ID: {timeslot_id}")
        
        # 6. Book an appointment for the case
        print("\n=== Booking an appointment for the case ===")
        book_appointment_data = {
            "timeslotId": timeslot_id,
            "userId": user_id,
            "caseId": case_id
        }
        
        book_response = requests.post(
            f"{base_url}/api/appointments/book",
            json=book_appointment_data
        )
        
        print(f"Book Appointment Response Status: {book_response.status_code}")
        print(f"Book Appointment Response: {book_response.text}")
        
        if book_response.status_code != 201:
            print("Failed to book appointment")
            return
        
        appointment_id = book_response.json()["appointmentId"]
        print(f"Booked appointment with ID: {appointment_id}")
        
        # 7. Get the case details
        print("\n=== Getting case details ===")
        case_response = requests.get(f"{base_url}/api/cases/{case_id}")
        
        print(f"Get Case Response Status: {case_response.status_code}")
        print(f"Get Case Response: {json.dumps(case_response.json(), indent=2)}")
        
        # 8. Get all cases for the user
        print("\n=== Getting all cases for the user ===")
        user_cases_response = requests.get(f"{base_url}/api/cases/user/{user_id}")
        
        print(f"Get User Cases Response Status: {user_cases_response.status_code}")
        print(f"Get User Cases Response: {json.dumps(user_cases_response.json(), indent=2)}")

        # 11. Close the case
        print("\n=== Closing the case ===")
        close_response = requests.post(f"{base_url}/api/cases/{case_id}/close")
        
        print(f"Close Case Response Status: {close_response.status_code}")
        print(f"Close Case Response: {close_response.text}")
        
        # 12. Reopen the case
        print("\n=== Reopening the case ===")
        reopen_response = requests.post(f"{base_url}/api/cases/{case_id}/reopen")
        
        print(f"Reopen Case Response Status: {reopen_response.status_code}")
        print(f"Reopen Case Response: {reopen_response.text}")
        
        print("\n=== Test completed successfully ===")
        
    except requests.exceptions.ConnectionError:
        print(f"Failed to connect to server at {base_url}. Is the server running?")
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}")

if __name__ == "__main__":
    test_case_service()