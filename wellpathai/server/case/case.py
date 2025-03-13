from firebase_admin import firestore
from datetime import datetime
import uuid
from agents.gpt import generate_case_title

# Initialize Firestore
db = firestore.client()

def create_case(user_id, title=None, description=None):
    """
    Create a new case for a user
    
    Args:
        user_id (str): The ID of the user
        title (str, optional): Title of the case
        description (str, optional): Description of the case
        
    Returns:
        str: The ID of the created case
    """
    try:
        # Generate a default title if none provided
        if not title:
            if description:
                gpt_title = generate_case_title(description)
                if gpt_title:
                    title = gpt_title
                else:
                    title = f"Case {datetime.now().strftime('%Y-%m-%d %H:%M')}"
            else:
                title = f"Case {datetime.now().strftime('%Y-%m-%d %H:%M')}"
            
        # Create case document
        case_data = {
            'userId': user_id,
            'title': title,
            'description': description,
            'createdAt': datetime.now(),
            'updatedAt': datetime.now(),
            'status': 'active',  # active, closed
            'appointments': [],
            'questionnaires': [],
            'results': [],
            'reports': []
        }
        
        # Add to Firestore
        case_ref = db.collection('cases').document()
        case_ref.set(case_data)
        
        # Also add to user's cases list
        user_ref = db.collection('users').document(user_id)
        user_ref.update({
            'cases': firestore.ArrayUnion([case_ref.id])
        })
        
        return case_ref.id
    except Exception as e:
        print(f"Error creating case: {str(e)}")
        return None

def get_case(case_id):
    """
    Get a case by ID
    
    Args:
        case_id (str): The ID of the case
        
    Returns:
        dict: The case data
    """
    try:
        case_ref = db.collection('cases').document(case_id)
        case = case_ref.get()
        
        if case.exists:
            case_data = case.to_dict()
            case_data['id'] = case_id
            return case_data
        else:
            return None
    except Exception as e:
        print(f"Error getting case: {str(e)}")
        return None

def get_user_cases(user_id):
    """
    Get all cases for a user
    
    Args:
        user_id (str): The ID of the user
        
    Returns:
        list: List of case data
    """
    try:
        cases = db.collection('cases').where('userId', '==', user_id).stream()
        
        case_list = []
        for case in cases:
            case_data = case.to_dict()
            case_data['id'] = case.id
            case_list.append(case_data)
            
        # Sort by updated time (newest first)
        case_list.sort(key=lambda x: x.get('updatedAt', datetime.min), reverse=True)
        
        return case_list if case_list else []
    except Exception as e:
        print(f"Error getting user cases: {str(e)}")
        return []

def update_case(case_id, data):
    """
    Update a case
    
    Args:
        case_id (str): The ID of the case
        data (dict): The data to update
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Don't allow updating certain fields directly
        if 'userId' in data:
            del data['userId']
        if 'createdAt' in data:
            del data['createdAt']
            
        # Always update the updatedAt timestamp
        data['updatedAt'] = datetime.now()
        
        case_ref = db.collection('cases').document(case_id)
        case_ref.update(data)
        
        return True
    except Exception as e:
        print(f"Error updating case: {str(e)}")
        return False

def add_appointment_to_case(case_id, appointment_id):
    """
    Add an appointment to a case
    
    Args:
        case_id (str): The ID of the case
        appointment_id (str): The ID of the appointment
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Update case with appointment ID
        case_ref = db.collection('cases').document(case_id)
        case = case_ref.get()
        
        if not case.exists:
            print(f"Case {case_id} does not exist")
            return False
            
        case_ref.update({
            'appointments': firestore.ArrayUnion([appointment_id]),
            'updatedAt': datetime.now()
        })
        
        # Update appointment with case ID
        appointment_ref = db.collection('appointments').document(appointment_id)
        appointment = appointment_ref.get()
        
        if not appointment.exists:
            print(f"Appointment {appointment_id} does not exist")
            # Rollback the case update
            case_ref.update({
                'appointments': firestore.ArrayRemove([appointment_id])
            })
            return False
            
        appointment_ref.update({
            'caseId': case_id,
            'updatedAt': datetime.now()
        })
        
        print(f"Successfully linked appointment {appointment_id} to case {case_id}")
        return True
    except Exception as e:
        print(f"Error adding appointment to case: {str(e)}")
        return False

def add_questionnaire_to_case(case_id, questionnaire_id):
    """
    Add a questionnaire to a case
    
    Args:
        case_id (str): The ID of the case
        questionnaire_id (str): The ID of the questionnaire
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Update case with questionnaire ID
        case_ref = db.collection('cases').document(case_id)
        case = case_ref.get()
        
        if not case.exists:
            print(f"Case {case_id} does not exist")
            return False
            
        case_ref.update({
            'questionnaires': firestore.ArrayUnion([questionnaire_id]),
            'updatedAt': datetime.now()
        })
        
        # Update questionnaire with case ID
        questionnaire_ref = db.collection('questionnaires').document(questionnaire_id)
        questionnaire = questionnaire_ref.get()
        
        if not questionnaire.exists:
            print(f"Questionnaire {questionnaire_id} does not exist")
            # Rollback the case update
            case_ref.update({
                'questionnaires': firestore.ArrayRemove([questionnaire_id])
            })
            return False
            
        questionnaire_ref.update({
            'caseId': case_id,
            'updatedAt': datetime.now()
        })
        
        print(f"Successfully linked questionnaire {questionnaire_id} to case {case_id}")
        return True
    except Exception as e:
        print(f"Error adding questionnaire to case: {str(e)}")
        return False


def add_result_to_case(case_id, result_id):
    """
    Add a result to a case (bidirectional update)
    
    Args:
        case_id (str): The ID of the case
        result_id (str): The ID of the result
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # 1. Update case with result ID
        case_ref = db.collection('cases').document(case_id)
        case = case_ref.get()
        
        if not case.exists:
            print(f"Case {case_id} does not exist")
            return False
            
        case_ref.update({
            'results': firestore.ArrayUnion([result_id]),
            'updatedAt': datetime.now()
        })
        
        # 2. Update result with case ID
        result_ref = db.collection('results').document(result_id)
        result = result_ref.get()
        
        if not result.exists:
            print(f"Result {result_id} does not exist")
            # Rollback the case update
            case_ref.update({
                'results': firestore.ArrayRemove([result_id])
            })
            return False
            
        result_ref.update({
            'caseId': case_id,
            'updatedAt': datetime.now()
        })
        
        print(f"Successfully linked result {result_id} to case {case_id}")
        return True
    except Exception as e:
        print(f"Error adding result to case: {str(e)}")
        return False

