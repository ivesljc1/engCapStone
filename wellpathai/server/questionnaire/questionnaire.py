from firebase_admin import firestore
from datetime import datetime
from utils.data_utils import get_user_cases_data
from flask import jsonify

db = firestore.client()


def initialize_questionnaire_database(user_id):
    """
    user_id: str, ID of the user
    Return the ID of the newly created questionnaire
    """

    # Define initial questions

    initial_question = [
        {
            "id": "q1",
            "question": "What brought you here today?",
            "type": "choice",
            "options": ["General Health Advice", "Feeling Unwell"],
            "initialized": True,
        },
        {
            "id": "q2",
            "question": "Have you visited us before for the same reason?",
            "type": "choice",
            "options": ["Yes", "No"],
            "initialized": True
        }
    ]

    general_demographic_questions = [
        {
            "id": "q3",
            "question": "How old are you?",
            "type": "text",
            "initialized": True,
        },
        {
            "id": "q4",
            "question": "What is your gender?",
            "type": "choice",
            "options": ["Male", "Female", "Other", "Prefer not to say"],
            "initialized": True,
        },
        {
            "id": "q5",
            "question": "What is your height?",
            "type": "text",
            "placeholder": "e.g. 6 feet",
            "initialized": True,
        },
        {
            "id": "q6",
            "question": "What is your weight?",
            "type": "text",
            "placeholder": "e.g. 140 lbs",
            "initialized": True,
        },
    ]

    # General health advice specific questions
    general_health_questions = [
        {
            "id": "q7",
            "question": "Did you have any medical conditions before?",
            "type": "text",
            "initialized": True,
        },
        {
            "id": "q8",
            "question": "Are you currently taking any medications?",
            "type": "text",
            "initialized": True,
        },
        {
            "id": "q9",
            "question": "Do you have any allergies?",
            "type": "text",
            "initialized": True,
        },
    ]

    feeling_unwell_questions = [
        {
            "id": "q7",
            "question": "What symptoms are you experiencing?",
            "type": "text",
            "placeholder": "e.g. headache, fever, cough",
            "initialized": True,
        },
        {
            "id": "q8",
            "question": "How long have you been experiencing these symptoms?",
            "type": "choice",
            "options": [
                "Less than 24 hours",
                "1-3 days",
                "4-7 days",
                "More than a week",
            ],
            "initialized": True,
        },
        {
            "id": "q9",
            "question": "Rate your discomfort level",
            "type": "choice",
            "options": ["1", "2", "3", "4", "5"],
            "initialized": True,
        },
        {
            "id": "q10",
            "question": "Do you have any chronic medical conditions?",
            "type": "multiselect",
            "options": [
                "Diabetes",
                "Hypertension",
                "Heart Disease",
                "Asthma",
                "None of Above",
            ],
            "initialized": True,
        },
    ]

    try:
        # Create questions collection
        questions_ref = db.collection("questionnaires").document()
        questions_ref.set(
            {
                "user_id": user_id,
                "createdAt": datetime.now(),
                "updatedAt": datetime.now(),
                "status": "active",
                "questions": initial_question,  # Start with just the branching question
                "generalDemographicQuestions": general_demographic_questions,  # Store these separately
                "generalHealthQuestions": general_health_questions,  # Store these separately
                "feelingUnwellQuestions": feeling_unwell_questions,  # Store these separately
                "currentPath": None,  # Will be set after first answer
                "caseSelectionMade": False,  # Track if user has made a case selection
            }
        )
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

    required_fields = ["question", "type"]
    if not all(field in new_question for field in required_fields):
        return False, "Missing required fields in question"

    # Validate options for choice/multiselect types
    if (
        new_question.get("type") in ["choice", "multiselect"]
        and "options" not in new_question
    ):
        return False, "Options required for choice/multiselect questions"

    try:
        # Get the questionnaire document
        questionnaire_ref = db.collection("questionnaires").document(questionnaire_id)
        questionnaire = questionnaire_ref.get()

        # Verify document exists and belongs to user
        if not questionnaire.exists:
            return False, "Questionnaire not found"

        questionnaire_data = questionnaire.to_dict()
        if questionnaire_data["user_id"] != user_id:
            return False, "Unauthorized access"

        # Get existing questions and add new one
        current_questions = questionnaire_data.get("questions", [])
        new_question["id"] = f"q{len(current_questions) + 1}"
        new_question["initialized"] = False
        current_questions.append(new_question)

        # Update the document
        questionnaire_ref.update(
            {"questions": current_questions, "last_updated": datetime.utcnow()}
        )

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
        questionnaire_ref = db.collection("questionnaires").document(questionnaire_id)
        questionnaire = questionnaire_ref.get()

        if not questionnaire.exists:
            return False, "Questionnaire not found"

        questionnaire_data = questionnaire.to_dict()
        if questionnaire_data["user_id"] != user_id:
            return False, "Unauthorized access"

        # Get questions list
        questions = questionnaire_data.get("questions", [])

        # Find and update the specific question
        for question in questions:
            if question["id"] == question_id:
                # Validate answer based on question type
                if question["type"] == "choice":
                    if answer not in question.get("options", []):
                        return False, "Invalid choice selected"
                elif question["type"] == "multiselect":
                    if not all(a in question.get("options", []) for a in answer):
                        return False, "Invalid options selected"
                # Add answer to the question
                question["answer"] = answer
                break

        # Check if the question was the first question
        if question_id == "q1":
            # Get the demographic questions that should be added for both paths
            demographic_questions = questionnaire_data.get(
                "generalDemographicQuestions", []
            )

            # Add path-specific questions based on the answer
            if answer == "General Health Advice":
                # Set the current path
                questionnaire_ref.update({"currentPath": "generalHealth"})

                # Get the general health questions
                health_questions = questionnaire_data.get("generalHealthQuestions", [])

                # Add demographic questions first, then health questions
                questions.extend(demographic_questions)
                questions.extend(health_questions)

            elif answer == "Feeling Unwell":
                # Set the current path
                questionnaire_ref.update({"currentPath": "feelingUnwell"})

                # Get the feeling unwell questions
                unwell_questions = questionnaire_data.get("feelingUnwellQuestions", [])

                # Add demographic questions first, then unwell questions
                questions.extend(demographic_questions)
                questions.extend(unwell_questions)

            # Remove the question sets from the document to save space
            # since they're now added to the questions array
            questionnaire_ref.update(
                {
                    "generalDemographicQuestions": firestore.DELETE_FIELD,
                    "generalHealthQuestions": firestore.DELETE_FIELD,
                    "feelingUnwellQuestions": firestore.DELETE_FIELD,
                }
            )
        # Handle case selection question
        elif question_id == 'q2':
            if answer == 'Yes':
                # Get user's existing cases
                user_cases = get_user_cases_data(user_id)

                if not user_cases or len(user_cases) == 0:
                    # No existing cases, fall back to creating a new one
                    questionnaire_ref.update(
                        {"caseSelectionMade": True, "selectedAction": "create_new"}
                    )
                else:
                    # Add a new question for case selection
                    case_options = []
                    case_ids = []  # Store IDs separately for index-based lookup

                    # Create options and collect case IDs in parallel
                    for i, case in enumerate(user_cases):
                        # Add index number to make options visually distinct
                        title = case.get("title", f"Case {case.get('id', 'Unknown')}")
                        case_option = f"{i+1}. {title}"

                        case_options.append(case_option)
                        case_ids.append(case.get("id"))

                    case_selection_q = {
                        "id": "q2b",
                        "question": "We have these cases on file, what's the reason for your visit?",
                        "type": "choice",
                        "options": case_options,
                        "case_ids": case_ids,  # Store the IDs list rather than a mapping
                        "initialized": True,
                    }

                    # Add this question after q2
                    questions.insert(questions.index(question) + 1, case_selection_q)
                    
                    questionnaire_ref.update({
                        'caseSelectionMade': False,
                        'selectedAction': 'select_existing'
                    })
            else:  # "No"
                questionnaire_ref.update({
                    'caseSelectionMade': True,
                    'selectedAction': 'create_new'
                })

        # Handle case selection from list
        elif question_id == "q2b":
            # Get the case question with its options and IDs
            case_question = next((q for q in questions if q["id"] == "q2b"), None)

            if case_question and "options" in case_question:
                try:
                    # Find the selected option's index
                    option_index = case_question["options"].index(answer)
                    print(
                        f"Selected option '{answer}' at index {option_index}",
                        flush=True,
                    )

                    # Use the index to get the corresponding case ID
                    if "case_ids" in case_question and option_index < len(
                        case_question["case_ids"]
                    ):
                        case_id = case_question["case_ids"][option_index]
                        print(
                            f"Selected case ID: {case_id} from index {option_index}",
                            flush=True,
                        )

                        questionnaire_ref.update(
                            {"caseSelectionMade": True, "selectedCaseId": case_id}
                        )
                    else:
                        print(
                            f"Error: No case ID found at index {option_index}",
                            flush=True,
                        )

                except ValueError as e:
                    print(
                        f"Error: Option '{answer}' not found in available options",
                        flush=True,
                    )

                    # Add fallback for backward compatibility (for existing data)
                    if "caseMappings" in case_question:
                        case_id = case_question["caseMappings"].get(answer)
                        if case_id:
                            print(
                                f"Fallback: Found case ID using string mapping",
                                flush=True,
                            )
                            questionnaire_ref.update(
                                {"caseSelectionMade": True, "selectedCaseId": case_id}
                            )
                        else:
                            print(
                                f"Fallback failed: No matching case found", flush=True
                            )

        # Update the questions
        questionnaire_ref.update({"questions": questions, "updatedAt": datetime.now()})

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
        questionnaire_ref = db.collection("questionnaires").document(questionnaire_id)
        questionnaire = questionnaire_ref.get()

        if not questionnaire.exists:
            return False, "Questionnaire not found"

        questionnaire_data = questionnaire.to_dict()
        if questionnaire_data["user_id"] != user_id:
            return False, "Unauthorized access"

        # Structure the result
        result = {
            "analysis": result_text,
            "generated_at": datetime.utcnow(),
        }
        # Update the document with the result
        questionnaire_ref.update(
            {"result": result, "last_updated": datetime.utcnow(), "status": "completed"}
        )

        return True, "Result added successfully"

    except Exception as e:
        return False, str(e)


