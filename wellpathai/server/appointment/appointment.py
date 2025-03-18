from firebase_admin import firestore

db = firestore.client()


def get_all_appointments():
    """
    Get all appointments from the database

    Returns:
        list: List of all appointments with their data
    """
    try:
        # Query all appointments from Firestore
        appointments = db.collection("appointments").stream()

        appointment_list = []
        for appointment in appointments:
            appointment_data = appointment.to_dict()
            appointment_data["id"] = appointment.id

            # Format datetime objects for JSON serialization
            for field in ["start_time", "end_time"]:
                if field in appointment_data and hasattr(
                    appointment_data[field], "isoformat"
                ):
                    appointment_data[field] = appointment_data[field].isoformat()

            appointment_list.append(appointment_data)

        return appointment_list
    except Exception as e:
        print(f"Error getting all appointments: {str(e)}", flush=True)
        return None


def get_user_appointments(user_id):
    """
    Get all appointments for a specific user

    Args:
        user_id (str): The ID of the user

    Returns:
        list: List of appointment data for the specified user
    """
    try:
        # Query Firestore for appointments with this user ID
        appointments = db.collection('appointments').where('user_id', '==', user_id).stream()
        appointment_list = []
        for appointment in appointments:
            appointment_data = appointment.to_dict()
            appointment_data["id"] = appointment.id

            # Format datetime objects for JSON serialization
            for field in ["startTime", "endTime", "createdAt", "bookedAt"]:
                if field in appointment_data and hasattr(
                    appointment_data[field], "isoformat"
                ):
                    appointment_data[field] = appointment_data[field].isoformat()

            appointment_list.append(appointment_data)

        # Sort appointments by start time (earliest first)
        appointment_list.sort(key=lambda x: x.get("startTime", ""))

        return appointment_list
    except Exception as e:
        print(f"Error getting user appointments: {str(e)}", flush=True)
        return None


def cancel_appointment(visit_id):
    """
    Return the appointment id and email of the appointment

    Args:
        visit_id (str): The ID of the visit

    Returns:
        str: The ID of the appointment, str: The email of the user
    """
    try:
        # Get the appointment data from Firestore
        visit_ref = (
            db.collection("appointments").where("visit_id", "==", visit_id).stream()
        )

        visit_data = None  # Default if no document is found
        for doc in visit_ref:
            visit_data = doc.to_dict()  # Convert Firestore document to dictionary
            visit_data["id"] = doc.id  # Store Firestore document ID if needed
            break  # Stop after retrieving the first document

        if not visit_data:
            print(f"No appointment found for visit_id: {visit_id}")
            return False  # Return False if no appointment exists

        return visit_data
    except Exception as e:
        print(f"Error cancelling appointment: {str(e)}", flush=True)
        return False
