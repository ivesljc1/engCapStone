import firebase_admin
from firebase_admin import credentials, storage, firestore


if not firebase_admin._apps:
    cred = credentials.Certificate("wellpathai\server\wellpathai-firebase-adminsdk-k0jhw-273e518091.json")
    firebase_admin.initialize_app(cred, {
        "storageBucket": "wellpathai.firebasestorage.app"
    })

db = firestore.client()
bucket = storage.bucket("wellpathai.firebasestorage.app")

