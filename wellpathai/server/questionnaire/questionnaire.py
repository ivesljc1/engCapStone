from firebase_admin import firestore
from datetime import datetime

from flask import jsonify

db = firestore.client()

def initialize_questionnaire_database(user_id):

    """
    user_id: str, ID of the user
    """

    # Define initial questions

    initial_question = [{
            "id": "q1",
            "question": "What brought you here today?",
            "type": "choice",
            "options": ["General Health Advice", "Feeling Unwell"],
            "initialized": True
    }]
    
    general_demographic_questions = [
        {
            "id": "q2",
            "question": "How old are you?",
            "type": "text",
            "initialized": True
        },
        {
            "id": "q3",
            "question": "What is your gender?",
            "type": "choice",
            "options": ["Male", "Female", "Other", "Prefer not to say"],
            "initialized": True
        },
        {
            "id": "q4",
            "question": "What is your height?",
            "type": "text",
            "placeholder": "e.g. 6 feet",
            "initialized": True
        },
        {
            "id": "q5",
            "question": "What is your weight?",
            "type": "text",
            "placeholder": "e.g. 140 lbs",
            "initialized": True
        }
    ]

    # General health advice specific questions
    general_health_questions = [
        {
            "id": "q6",
            "question": "Did you have any medical conditions before?",
            "type": "text",
            "initialized": True
        },
        {
            "id": "q7",
            "question": "Are you currently taking any medications?",
            "type": "text",
            "initialized": True
        },
        {
            "id": "q8",
            "question": "Do you have any allergies?",
            "type": "text",
            "initialized": True
        }
    ]

    feeling_unwell_questions = [
        {
            "id": "q6",
            "question": "What symptoms are you experiencing?",
            "type": "text",
            "placeholder": "e.g. headache, fever, cough",
            "initialized": True
        },
        {
            "id": "q7",
            "question": "How long have you been experiencing these symptoms?",
            "type": "choice",
            "options": ["Less than 24 hours", "1-3 days", "4-7 days", "More than a week"],
            "initialized": True
        },
        {
            "id": "q8",
            "question": "Rate your discomfort level",
            "type": "choice",
            "options": ["1", "2", "3", "4", "5"],
            "initialized": True
        },
        {
            "id": "q9",
            "question": "Do you have any chronic medical conditions?",
            "type": "multiselect",
            "options": ["Diabetes", "Hypertension", "Heart Disease", "Asthma", "None of Above"],
            "initialized": True
        }
    ]

    try:
        # Create questions collection
        questions_ref = db.collection('questionnaires').document()
        questions_ref.set({
            'user_id': user_id,
            'createdAt': datetime.now(),
            'updatedAt': datetime.now(),
            'status': 'active',
            'questions': initial_question,  # Start with just the branching question
            'generalDemographicQuestions': general_demographic_questions,  # Store these separately
            'generalHealthQuestions': general_health_questions,  # Store these separately
            'feelingUnwellQuestions': feeling_unwell_questions,  # Store these separately
            'currentPath': None,  # Will be set after first answer
        })
        print("Questionnaire database initialized successfully", flush=True)
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
        
        # Check if the question was the first question
        if question_id == 'q1':
            # Get the demographic questions that should be added for both paths
            demographic_questions = questionnaire_data.get('generalDemographicQuestions', [])
            
            # Add path-specific questions based on the answer
            if answer == 'General Health Advice':
                # Set the current path
                questionnaire_ref.update({
                    'currentPath': 'generalHealth'
                })
                
                # Get the general health questions
                health_questions = questionnaire_data.get('generalHealthQuestions', [])
                
                # Add demographic questions first, then health questions
                questions.extend(demographic_questions)
                questions.extend(health_questions)
                
            elif answer == 'Feeling Unwell':
                # Set the current path
                questionnaire_ref.update({
                    'currentPath': 'feelingUnwell'
                })
                
                # Get the feeling unwell questions
                unwell_questions = questionnaire_data.get('feelingUnwellQuestions', [])
                
                # Add demographic questions first, then unwell questions
                questions.extend(demographic_questions)
                questions.extend(unwell_questions)
            
            # Remove the question sets from the document to save space
            # since they're now added to the questions array
            questionnaire_ref.update({
                'generalDemographicQuestions': firestore.DELETE_FIELD,
                'generalHealthQuestions': firestore.DELETE_FIELD,
                'feelingUnwellQuestions': firestore.DELETE_FIELD
            })

        # Update the entire questions list
        questionnaire_ref.update({
            'questions': questions,
            'updatedAt': datetime.now()  # Use consistent field name
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
        print("Questions: ", questions, flush=True)
        
        for question in questions:
            if 'answer' not in question:
                print("Unanswered question found", question, flush=True)
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

# Get all questionnarie results of the user
def get_all_results(user_id):
    """
    user_id: str, ID of the user
    """
    try:
        # Reference to the 'results' collection in the database
        questionnaires_ref = db.collection('questionnaires')
            
        # Print debug information about the user ID and the reference
        print(f"Searching for all results for user: {user_id}", flush=True)
        print("results_ref: ", questionnaires_ref, flush=True)
            
        # Query to find all results for the user, ordered by creation date in descending order
        query = questionnaires_ref.where('user_id', '==', str(user_id))
            
        # Execute the query and get the results
        results = query.stream()
            
        # Initialize an empty list to store the results
        results_list = []
            
        # Iterate through the results
        for result in results:
            # Print debug information about the found result
            print(f"Found result: {result.id}", flush=True)
                
            # Convert the result document to a dictionary
            result_data = result.to_dict()
                
            # Append the result to the list
            results_list.append(result_data)
            
        # Return the list of results
        return results_list
            
    except Exception as e:
        # Return an error message if an exception occurs
        return False, str(e)