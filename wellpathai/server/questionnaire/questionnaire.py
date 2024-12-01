from firebase_admin import firestore
from datetime import datetime

from flask import jsonify

db = firestore.client()

def initialize_questionnaire_database(user_id):

    """
    user_id: str, ID of the user
    """

    # Define initial questions
    initial_questions = [
        {
            "id": "q1",
            "question": "How old are you?",
            "type": "text",
            "initialized": True
        },
        {
            "id": "q2",
            "question": "What is your gender?",
            "type": "choice",
            "options": ["Male", "Female", "Other", "Prefer not to say"],
            "initialized": True
        },
        {
            "id": "q3",
            "question": "What is your height?",
            "type": "text",
            "placeholder": "ex. 6 feet",
            "initialized": True
        },
        {
            "id": "q4",
            "question": "What is your weight?",
            "type": "text",
            "placeholder": "ex. 140 lbs",
            "initialized": True
        },
        {
            "id": "q5",
            "question": "Do you have any chronic medical conditions?",
            "type": "multiselect",
            "options": ["Diabetes", "Hypertension", "Heart Disease", "Asthma", "None"],
            "initialized": True
        }
    ]

    try:
        # Create questions collection
        questions_ref = db.collection('questionnaires').document()
        questions_ref.set({
            'user_id': user_id,
            'questions': initial_questions,
            'created_at': datetime.utcnow(),
            'last_updated': datetime.utcnow(),
            'status': 'in progress',
            'result': None
        })
        print("Questionnaire database initialized successfully")
        return questions_ref.id
    except Exception as e:
        print(f"Error initializing questionnaire database: {str(e)}")
        return False


def add_question_to_questionnaire(questionnaire_id, user_id, new_question): 

    """
    questionnaire_id: str, ID of the questionnaire document\n
    user_id: str, ID of the user\n
    new_question: dict. Required fields: question, type, options as list if applicable
    """ 

    required_fields = ['question', 'type']
    if not all(field in new_question for field in required_fields):
        return False, "Missing required fields in question"
    
    # Validate options for choice/multiselect types
    if new_question.get('type') in ['choice', 'multiselect'] and 'options' not in new_question:
        return False, "Options required for choice/multiselect questions"

    try:
        # Get the questionnaire document
        questionnaire_ref = db.collection('questionnaires').document(questionnaire_id)
        questionnaire = questionnaire_ref.get()
        
        # Verify document exists and belongs to user
        if not questionnaire.exists:
            return False, "Questionnaire not found"
        
        questionnaire_data = questionnaire.to_dict()
        if questionnaire_data['user_id'] != user_id:
            return False, "Unauthorized access"
        
        # Get existing questions and add new one
        current_questions = questionnaire_data.get('questions', [])
        new_question['id'] = f"q{len(current_questions) + 1}"
        new_question["initialized"] = False
        current_questions.append(new_question)
        
        # Update the document
        questionnaire_ref.update({
            'questions': current_questions,
            'last_updated': datetime.utcnow()
        })
        
        return True, "Question added successfully"
        
    except Exception as e:
        return False, str(e)
    

def record_answer_to_question(questionnaire_id, user_id, question_id, answer):
    """
    questionnaire_id: str, ID of the questionnaire document\n
    user_id: str, ID of the user\n
    question_id: str, with format 'q1', 'q2', etc.\n
    answer: str or obj, Answer to the question
    """
    try:
        questionnaire_ref = db.collection('questionnaires').document(questionnaire_id)
        questionnaire = questionnaire_ref.get()
        
        if not questionnaire.exists:
            return False, "Questionnaire not found"
        
        questionnaire_data = questionnaire.to_dict()
        if questionnaire_data['user_id'] != user_id:
            return False, "Unauthorized access"
        
        # Get questions list
        questions = questionnaire_data.get('questions', [])
        
        # Find and update the specific question
        for question in questions:
            if question['id'] == question_id:
                # Validate answer based on question type
                if question['type'] == 'choice':
                    if answer not in question.get('options', []):
                        return False, "Invalid choice selected"
                elif question['type'] == 'multiselect':
                    if not all(a in question.get('options', []) for a in answer):
                        return False, "Invalid options selected"
                
                # Add answer to the question
                question['answer'] = answer
                break
        else:
            return False, "Question not found"
        
        # Update the entire questions list
        questionnaire_ref.update({
            'questions': questions,
            'last_updated': datetime.utcnow()
        })
        
        return True, "Answer recorded successfully"
        
    except Exception as e:
        return False, str(e)


