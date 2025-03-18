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
        appointments = db.collection('appointments').stream()
        
        appointment_list = []
        for appointment in appointments:
            appointment_data = appointment.to_dict()
            appointment_data['id'] = appointment.id
            
            # Format datetime objects for JSON serialization
            for field in ['start_time', 'end_time']:
                if field in appointment_data and hasattr(appointment_data[field], 'isoformat'):
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
        appointments = db.collection('appointments').where('userId', '==', user_id).stream()
        
        appointment_list = []
        for appointment in appointments:
            appointment_data = appointment.to_dict()
            appointment_data['id'] = appointment.id
            
            # Format datetime objects for JSON serialization
            for field in ['startTime', 'endTime', 'createdAt', 'bookedAt']:
                if field in appointment_data and hasattr(appointment_data[field], 'isoformat'):
                    appointment_data[field] = appointment_data[field].isoformat()
                
            appointment_list.append(appointment_data)
            
        # Sort appointments by start time (earliest first)
        appointment_list.sort(key=lambda x: x.get('startTime', ''))
        
        return appointment_list
    except Exception as e:
        print(f"Error getting user appointments: {str(e)}", flush=True)
        return None