def get_all_questions_in_questionnaire(questionnaire_id, user_id):
    """
    questionnaire_id: str, ID of the questionnaire document
    user_id: str, ID of the user
    """
    try:
        questionnaire_ref = db.collection("questionnaires").document(questionnaire_id)
        questionnaire = questionnaire_ref.get()

        if not questionnaire.exists:
            return False, "Questionnaire not found"

        questionnaire_data = questionnaire.to_dict()
        if questionnaire_data["user_id"] != user_id:
            return False, "Unauthorized access"

        questions = questionnaire_data.get("questions", [])

        return questions

    except Exception as e:
        return False, str(e)


def get_most_recent_question(questionnaire_id, user_id):
    """
    questionnaire_id: str, ID of the questionnaire document
    user_id: str, ID of the user
    """
    try:
        questionnaire_ref = db.collection("questionnaires").document(questionnaire_id)
        questionnaire = questionnaire_ref.get()

        if not questionnaire.exists:
            return {"success": False, "data": None, "error": "Questionnaire not found"}

        questionnaire_data = questionnaire.to_dict()
        if questionnaire_data["user_id"] != user_id:
            return {"success": False, "data": None, "error": "Unauthorized access"}

        questions = questionnaire_data.get("questions", [])

        # Check if we need to process case selection
        if (
            questionnaire_data.get("selectedAction") == "create_new"
            and questionnaire_data.get("caseSelectionMade") == True
        ):
            # If we've answered the case selection question and chosen to create a new case
            # Check if we've already added the demographic and path-specific questions
            if "generalDemographicQuestions" in questionnaire_data:
                # We haven't added these questions yet, so we should add them now
                demographic_questions = questionnaire_data.get(
                    "generalDemographicQuestions", []
                )

                # Get path-specific questions based on the first question's answer
                path_questions = []
                for question in questions:
                    if question["id"] == "q1" and "answer" in question:
                        if question["answer"] == "General Health Advice":
                            path_questions = questionnaire_data.get(
                                "generalHealthQuestions", []
                            )
                            questionnaire_ref.update({"currentPath": "generalHealth"})
                        elif question["answer"] == "Feeling Unwell":
                            path_questions = questionnaire_data.get(
                                "feelingUnwellQuestions", []
                            )
                            questionnaire_ref.update({"currentPath": "feelingUnwell"})
                        break

                # Add demographic questions first, then path-specific questions
                questions.extend(demographic_questions)
                questions.extend(path_questions)

                # Update the document
                questionnaire_ref.update(
                    {
                        "questions": questions,
                        "generalDemographicQuestions": firestore.DELETE_FIELD,
                        "generalHealthQuestions": firestore.DELETE_FIELD,
                        "feelingUnwellQuestions": firestore.DELETE_FIELD,
                    }
                )
        elif (
            questionnaire_data.get("selectedAction") == "select_existing"
            and questionnaire_data.get("caseSelectionMade") == True
        ):
            # User has selected an existing case, handle any special logic needed
            # For now, we'll just continue with the standard question flow
            print(
                "User selected existing case",
                questionnaire_data.get("selectedCaseId"),
                flush=True,
            )

            # Get path-specific questions based on the first question's answer
            path_questions = []
            for question in questions:
                if question["id"] == "q1" and "answer" in question:
                    if question["answer"] == "General Health Advice":
                        path_questions = questionnaire_data.get(
                            "generalHealthQuestions", []
                        )
                        questionnaire_ref.update({"currentPath": "generalHealth"})
                    elif question["answer"] == "Feeling Unwell":
                        path_questions = questionnaire_data.get(
                            "feelingUnwellQuestions", []
                        )
                        questionnaire_ref.update({"currentPath": "feelingUnwell"})
                    break

            # If we still have specialized question sets, add them to the questions list
            if path_questions and "generalDemographicQuestions" in questionnaire_data:
                demographic_questions = questionnaire_data.get(
                    "generalDemographicQuestions", []
                )
                questions.extend(demographic_questions)
                questions.extend(path_questions)

                # Update the document
                questionnaire_ref.update(
                    {
                        "questions": questions,
                        "generalDemographicQuestions": firestore.DELETE_FIELD,
                        "generalHealthQuestions": firestore.DELETE_FIELD,
                        "feelingUnwellQuestions": firestore.DELETE_FIELD,
                    }
                )

        for question in questions:
            if "answer" not in question:
                print("Unanswered question found", question, flush=True)
                if questionnaire_data.get("selectedAction") == "create_new":
                    return {
                        "success": True,
                        "data": question,
                        "new_case_flag": True,
                        "error": None,
                    }
                else:
                    return {
                        "success": True,
                        "data": question,
                        "new_case_flag": False,
                        "error": None,
                        "selectedCaseId": questionnaire_data.get("selectedCaseId"),
                    }
        # No unanswered questions found - indicate need for GPT
        return {"success": False, "data": None, "error": "NO_INITIALIZED_QUESTIONS"}

    except Exception as e:
        return {"success": False, "data": None, "error": str(e)}


