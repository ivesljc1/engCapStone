from firebase_admin import firestore
from datetime import datetime

db = firestore.client()

def get_questionnaire_data(questionnaire_id, user_id):
    """
    Get all questions from a questionnaire
    
    Args:
        questionnaire_id (str): ID of the questionnaire
        user_id (str): ID of the user
        
    Returns:
        list: List of questions or False with error message
    """
    try:
        questionnaire_ref = db.collection('questionnaires').document(questionnaire_id)
        questionnaire = questionnaire_ref.get()
        
        if not questionnaire.exists:
            return False, "Questionnaire not found"
        
        questionnaire_data = questionnaire.to_dict()
        if questionnaire_data['user_id'] != user_id:
            return False, "Unauthorized access"
        
        questions = questionnaire_data.get('questions', [])
        
        return questions
        
    except Exception as e:
        return False, str(e)

def get_user_cases_data(user_id):
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