from flask import Blueprint, request, jsonify
from visit.visit import ( create_visit, get_visit, update_visit_date, update_new_report_status )
from datetime import datetime

visit_blueprint = Blueprint("visit", __name__)

@visit_blueprint.route("/api/visit/create", methods=["POST"])
def api_create_visit():
    """Create a new visit"""
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415
        
    data = request.get_json()
    user_id = data.get("userId")
    case_id = data.get("caseId")
    questionnaire_id = data.get("questionnaireId")

    print("Data: ", data, flush=True)
    
    if not all([user_id, case_id, questionnaire_id]):
        return jsonify({"error": "Missing required fields"}), 400
        
    responde = create_visit(user_id, case_id, questionnaire_id)
    
    if responde:
        return jsonify({
            "message": "Visit created successfully",
            "visitId": responde.get("visit_id"),
            "addToCase": responde.get("add_to_case")
        }), 201
    else:
        return jsonify({"error": "Failed to create visit"}), 500
    
@visit_blueprint.route("/api/visit/getVisits", methods=["GET"])
def api_get_visits():
    """Get all visits for a case"""
    case_id = request.args.get("caseId")
    
    if not case_id:
        return jsonify({"error": "caseId is required"}), 400
        
    visits = get_visit(case_id)
    return jsonify(visits), 200

@visit_blueprint.route("/api/visit/updateDate", methods=["POST"])
def api_update_visit_date():
    """Update the visit date"""
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415
        
    data = request.get_json()
    visit_id = data.get("visitId")
    visit_date = data.get("visitDate")
    
    if not all([visit_id, visit_date]):
        return jsonify({"error": "Missing required fields"}), 400
        
    success = update_visit_date(visit_id, visit_date)
    
    if success:
        return jsonify({"message": "Visit date updated successfully"}), 200
    else:
        return jsonify({"error": "Failed to update visit date"}), 500
    
# update hasNewReport status
@visit_blueprint.route("/api/visit/updateStatus", methods=["POST"])
def api_update_new_report():
    """Update the newReport status"""
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415
        
    data = request.get_json()
    visit_id = data.get("visitId")
    status = data.get("status")
    
    if not visit_id or status is None:
        return jsonify({"error": "Missing required fields"}), 400
        
    success = update_new_report_status(visit_id, status)
    
    if success:
        return jsonify({"message": "Visit status updated successfully"}), 200
    else:
        return jsonify({"error": "Failed to update new report status"}), 500