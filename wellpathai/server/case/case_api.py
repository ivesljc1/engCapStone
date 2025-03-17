from flask import Blueprint, request, jsonify
from case.case import (
    create_case,
    get_case,
    get_user_cases,
    update_case,
    add_appointment_to_case,
    add_visit_to_case,
    add_result_to_case,
    add_report_to_case,
    get_case_appointments,
    get_case_questionnaires,
    close_case,
    reopen_case,
    delete_case,
    get_case_summary
)

# Blueprint for case routes
case_blueprint = Blueprint("case", __name__)

@case_blueprint.route("/api/cases/create", methods=["POST"])
def api_create_case():
    """Create a new case"""
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415
        
    data = request.get_json()
    user_id = data.get("userId")
    questionnair_id = data.get("questionnaireId")
    title = data.get("title")
    description = data.get("description")
    
    if not user_id:
        return jsonify({"error": "userId is required"}), 400
        
    case_id = create_case(user_id, questionnair_id, title, description)
    
    print(f"Case ID in api: {case_id}", flush=True)
    
    if case_id:
        return jsonify({
            "message": "Case created successfully",
            "caseId": case_id
        }), 201
    else:
        return jsonify({"error": "Failed to create case"}), 500

@case_blueprint.route("/api/cases/<case_id>", methods=["GET"])
def api_get_case(case_id):
    """Get a case by ID"""
    case = get_case(case_id)
    
    if case:
        return jsonify(case), 200
    else:
        return jsonify({"error": "Case not found"}), 404

@case_blueprint.route("/api/cases/user/<user_id>", methods=["GET"])
def api_get_user_cases(user_id):
    """Get all cases for a user"""
    cases = get_user_cases(user_id)
    return jsonify(cases), 200

@case_blueprint.route("/api/cases/<case_id>", methods=["PUT"])
def api_update_case(case_id):
    """Update a case"""
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415
        
    data = request.get_json()
    
    success = update_case(case_id, data)
    
    if success:
        return jsonify({"message": "Case updated successfully"}), 200
    else:
        return jsonify({"error": "Failed to update case"}), 500

@case_blueprint.route("/api/cases/<case_id>/appointments", methods=["POST"])
def api_add_appointment(case_id):
    """Add an appointment to a case"""
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415
        
    data = request.get_json()
    appointment_id = data.get("appointmentId")
    
    if not appointment_id:
        return jsonify({"error": "appointmentId is required"}), 400
        
    success = add_appointment_to_case(case_id, appointment_id)
    
    if success:
        return jsonify({"message": "Appointment added to case successfully"}), 200
    else:
        return jsonify({"error": "Failed to add appointment to case"}), 500

@case_blueprint.route("/api/cases/<case_id>/visit", methods=["POST"])
def api_add_visit(case_id):
    """Add a visit to a case"""
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415
        
    data = request.get_json()
    visit_id = data.get("visitId")
    
    if not visit_id:
        return jsonify({"error": "visitId is required"}), 400
        
    success = add_visit_to_case(case_id, visit_id)
    
    if success:
        return jsonify({"message": "Visit added to case successfully"}), 200
    else:
        return jsonify({"error": "Failed to add visit to case"}), 500

@case_blueprint.route("/api/cases/<case_id>/results", methods=["POST"])
def api_add_result(case_id):
    """Add a result to a case"""
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415
        
    data = request.get_json()
    result_id = data.get("resultId")
    
    if not result_id:
        return jsonify({"error": "resultId is required"}), 400
        
    success = add_result_to_case(case_id, result_id)
    
    if success:
        return jsonify({"message": "Result added to case successfully"}), 200
    else:
        return jsonify({"error": "Failed to add result to case"}), 500

@case_blueprint.route("/api/cases/<case_id>/reports", methods=["POST"])
def api_add_report(case_id):
    """Add a report to a case"""
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415
        
    data = request.get_json()
    report_id = data.get("reportId")
    
    if not report_id:
        return jsonify({"error": "reportId is required"}), 400
        
    success = add_report_to_case(case_id, report_id)
    
    if success:
        return jsonify({"message": "Report added to case successfully"}), 200
    else:
        return jsonify({"error": "Failed to add report to case"}), 500

@case_blueprint.route("/api/cases/<case_id>/close", methods=["POST"])
def api_close_case(case_id):
    """Close a case"""
    success = close_case(case_id)
    
    if success:
        return jsonify({"message": "Case closed successfully"}), 200
    else:
        return jsonify({"error": "Failed to close case"}), 500

@case_blueprint.route("/api/cases/<case_id>/reopen", methods=["POST"])
def api_reopen_case(case_id):
    """Reopen a case"""
    success = reopen_case(case_id)
    
    if success:
        return jsonify({"message": "Case reopened successfully"}), 200
    else:
        return jsonify({"error": "Failed to reopen case"}), 500

@case_blueprint.route("/api/cases/<case_id>", methods=["DELETE"])
def api_delete_case(case_id):
    """Delete a case"""
    success = delete_case(case_id)
    
    if success:
        return jsonify({"message": "Case deleted successfully"}), 200
    else:
        return jsonify({"error": "Failed to delete case"}), 500 
    
@case_blueprint.route("/api/cases/<case_id>/questionnaires", methods=["GET"])
def api_get_case_questionnaires(case_id):
    """Get all questionnaires for a case"""
    questionnaires = get_case_questionnaires(case_id)
    
    if questionnaires is None:
        return jsonify({"error": "Failed to get questionnaires or case not found"}), 404
        
    return jsonify(questionnaires), 200

@case_blueprint.route("/api/cases/<case_id>/appointments", methods=["GET"])
def api_get_case_appointments(case_id):
    """Get all appointments for a case"""
    appointments = get_case_appointments(case_id)
    
    if appointments is None:
        return jsonify({"error": "Failed to get appointments or case not found"}), 404
        
    return jsonify(appointments), 200

# Get All Case title, case description, number of hasNewReport in the visit belong to the case, the last visit date, total number of visits and case id
@case_blueprint.route("/api/cases/summary", methods=["GET"])
def api_get_case_summary():
    data = request.get_json()
    user_id = data.get("userId")
    
    """Get all case summary"""
    cases = get_case_summary(user_id)
    
    print(f"Cases: {cases}", flush=True)
    
    if cases is None:
        return jsonify({"error": "Failed to get case summary"}), 404
        
    return jsonify(cases), 200