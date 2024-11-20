from flask import Blueprint, request, jsonify
from firebase_admin import auth

# Blueprint for login route
login_blueprint = Blueprint("login", __name__)

@login_blueprint.route("/api/login", methods=["POST"])
def login_user():
    data = request.get_json()

    # Extract data from the request
    email = data.get("email")
    password = data.get("password")

    # Validate input
    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    try:
        # Retrieve user by email
        user = auth.get_user_by_email(email)

        # Verify email is confirmed
        if not user.email_verified:
            return jsonify({"error": "Please verify your email before logging in."}), 403

        # Firebase Admin SDK does not handle password verification.
        # Implement password verification using Firebase Client SDK on the frontend.

        return jsonify({
            "message": "Login successful.",
            "uid": user.uid,
            "email": user.email,
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500