def get_next_question(questionnaire_id, user_id):
    """
    Get the next question for the user, either from predefined questions or by generating with GPT.

    Args:
        questionnaire_id (str): ID of the questionnaire
        user_id (str): ID of the user

    Returns:
        dict: Response with next question information
    """
    # First try to get a predefined question
    response = get_most_recent_question(questionnaire_id, user_id)

    if response["success"]:
        # There's a predefined question available
        result = {
            "message": "Answer recorded successfully",
            "next_question": response["data"],
            "new_case_flag": response.get("new_case_flag", False),
        }
        # Only include selectedCaseId if it exists in the response
        if "selectedCaseId" in response:
            result["selected_case_id"] = response["selectedCaseId"]
        return result

    elif response["error"] == "NO_INITIALIZED_QUESTIONS":
        # No predefined questions left, check max questions and possibly generate with GPT
        print("Calling GPT to generate next question", flush=True)

        # Set a maximum number of questions (adjust as needed)
        MAX_QUESTIONS = 18

        # Get all questions to check how many we've already asked
        all_questions = get_all_questions_in_questionnaire(questionnaire_id, user_id)
        question_count = len([q for q in all_questions if "question" in q])

        # Check if we've reached the maximum number of questions
        if question_count >= MAX_QUESTIONS:
            return {
                "message": "Answer recorded successfully. Questionnaire complete.",
                "next_question": None,
                "is_complete": True,
            }

        # Generate with GPT
        gpt_response = call_gpt(questionnaire_id, user_id)
        print("GPT response: ", gpt_response, flush=True)

        if gpt_response and "question" in gpt_response:
            return {
                "message": "Answer recorded and new question generated",
                "next_question": gpt_response,
            }
        else:
            # If GPT generation failed, mark as complete
            return {
                "message": "Answer recorded successfully. Questionnaire complete.",
                "next_question": None,
                "is_complete": True,
            }
    else:
        # Some other error occurred
        return {
            "message": "Answer recorded but couldn't get next question",
            "error": response["error"],
            "next_question": None,
        }


