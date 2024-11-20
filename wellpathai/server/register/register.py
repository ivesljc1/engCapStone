from flask import Blueprint, request, jsonify
from firebase_admin import auth, firestore
from datetime import datetime

# Firestore client
db = firestore.client()

# Helper function to verify email
def is_valid_email(email):
    import re
    email_regex = r'^\S+@\S+\.\S+$'
    return re.match(email_regex, email)

# Blueprint for register route
register_blueprint = Blueprint("register", __name__)

@register_blueprint.route("/api/register", methods=["POST"])
def register_user():
    data = request.get_json()

    # Extract data from the request
    email = data.get("email")
    password = data.get("password")
    first_name = data.get("firstName")
    last_name = data.get("lastName")
    birthday = data.get("birthday")
    phone = data.get("phone")
    
    print(data)

    # Validate input
    if not all([email, password, first_name, last_name, birthday, phone]):
        return jsonify({"error": "All fields are required."}), 400
      
    if not is_valid_email(email):
        return jsonify({"error": "Invalid email format"}), 400

    try:
        # Create a new user in Firebase Authentication
        user = auth.create_user(
            email=email,
            password=password,
        )

        # Send email verification
        auth.update_user(user.uid, email_verified=False)

        # Store additional details in Firestore
        db.collection("users").document(user.uid).set({
            "firstName": first_name,
            "lastName": last_name,
            "birthday": birthday,
            "phone": phone,
            "email": email,
            "createdAt": datetime.utcnow(),
        })

        return jsonify({"message": "User registered successfully. Please verify your email."}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500