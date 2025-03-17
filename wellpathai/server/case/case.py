from firebase_admin import firestore
from datetime import datetime
import uuid
from agents.gpt import generate_case_title
from utils.data_utils import get_questionnaire_data
# Initialize Firestore
db = firestore.client()

def create_case(user_id, questionnaire_id, title=None, description=None):
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
            questionnaire_data = get_questionnaire_data(questionnaire_id, user_id)
            gpt_description, gpt_title = generate_case_title(questionnaire_data)
            if gpt_title and gpt_description:
                title = gpt_title
                description = gpt_description
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
            'visits': [],
        }
        
        # Add to Firestore
        case_ref = db.collection('cases').document()
        case_ref.set(case_data)
        
        # Also add to user's cases list
        user_ref = db.collection('users').document(user_id)
        user_ref.update({
            'cases': firestore.ArrayUnion([case_ref.id])
        })
        
        print(f"Case created successfully: {case_ref.id}", flush=True)
        
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

def add_visit_to_case(case_id, visit_id):
    """
    Add a visit to a case
    
    Args:
        case_id (str): The ID of the case
        visit_id (str): The ID of the visit
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Update case with visit ID
        case_ref = db.collection('cases').document(case_id)
        case = case_ref.get()
        
        if not case.exists:
            print(f"Case {case_id} does not exist")
            return False
            
        case_ref.update({
            'visits': firestore.ArrayUnion([visit_id]),
            'updatedAt': datetime.now()
        })
        
        # Update visit with case ID
        visit_ref = db.collection('visits').document(visit_id)
        visit = visit_ref.get()
        
        if not visit.exists:
            print(f"Visit {visit_id} does not exist")
            # Rollback the case update
            case_ref.update({
                'visits': firestore.ArrayRemove([visit_id])
            })
            return False
            
        visit_ref.update({
            'caseId': case_id,
            'updatedAt': datetime.now()
        })
        
        print(f"Successfully linked visit {visit_id} to case {case_id}")
        return True
    except Exception as e:
        print(f"Error adding visit to case: {str(e)}")
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

# Get All Case title, case description, number of hasNewReport in the visit belong to the case, the last visit date, total number of visits and case id
def get_case_summary(user_id):
    """
    Get all case summary
    
    Args:
        user_id (str): The ID of the user
        
    Returns:
        list: List of case summary data
    """
    try:
        # Query Firestore for cases with this user ID
        cases = db.collection('cases').where('userId', '==', user_id).stream()
        
        case_list = []
        for case in cases:
            case_data = case.to_dict()
            case_data['id'] = case.id
            
            # Get all visits for this case
            visits = db.collection('visits').where('caseId', '==', case.id).stream()
            visit_count = 0
            new_report_count = 0
            last_visit_date = None
            
            for visit in visits:
                visit_data = visit.to_dict()
                visit_count += 1
                
                if visit_data.get('hasNewReport'):
                    new_report_count += 1
                    
                visit_date = visit_data.get('visitDate')  # visitDate is already a string
                
                # Update last visit date only if it's more recent
                if visit_date and (not last_visit_date or visit_date > last_visit_date):
                    last_visit_date = visit_date  # Store it as a string without isoformat()

            case_data['visitCount'] = visit_count
            case_data['newReportCount'] = new_report_count
            case_data['lastVisitDate'] = last_visit_date  # No need to convert to ISO format
            
            print(f"Case data: {case_data}", flush=True)
            
            case_list.append(case_data)
            
        return case_list
    except Exception as e:
        print(f"Error getting case summary: {str(e)}")
        return None