def get_most_recent_result(user_id):
    """
    user_id: str, ID of the user
    """
    try:
        # Reference to the 'questionnaires' collection in the database
        questionnaires_ref = db.collection("questionnaires")

        # Print debug information about the user ID and the reference
        print(f"Searching for completed questionnaires for user: {user_id}", flush=True)

        # Query to find the most recent questionnaire for the user, ordered by creation date in descending order
        # Change this line in get_most_recent_result
        query = (
            questionnaires_ref.where("user_id", "==", str(user_id))
            .order_by("createdAt", direction=firestore.Query.DESCENDING)
            .limit(1)
        )
        # Execute the query and get the results
        questionnaires = query.stream()

        print("Questionnaires: ", questionnaires, flush=True)

        # Iterate through the results
        for questionnaire in questionnaires:
            # Print debug information about the found questionnaire
            print(f"Found questionnaire: {questionnaire.id}", flush=True)

            # Convert the questionnaire document to a dictionary
            questionnaire_data = questionnaire.to_dict()

            # Check if the questionnaire is completed
            if questionnaire_data["status"] == "completed":
                # Return the analysis result if the questionnaire is completed
                return True, questionnaire_data["result"]["analysis"]

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
        questionnaires_ref = db.collection("questionnaires")

        # Print debug information about the user ID and the reference
        print(f"Searching for all results for user: {user_id}", flush=True)
        print("results_ref: ", questionnaires_ref, flush=True)

        # Query to find all results for the user, ordered by creation date in descending order
        query = questionnaires_ref.where("user_id", "==", str(user_id))

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


