from flask import Blueprint, request, jsonify
from firebase_admin import auth

# Blueprint for login route
login_blueprint = Blueprint("login", __name__)

@login_blueprint.route("/api/login", methods=["POST"])
def login_user():
    request_data = request.get_json()
    id_token = request_data.get('token')  # Expect token from client
    
    try:
        decoded_token = auth.verify_id_token(id_token)
        user_id = decoded_token.get("uid")

        return jsonify({"uid": user_id}), 200
      
    except auth.InvalidIdTokenError as e:
        print(f"Token validation error: {e}")
        return jsonify({"error": "Login failed, try again."}), 401
      
    except Exception as e:
        return jsonify({"error": str(e)}), 500