from flask import Blueprint, request, jsonify
from firebase_admin import auth, firestore

# Blueprint for login route
login_blueprint = Blueprint("login", __name__)

db = firestore.client()

@login_blueprint.route("/api/login", methods=["POST"])
def login_user():
    request_data = request.get_json()
    id_token = request_data.get('token')  # Expect token from client
    
    try:
        decoded_token = auth.verify_id_token(id_token)
        user_id = decoded_token.get("uid")
        
        # Get the user's custom claims
        user = auth.get_user(user_id)
        custom_claims = user.custom_claims
        isAdmin = custom_claims.get("isAdmin", False)  # Default to False if not set

        return jsonify({ "isAdmin" : isAdmin}), 200
      
    except auth.InvalidIdTokenError as e:
        return jsonify({"error": "Login failed, try again."}), 401
      
    except Exception as e:
        return jsonify({"error": str(e)}), 500