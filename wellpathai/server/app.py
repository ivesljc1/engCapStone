from flask import Flask, request, jsonify
from flask_cors import CORS
from firebase import auth
from register.register import register_blueprint
from login.login import login_blueprint
from questionnaire.questionnaire_api import questionnaire_blueprint
from appointment.create_timeslot import create_timeslot_blueprint
from appointment.make_appointment import make_appointment_blueprint
from newsletter.routes import newsletter_bp
from case.case_api import case_blueprint
# from recommendation.recommendation import recommendation_blueprint


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app.register_blueprint(register_blueprint)
app.register_blueprint(login_blueprint)
app.register_blueprint(questionnaire_blueprint)
app.register_blueprint(create_timeslot_blueprint)
app.register_blueprint(make_appointment_blueprint)
app.register_blueprint(newsletter_bp)
app.register_blueprint(case_blueprint)
# app.register_blueprint(recommendation_blueprint)

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Welcome to WellPath AI!"})

if __name__ == '__main__':
    app.run(port=5002, debug=True)