def call_gpt(questionnaire_id, user_id):
    """
    Call GPT to generate the next question, handle recording in database

    Args:
        questionnaire_id (str): ID of the questionnaire
        user_id (str): ID of the user

    Returns:
        dict: Next question data or error information
    """
    from agents.gpt import (
        generate_next_question,
    )  # Import here to avoid circular imports

    # Get the questionnaire data
    questionnaire_data = get_all_questions_in_questionnaire(questionnaire_id, user_id)

    if not questionnaire_data:
        return {"status": "error", "error": "Failed to retrieve questionnaire data"}

    # Call GPT to generate the next question
    response_data = generate_next_question(questionnaire_data)

    if "question" in response_data:
        # Add the question to the questionnaire
        success, message = add_question_to_questionnaire(
            questionnaire_id, user_id, response_data
        )
        if success:
            return response_data
        else:
            return {"status": "error", "error": message}
    else:
        return {"status": "error", "error": "Unknown response format"}


def record_gpt_conclusion(questionnaire_id, user_id):
    """
    Call GPT to generate a conclusion, handle recording in database

    Args:
        questionnaire_id (str): ID of the questionnaire
        user_id (str): ID of the user

    Returns:
        dict: Conclusion data or error information
    """
    from agents.gpt import generate_conclusion  # Import here to avoid circular imports

    # Get the questionnaire data
    questionnaire_data = get_all_questions_in_questionnaire(questionnaire_id, user_id)

    if not questionnaire_data:
        return {"status": "error", "error": "Failed to retrieve questionnaire data"}

    # Call GPT to generate the conclusion
    response_data = generate_conclusion(questionnaire_data)

    if "conclusion" in response_data:
        # Record the result in the questionnaire
        success, message = record_result_to_questionnaire(
            questionnaire_id, user_id, response_data
        )
        if success:
            return {"status": "success", "message": "Conclusion recorded successfully"}
        else:
            return {"status": "error", "error": message}
    else:
        return {"status": "error", "error": "Unknown response format"}


# Get a questionnaire result by ID
def get_result_by_id(questionnaire_id):
    """
    result_id: str, ID of the result
    """
    try:
        # Reference to the 'questionnaires' collection in the database
        questionnaires_ref = db.collection("questionnaires").document(questionnaire_id)

        # Get the result document
        result = questionnaires_ref.get()

        # Check if the result exists
        if result.exists:
            # Print debug information about the found result
            print(f"Found result: {result.id}", flush=True)

            # Convert the result document to a dictionary
            result_data = result.to_dict()

            # Return the result data
            return result_data

        # Return a message if the result is not found
        return "Result not found"

    except Exception as e:
        # Return an error message if an exception occurs
        return str(e)


# Get a questionnaire result by visit_id
def get_result_by_visit(visit_id):
    """
    visit_id: str, ID of the visit
    """
    try:
        # Reference to the 'visits' collection in the database
        questionnaires_ref = db.collection("visits").document(visit_id)

        # Print debug information about the visit ID
        print(f"Searching for result for visit: {visit_id}", flush=True)

        # Execute the query and get the results
        result = questionnaires_ref.get().to_dict()

        # Return the result data
        return result

    except Exception as e:
        # Return an error message if an exception occurs
        return str(e)
