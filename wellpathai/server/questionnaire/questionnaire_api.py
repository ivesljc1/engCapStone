from flask import Blueprint, request, jsonify
from questionnaire.questionnaire import (
    initialize_questionnaire_database, 
    get_gpt_conclusion,
    record_answer_to_question,
    get_next_question, 
    get_most_recent_question,
    get_most_recent_result,
    get_all_questions_in_questionnaire,
    get_all_results,
    handle_case_selection,
    handle_user_pick_previous_case,
    get_next_question,
    CASE_SELECTION_QUESTION
)


"""
# Blueprint for questionnaire route
# Only Call GPT-4o mini to generate the next question is usefull, others are for api testing
"""

questionnaire_blueprint = Blueprint("questionnaire", __name__)

# Add route to blueprint
@questionnaire_blueprint.route("/api/questionnaire/case-selection", methods=["GET"])
def get_case_selection():
    """Get the user's case selection question"""
    return jsonify(CASE_SELECTION_QUESTION), 200


@questionnaire_blueprint.route("/api/questionnaire/case-selection", methods=["POST"])
def case_selection():
    """Handle the user's case selection"""
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415
        
    data = request.get_json()
    user_id = data.get("user_id")
    selection = data.get("selection")
    
    if not all([user_id, selection]):
        return jsonify({"error": "user_id and selection are required"}), 400
        
    response = handle_case_selection(user_id, selection)
    
    if response.get("success"):
        return jsonify(response), 200
    else:
        return jsonify({"error": response.get("error")}), 500

@questionnaire_blueprint.route("/api/questionnaire/select-previsoucase", methods=["POST"])
def select_case():
    """Handle the user selecting a previous case"""
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415
        
    data = request.get_json()
    user_id = data.get("user_id")
    case_id = data.get("case_id")
    
    if not all([user_id, case_id]):
        return jsonify({"error": "user_id and case_id are required"}), 400
        
    response = handle_user_pick_previous_case(user_id, case_id)
    
    if response.get("success"):
        return jsonify(response), 200
    else:
        return jsonify({"error": response.get("error")}), 500

# Initialize the questionnaire database for a user
@questionnaire_blueprint.route("/api/questionnaire/initialize", methods=["POST"])
def init_questionnaire():
    # Validate content type
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415

    data = request.get_json()
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    
    doc_id = initialize_questionnaire_database(user_id)
    
    if doc_id:
        # Get the first question to return with the response
        firstQ = get_most_recent_question(doc_id, user_id)

        return jsonify({
            "message": "Questionnaire initialized successfully",
            "questionnaire_id": doc_id,
            "first_question": firstQ
        }), 201
        
    return jsonify({"error": "Failed to initialize questionnaire"}), 500

# Records an answer to a specific question in the questionnaire
@questionnaire_blueprint.route("/api/questionnaire/record-answer", methods=["POST"])
def record_answer():
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415
    
    data = request.get_json()
    questionnaire_id = data.get("questionnaire_id")
    user_id = data.get("user_id")
    question_id = data.get("question_id")
    answer = data.get("answer")
    case_id = data.get("case_id")  # Optional case ID
    
    if not all([questionnaire_id, user_id, question_id, answer]):
        return jsonify({"error": "questionnaire_id, user_id, question_id, and answer are required"}), 400
    
    success, message = record_answer_to_question(questionnaire_id, user_id, question_id, answer)
    
    if not success:
        return jsonify({"error": "Failed to record answer"}), 500
    
    # Get the next question (reusing logic from get_newest_question)
    response = get_next_question(questionnaire_id, user_id)
    
    # 4. Return the appropriate response based on the result
    return jsonify(response), 200

#get questions in questionnaire
@questionnaire_blueprint.route("/api/questionnaire/get-all-questions", methods=["GET"])
def get_questions():
    questionnaire_id = request.args.get("questionnaire_id")
    user_id = request.args.get("user_id")
    
    if not all([questionnaire_id, user_id]):
        return jsonify({"error": "questionnaire_id and user_id are required"}), 400
    
    questions = get_all_questions_in_questionnaire(questionnaire_id, user_id)
    
    if questions is not None:
        return jsonify(questions), 200
    
    return jsonify({"error": "Failed to get questions"}), 500

@questionnaire_blueprint.route("/api/questionnaire/get-conclusion", methods=["GET"])
def get_conclusion():
    # Get the questionnaire_id and user_id from the query parameters
    questionnaire_id = request.args.get("questionnaire_id")
    user_id = request.args.get("user_id")
    case_id = request.args.get("case_id")  # Optional case ID
    
    if not all([questionnaire_id, user_id]):
        return jsonify({"error": "questionnaire_id and user_id are required"}), 400
    
    # Call the function to get the GPT conclusion for the questionnaire
    response = get_gpt_conclusion(questionnaire_id, user_id)
    
    # Print the response for debugging purposes
    print("Response from get_gpt_conclusion: ", response, flush=True)
    
    # If the response is successful, return the response data
    if response:
        return jsonify(response), 200
    
    # If the response is not successful, return an error message
    return jsonify({"error": "Failed to get conclusion"}), 404

# Get the most recent result for a user
@questionnaire_blueprint.route("/api/questionnaire/get-most-recent-result", methods=["GET"])
def get_newest_result():
    # Get user_id from query parameters
    user_id = request.args.get("user_id")
    
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    
    result = get_most_recent_result(user_id)
    
    if result is not None:
        return jsonify(result), 200
    
    return jsonify({"error": "No results found for this user"}), 404

# Get all results for a user
@questionnaire_blueprint.route("/api/questionnaire/get-all-results", methods=["GET"])
def get_results():
    # Get user_id from query parameters
    user_id = request.args.get("user_id")
    
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400
    
    results = get_all_results(user_id)
    
    if results is not None:
        return jsonify(results), 200
    
    return jsonify({"error": "Failed to get results"}), 500
