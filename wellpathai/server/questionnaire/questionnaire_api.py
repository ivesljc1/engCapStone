from flask import Blueprint, request, jsonify
from questionnaire.questionnaire import (
    initialize_questionnaire_database, 
    add_question_to_questionnaire, 
    record_answer_to_question, 
    record_result_to_questionnaire,
    get_most_recent_question,
    get_most_recent_result,
    get_all_questions_in_questionnaire,
    get_all_results
)
from agents.gpt import call_gpt, get_gpt_conclusion

"""
# Blueprint for questionnaire route
# Only Call GPT-4o mini to generate the next question is usefull, others are for api testing
"""

questionnaire_blueprint = Blueprint("questionnaire", __name__)

# Add route to blueprint
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
        return jsonify({
            "message": "Questionnaire initialized successfully",
            "questionnaire_id": doc_id
        }), 201
        
    return jsonify({"error": "Failed to initialize questionnaire"}), 500

# Appends a new question to the questionnaire
# @questionnaire_blueprint.route("/api/questionnaire/add-question", methods=["POST"])
# def add_question():
#     if not request.is_json:
#         return jsonify({"error": "Content-Type must be application/json"}), 415
    
#     data = request.get_json()
#     questionnaire_id = data.get('questionnaire_id')
#     user_id = data.get('user_id')
#     new_question = data.get('new_question')
    
#     if not all([questionnaire_id, user_id, new_question]):
#         return jsonify({"error": "Missing required fields"}), 400
    
#     success, message = add_question_to_questionnaire(questionnaire_id, user_id, new_question)
    
#     if success:
#         return jsonify({"message": message}), 200
#     return jsonify({"error": message}), 400

# Records an answer to a specific question in the questionnaire
@questionnaire_blueprint.route("/api/questionnaire/record-answer", methods=["POST"])
def record_answer():
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415
    
    data = request.get_json()
    questionnaire_id = data.get('questionnaire_id')
    user_id = data.get('user_id')
    question_id = data.get('question_id')
    answer = data.get('answer')
    
    print(data, flush=True)
    if not all([questionnaire_id, user_id, question_id, answer]):
        return jsonify({"error": "Missing required fields"}), 400
    
    success, message = record_answer_to_question(questionnaire_id, user_id, question_id, answer)
    
    if success:
        return jsonify({"message": message}), 200
    return jsonify({"error": message}), 400

# Record the result of the questionnaire
# @questionnaire_blueprint.route("/api/questionnaire/record-result", methods=["POST"])
# def record_result():
#     if not request.is_json:
#         return jsonify({"error": "Content-Type must be application/json"}), 415
    
#     data = request.get_json()
#     questionnaire_id = data.get('questionnaire_id')
#     user_id = data.get('user_id')
#     result = data.get('result')
    
#     if not all([questionnaire_id, user_id, result]):
#         return jsonify({"error": "Missing required fields"}), 400
    
#     success, message = record_result_to_questionnaire(questionnaire_id, user_id, result)
    
#     if success:
#         return jsonify({"message": message}), 200
#     return jsonify({"error": message}), 400

#get questions in questionnaire
@questionnaire_blueprint.route("/api/questionnaire/get-all-questions", methods=["GET"])
def get_questions():
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415
    
    data = request.get_json()
    questionnaire_id = data.get('questionnaire_id')
    user_id = data.get('user_id')
    
    if not all([questionnaire_id, user_id]):
        return jsonify({"error": "Missing required fields"}), 400
    
    questions = get_all_questions_in_questionnaire(questionnaire_id, user_id)
    
    if questions:
        return jsonify(questions), 200
    return jsonify({"error": "Failed to get questions"}), 400

#get the newest question in questionnaire
@questionnaire_blueprint.route("/api/questionnaire/get-most-recent-question", methods=["GET"])
def get_newest_question():
    questionnaire_id = request.args.get('questionnaire_id')
    user_id = request.args.get('user_id')
    
    if not all([questionnaire_id, user_id]):
        return jsonify({"error": "Missing required fields"}), 400
    
    response = get_most_recent_question(questionnaire_id, user_id)
    
    if response["success"]:
        return jsonify(response["data"]), 200
    elif response["error"] == "NO_INITIALIZED_QUESTIONS":
        # Call GPT to generate next question
        print("Calling GPT to generate next question", flush=True)
        gpt_response = call_gpt(questionnaire_id, user_id)
        print("GPT response: ", gpt_response, flush=True)
        if gpt_response:
            return jsonify(gpt_response), 200
        else:
            return jsonify({"error": gpt_response["error"]}), 500
    return jsonify({"error": response["error"]}), 404

@questionnaire_blueprint.route("/api/questionnaire/get-conclusion", methods=["GET"])
def get_conclusion():
    # Get the questionnaire_id and user_id from the query parameters
    questionnaire_id = request.args.get('questionnaire_id')
    user_id = request.args.get('user_id')
    
    # Check if both questionnaire_id and user_id are provided
    if not all([questionnaire_id, user_id]):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Call the function to get the GPT conclusion for the questionnaire
    response = get_gpt_conclusion(questionnaire_id, user_id)
    
    # Print the response for debugging purposes
    print("Response from get_gpt_conclusion: ", response, flush=True)
    
    # If the response is successful, return the response data
    if response:
        return jsonify(response), 200
    
    # If the response is not successful, return an error message
    return jsonify({"error": "Failed to get conclusion"}), 404


# # Call GPT-4o mini to generate the next question
# @questionnaire_blueprint.route("/api/questionnaire/generate-question", methods=["POST"])
# def generate_question():
#     if not request.is_json:
#         return jsonify({"error": "Content-Type must be application/json"}), 415
    
#     data = request.get_json()
#     questionnaire_id = data.get('questionnaire_id')
#     user_id = data.get('user_id')
    
#     if not all([questionnaire_id, user_id]):
#         return jsonify({"error": "Missing required fields"}), 400
    
#     response = call_gpt(questionnaire_id, user_id)
    
#     return jsonify(response), 200

# Get the most recent result of the questionnaire
@questionnaire_blueprint.route("/api/questionnaire/get-most-recent-result", methods=["GET"])
def get_newest_result():
    # Get user_id from query parameters
    user_id = request.args.get('user_id')

    if not user_id:
        return jsonify({"error": "Missing user_id parameter"}), 400
    
    result = get_most_recent_result(user_id)
    
    if result:
        return jsonify(result), 200
    return jsonify({"error": "No result found"}), 404

@questionnaire_blueprint.route("/api/questionnaire/get-all-results", methods=["GET"])
def get_results():
    user_id = request.args.get('user_id')
    
    if not user_id:
        return jsonify({"error": "Missing required fields"}), 400
    
    results = get_all_results(user_id)
    
    if results:
        return jsonify(results), 200
    return jsonify({"error": "Failed to get results"}), 404