from flask import Blueprint, request, jsonify
from questionnaire.questionnaire import (
    initialize_questionnaire_database, 
    add_question_to_questionnaire, 
    record_answer_to_question, 
    record_result_to_questionnaire,
    get_most_recent_question,
    get_most_recent_result,
    get_all_questions_in_questionnaire
)
from agents.gpt import call_gpt

"""
# Blueprint for questionnaire route
# Only Call GPT-4o mini to generate the next question is usefull, others are for api testing
"""

questionnaire_blueprint = Blueprint("questionnaire", __name__)

# Add route to blueprint
# Initialize the questionnaire database for a user
@questionnaire_blueprint.route("/api/initialize-questionnaire", methods=["POST"])
def init_questionnaire():
    data = request.get_json()
    user_id = data.get("user_id")
    if not user_id:
        return {"error": "user_id is required"}, 400
    
    success = initialize_questionnaire_database(user_id)
    if success:
        return {"message": "Questionnaire database initialized successfully"}, 201
    return {"error": "Failed to initialize questionnaire database"}, 500

# Appends a new question to the questionnaire
@questionnaire_blueprint.route("/api/questionnaire/add-question", methods=["POST"])
def add_question():
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415
    
    data = request.get_json()
    questionnaire_id = data.get('questionnaire_id')
    user_id = data.get('user_id')
    new_question = data.get('new_question')
    
    if not all([questionnaire_id, user_id, new_question]):
        return jsonify({"error": "Missing required fields"}), 400
    
    success, message = add_question_to_questionnaire(questionnaire_id, user_id, new_question)
    
    if success:
        return jsonify({"message": message}), 200
    return jsonify({"error": message}), 400

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
    
    if not all([questionnaire_id, user_id, question_id, answer]):
        return jsonify({"error": "Missing required fields"}), 400
    
    success, message = record_answer_to_question(questionnaire_id, user_id, question_id, answer)
    
    if success:
        return jsonify({"message": message}), 200
    return jsonify({"error": message}), 400

# Record the result of the questionnaire
@questionnaire_blueprint.route("/api/questionnaire/record-result", methods=["POST"])
def record_result():
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415
    
    data = request.get_json()
    questionnaire_id = data.get('questionnaire_id')
    user_id = data.get('user_id')
    result = data.get('result')
    
    if not all([questionnaire_id, user_id, result]):
        return jsonify({"error": "Missing required fields"}), 400
    
    success, message = record_result_to_questionnaire(questionnaire_id, user_id, result)
    
    if success:
        return jsonify({"message": message}), 200
    return jsonify({"error": message}), 400

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
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415
    
    data = request.get_json()
    questionnaire_id = data.get('questionnaire_id')
    user_id = data.get('user_id')
    
    if not all([questionnaire_id, user_id]):
        return jsonify({"error": "Missing required fields"}), 400
    
    question = get_most_recent_question(questionnaire_id, user_id)
    
    if question:
        return jsonify(question), 200
    return jsonify({"error": "Failed to get questions"}), 400

# Call GPT-4o mini to generate the next question
@questionnaire_blueprint.route("/api/questionnaire/generate-question", methods=["POST"])
def generate_question():
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415
    
    data = request.get_json()
    questionnaire_id = data.get('questionnaire_id')
    user_id = data.get('user_id')
    
    if not all([questionnaire_id, user_id]):
        return jsonify({"error": "Missing required fields"}), 400
    
    response = call_gpt(questionnaire_id, user_id)
    
    return jsonify(response), 200

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