def record_result_to_questionnaire(questionnaire_id, user_id, result_text):
    """
    questionnaire_id: str, ID of the questionnaire document
    user_id: str, ID of the user
    result_text: str, Textual result of the questionnaire analysis
    """
    try:
        questionnaire_ref = db.collection('questionnaires').document(questionnaire_id)
        questionnaire = questionnaire_ref.get()
        
        if not questionnaire.exists:
            return False, "Questionnaire not found"
        
        questionnaire_data = questionnaire.to_dict()
        if questionnaire_data['user_id'] != user_id:
            return False, "Unauthorized access"
        
        # Structure the result
        result = {
            'analysis': result_text,
            'generated_at': datetime.utcnow(),
        }
        # Update the document with the result
        questionnaire_ref.update({
            'result': result,
            'last_updated': datetime.utcnow(),
            'status': 'completed'
        })
        
        return True, "Result added successfully"
        
    except Exception as e:
        return False, str(e)
    
def get_all_questions_in_questionnaire(questionnaire_id, user_id):
    """
    questionnaire_id: str, ID of the questionnaire document
    user_id: str, ID of the user
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
    
def get_most_recent_question(questionnaire_id, user_id):
    """
    questionnaire_id: str, ID of the questionnaire document
    user_id: str, ID of the user
    """
    try:
        questionnaire_ref = db.collection('questionnaires').document(questionnaire_id)
        questionnaire = questionnaire_ref.get()
        
        if not questionnaire.exists:
            return { "success": False, "data": None,"error": "Questionnaire not found" }
        
        questionnaire_data = questionnaire.to_dict()
        if questionnaire_data['user_id'] != user_id:
            return { "success": False, "data": None, "error": "Unauthorized access" }
        
        questions = questionnaire_data.get('questions', [])
        
        for question in questions:
            if 'answer' not in question:
                return { "success": True, "data": question, "error": None }
        
        # No unanswered questions found - indicate need for GPT
        return { "success": False, "data": None, "error": "NO_INITIALIZED_QUESTIONS" }
        
    except Exception as e:
        return { "success": False, "data": None, "error": str(e) }

def get_most_recent_result(user_id):
    """
    user_id: str, ID of the user
    """
    try:
        # Reference to the 'questionnaires' collection in the database
        questionnaires_ref = db.collection('questionnaires')
        
        # Print debug information about the user ID and the reference
        print(f"Searching for completed questionnaires for user: {user_id}", flush=True)
        print("questionnaires_ref: ", questionnaires_ref, flush=True)
        
        # Query to find the most recent questionnaire for the user, ordered by creation date in descending order
        query = questionnaires_ref.where('user_id', '==', str(user_id)).order_by('created_at', direction=firestore.Query.DESCENDING).limit(1)
        
        # Execute the query and get the results
        questionnaires = query.stream()
        
        # Iterate through the results
        for questionnaire in questionnaires:
            # Print debug information about the found questionnaire
            print(f"Found questionnaire: {questionnaire.id}", flush=True)
            
            # Convert the questionnaire document to a dictionary
            questionnaire_data = questionnaire.to_dict()
            
            # Check if the questionnaire is completed
            if questionnaire_data['status'] == 'completed':
                # Return the analysis result if the questionnaire is completed
                return True, questionnaire_data['result']['analysis']
        
        # Return a message if no completed questionnaires are found
        return False, "No completed questionnaires found"
        
    except Exception as e:
        # Return an error message if an exception occurs
        return False, str(e)
