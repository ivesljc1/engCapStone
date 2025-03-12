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
        # Get the first question to return with the response
        firstQ = get_most_recent_question(doc_id, user_id)

        print(firstQ, flush=True)
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
    
    # # If this is the first answer and case_id is provided, associate the questionnaire with the case
    # if case_id and question_id == "q1":
    #     try:
    #         success = add_questionnaire_to_case(case_id, questionnaire_id)
    #         if not success:
    #             print(f"Warning: Failed to add questionnaire {questionnaire_id} to case {case_id}")
    #     except Exception as e:
    #         print(f"Error associating questionnaire with case: {str(e)}")
    #         # Continue even if association fails
    
    # Get the next question (reusing logic from get_newest_question)
    response = get_most_recent_question(questionnaire_id, user_id)
    
    if response["success"]:
        # There's a predefined question available
        return jsonify({
            "message": "Answer recorded successfully",
            "next_question": response["data"],
            "is_predefined": True
        }), 200
    elif response["error"] == "NO_INITIALIZED_QUESTIONS":
        # No predefined questions left, need to generate with GPT
        print("Calling GPT to generate next question", flush=True)
        
        # Set a maximum number of questions (adjust as needed)
        MAX_QUESTIONS = 20
        
        # Get all questions to check how many we've already asked
        all_questions = get_all_questions_in_questionnaire(questionnaire_id, user_id)
        question_count = len([q for q in all_questions if "question" in q])
        
        # Check if we've reached the maximum number of questions
        if question_count >= MAX_QUESTIONS:
            return jsonify({
                "message": "Answer recorded successfully. Questionnaire complete.",
                "next_question": None,
                "is_complete": True
            }), 200
        
        # Generate with GPT (reusing your existing GPT call logic)
        gpt_response = call_gpt(questionnaire_id, user_id)
        print("GPT response: ", gpt_response, flush=True)
        
        if gpt_response:
            return jsonify({
                "message": "Answer recorded and new question generated",
                "next_question": gpt_response,
                "is_predefined": False,
                "question_count": question_count + 1,
                "max_questions": MAX_QUESTIONS
            }), 200
        else:
            # If GPT generation failed, mark as complete
            return jsonify({
                "message": "Answer recorded successfully. Questionnaire complete.",
                "next_question": None,
                "is_complete": True
            }), 200
    else:
        # Some other error occurred
        return jsonify({
            "message": "Answer recorded but couldn't get next question",
            "error": response["error"],
            "next_question": None
        }), 200

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

# Get the most recent question in a questionnaire
# @questionnaire_blueprint.route("/api/questionnaire/get-most-recent-question", methods=["GET"])
# def get_newest_question():
#     questionnaire_id = request.args.get("questionnaire_id")
#     user_id = request.args.get("user_id")
    
#     if not all([questionnaire_id, user_id]):
#         return jsonify({"error": "questionnaire_id and user_id are required"}), 400
    
#     response = get_most_recent_question(questionnaire_id, user_id)
    
#     if response["success"]:
#         return jsonify(response["data"]), 200
#     elif response["error"] == "NO_INITIALIZED_QUESTIONS":
#         # Call GPT to generate next question
#         print("Calling GPT to generate next question", flush=True)
#         gpt_response = call_gpt(questionnaire_id, user_id)
#         print("GPT response: ", gpt_response, flush=True)
#         if gpt_response:
#             return jsonify(gpt_response), 200
#         else:
#             return jsonify({"error": gpt_response["error"]}), 500
#     return jsonify({"error": response["error"]}), 404

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
