from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from firebase import auth
from register.register import register_blueprint
from login.login import login_blueprint
from questionnaire.questionnaire_api import questionnaire_blueprint
from newsletter.routes import newsletter_bp
from case.case_api import case_blueprint
from visit.visit_api import visit_blueprint
from appointment.webhooks import webhook_bp
from appointment.appointment_api import appointment_blueprint
import os

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app.register_blueprint(register_blueprint)
app.register_blueprint(login_blueprint)
app.register_blueprint(questionnaire_blueprint)
app.register_blueprint(appointment_blueprint)
app.register_blueprint(newsletter_bp)
app.register_blueprint(case_blueprint)
app.register_blueprint(visit_blueprint)
app.register_blueprint(webhook_bp)

PORT = int(os.getenv("PORT", 5002))

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Welcome to WellPath AI!"})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=PORT, debug=True)