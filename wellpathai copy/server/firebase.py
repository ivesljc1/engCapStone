import firebase_admin
from firebase_admin import credentials, auth, firestore

# Path to your Firebase Admin SDK private key JSON file
cred = credentials.Certificate("server/wellpathai-firebase-adminsdk-k0jhw-273e518091.json")

# Initialize Firebase app
firebase_app = firebase_admin.initialize_app(cred)

# Initialize Firebase services
auth_client = auth
db = firestore.client()

# Expose the services
firebase_services = {
    "auth": auth_client,
    "db": db
}