def add_report_to_case(case_id, report_id):
    """
    Add a report to a case (bidirectional update)
    
    Args:
        case_id (str): The ID of the case
        report_id (str): The ID of the report
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # 1. Update case with report ID
        case_ref = db.collection('cases').document(case_id)
        case = case_ref.get()
        
        if not case.exists:
            print(f"Case {case_id} does not exist")
            return False
            
        case_ref.update({
            'reports': firestore.ArrayUnion([report_id]),
            'updatedAt': datetime.now()
        })
        
        # 2. Update report with case ID
        report_ref = db.collection('reports').document(report_id)
        report = report_ref.get()
        
        if not report.exists:
            print(f"Report {report_id} does not exist")
            # Rollback the case update
            case_ref.update({
                'reports': firestore.ArrayRemove([report_id])
            })
            return False
            
        report_ref.update({
            'caseId': case_id,
            'updatedAt': datetime.now()
        })
        
        print(f"Successfully linked report {report_id} to case {case_id}")
        return True
    except Exception as e:
        print(f"Error adding report to case: {str(e)}")
        return False

def get_case_questionnaires(case_id):
    """
    Get all questionnaires for a case
    
    Args:
        case_id (str): The ID of the case
        
    Returns:
        list: List of questionnaire data
    """
    try:
        # Check if case exists
        case_ref = db.collection('cases').document(case_id)
        case = case_ref.get()
        
        if not case.exists:
            return None
            
        # Query Firestore for questionnaires with this case ID
        questionnaires = db.collection('questionnaires').where('caseId', '==', case_id).stream()
        
        questionnaire_list = []
        for questionnaire in questionnaires:
            questionnaire_data = questionnaire.to_dict()
            questionnaire_data['id'] = questionnaire.id
            
            # Format datetime objects for JSON serialization
            if 'createdAt' in questionnaire_data and hasattr(questionnaire_data['createdAt'], 'isoformat'):
                questionnaire_data['createdAt'] = questionnaire_data['createdAt'].isoformat()
                
            questionnaire_list.append(questionnaire_data)
            
        return questionnaire_list
    except Exception as e:
        print(f"Error getting case questionnaires: {str(e)}")
        return None

def get_case_appointments(case_id):
    """
    Get all appointments for a case
    
    Args:
        case_id (str): The ID of the case
        
    Returns:
        list: List of appointment data
    """
    try:
        # Check if case exists
        case_ref = db.collection('cases').document(case_id)
        case = case_ref.get()
        
        if not case.exists:
            return None
            
        # Query Firestore for appointments with this case ID
        appointments = db.collection('appointments').where('caseId', '==', case_id).stream()
        
        appointment_list = []
        for appointment in appointments:
            appointment_data = appointment.to_dict()
            appointment_data['id'] = appointment.id
            
            # Format datetime objects for JSON serialization
            for field in ['startTime', 'endTime', 'createdAt', 'bookedAt']:
                if field in appointment_data and hasattr(appointment_data[field], 'isoformat'):
                    appointment_data[field] = appointment_data[field].isoformat()
                
            appointment_list.append(appointment_data)
            
        return appointment_list
    except Exception as e:
        print(f"Error getting case appointments: {str(e)}")
        return None


def close_case(case_id):
    """
    Close a case
    
    Args:
        case_id (str): The ID of the case
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        case_ref = db.collection('cases').document(case_id)
        case_ref.update({
            'status': 'closed',
            'updatedAt': datetime.now()
        })
        
        return True
    except Exception as e:
        print(f"Error closing case: {str(e)}")
        return False

def reopen_case(case_id):
    """
    Reopen a closed case
    
    Args:
        case_id (str): The ID of the case
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        case_ref = db.collection('cases').document(case_id)
        case_ref.update({
            'status': 'active',
            'updatedAt': datetime.now()
        })
        
        return True
    except Exception as e:
        print(f"Error reopening case: {str(e)}")
        return False

def delete_case(case_id):
    """
    Delete a case
    
    Args:
        case_id (str): The ID of the case
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Get the case to find the user ID
        case_ref = db.collection('cases').document(case_id)
        case = case_ref.get()
        
        if not case.exists:
            return False
            
        case_data = case.to_dict()
        user_id = case_data.get('userId')
        
        # Remove case from user's cases list
        if user_id:
            user_ref = db.collection('users').document(user_id)
            user_ref.update({
                'cases': firestore.ArrayRemove([case_id])
            })
        
        # Delete the case
        case_ref.delete()
        
        return True
    except Exception as e:
        print(f"Error deleting case: {str(e)}")
        return False
