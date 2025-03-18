from flask import Blueprint, request, jsonify
from appointment.appointment import (
    get_all_appointments,
    get_user_appointments,
    cancel_appointment,
)

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


@appointment_blueprint.route("/api/appointments/cancel", methods=["POST"])
def api_cancel_appointment():
    """Cancel an appointment"""
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415

    data = request.get_json()
    visit_id = data.get("visitId")

    if not visit_id:
        return jsonify({"error": "visitId is required"}), 400

    visit_data = cancel_appointment(visit_id)

    print("visit_data: ", visit_data, flush=True)

    if visit_data:
        return (
            jsonify(
                {
                    "message": "Appointment cancelled successfully",
                    "appointmentId": visit_data.get("id"),
                    "email": visit_data.get("email"),
                }
            ),
            200,
        )
    else:
        return jsonify({"error": "Failed to cancel appointment"}), 500
