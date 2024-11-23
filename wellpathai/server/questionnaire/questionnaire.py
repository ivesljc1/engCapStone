from firebase_admin import firestore
from datetime import datetime

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
            "category": "demographics"
        },
        {
            "id": "q2",
            "question": "What is your gender?",
            "type": "choice",
            "options": ["Male", "Female", "Other", "Prefer not to say"],
            "category": "demographics"
        },
        {
            "id": "q3",
            "question": "What is your height?",
            "type": "text",
            "unit": "cm/feet",
            "category": "physical"
        },
        {
            "id": "q4",
            "question": "What is your weight?",
            "type": "text",
            "unit": "kg/lbs",
            "category": "physical"
        },
        {
            "id": "q5",
            "question": "Do you have any chronic medical conditions?",
            "type": "multiselect",
            "options": ["Diabetes", "Hypertension", "Heart Disease", "Asthma", "None"],
            "category": "medical"
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
            'result': None
        })
        print("Questionnaire database initialized successfully")
        return True
    except Exception as e:
        print(f"Error initializing questionnaire database: {str(e)}")
        return False


def add_question_to_questionnaire(questionnaire_id, user_id, new_question): 

    """
    questionnaire_id: str, ID of the questionnaire document\n
    user_id: str, ID of the user\n
    new_question: dict. Required fields: question, type, category, options as list if applicable
    """ 

    required_fields = ['question', 'type', 'category']
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