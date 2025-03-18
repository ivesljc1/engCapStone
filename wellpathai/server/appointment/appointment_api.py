from flask import Blueprint, request, jsonify
from appointment.appointment import get_all_appointments, get_user_appointments

# Create a blueprint for appointment routes
appointment_blueprint = Blueprint("appointment", __name__)

@appointment_blueprint.route("/api/appointments/all", methods=["GET"])
def api_get_all_appointments():
    """Get all appointments - admin access only"""
    # TODO: Add admin authorization check here
    
    appointments = get_all_appointments()
    
    if appointments is None:
        return jsonify({"error": "Failed to get appointments"}), 500
        
    return jsonify(appointments), 200

@appointment_blueprint.route("/api/appointments/user", methods=["GET"])
def api_get_user_appointments():
    """Get all appointments for the current user"""
    user_id = request.args.get("userId")
    
    if not user_id:
        return jsonify({"error": "userId is required"}), 400
    
    appointments = get_user_appointments(user_id)
    
    if appointments is None:
        return jsonify({"error": "Failed to get appointments"}), 500
        
    return jsonify(appointments), 200

@appointment_blueprint.route("/api/appointments/case-options", methods=["GET"])
def get_case_options():
    """Get all cases for a user to populate dropdown in Cal.com booking"""
    user_id = request.args.get("userId")
    
    if not user_id:
        return jsonify({"error": "userId is required"}), 400
        
    cases = get_user_cases(user_id)
    
    if cases is None:
        return jsonify({"error": "Failed to get cases"}), 500
        
    # Format cases as options for dropdown
    case_options = []
    for case in cases:
        case_options.append({
            "id": case.get("id"),
            "title": case.get("title") or f"Case {case.get('id')}",
            "description": case.get("description") or ""
        })
        
    return jsonify(case_options), 200

@appointment_blueprint.route("/api/appointments/visit-options", methods=["GET"])
def get_visit_options():
    """Get all visits for a case to populate dropdown in Cal.com booking"""
    case_id = request.args.get("caseId")
    
    if not case_id:
        return jsonify({"error": "caseId is required"}), 400
        
    visits = get_visit(case_id)
    
    if visits is None:
        return jsonify({"error": "Failed to get visits"}), 500
        
    # Format visits as options for dropdown
    visit_options = []
    for visit in visits:
        visit_options.append({
            "id": visit.get("visitId"),
            "date": visit.get("visitDate"),
            "hasReport": visit.get("hasNewReport", False)
        })
        
    return jsonify(visit_options), 200