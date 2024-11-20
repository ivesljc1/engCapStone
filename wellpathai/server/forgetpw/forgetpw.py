from flask import request, jsonify, Blueprint
from firebase_admin import auth

# Helper function to validate email format
def is_valid_email(email):
    import re
    email_regex = r'^\S+@\S+\.\S+$'
    return re.match(email_regex, email)


forgetpw_blueprint = Blueprint("forgetpw", __name__)

@forgetpw_blueprint.route("/api/forgot-password", methods=["POST"])
def forgot_password():
    try:
        # Parse the JSON request data
        data = request.json
        email = data.get('email')

        # Validate the email format
        if not email or not is_valid_email(email):
            return jsonify({"error": "Invalid or missing email format"}), 400

        # Generate a password reset link
        reset_link = auth.generate_password_reset_link(email)
        
        # Here you can integrate with an email service to send the link (optional)
        # Example: Send the reset_link via an external email service
        
        return jsonify({
            "message": "Password reset link generated successfully",
            "resetLink": reset_link  # Optional: Expose for frontend use
        }), 200

    except auth.AuthError as auth_error:
        return jsonify({"error": f"Authentication error: {auth_error}"}), 401
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500