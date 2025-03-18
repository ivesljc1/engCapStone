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
