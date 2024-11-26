from flask import Flask, request, jsonify
from flask_cors import CORS
from firebase import auth
from register.register import register_blueprint
from login.login import login_blueprint
from questionnaire.questionnaire_api import questionnaire_blueprint

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app.register_blueprint(register_blueprint)
app.register_blueprint(login_blueprint)
app.register_blueprint(questionnaire_blueprint)

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Welcome to WellPath AI!"})


#endpoint for recommendation
@app.route('/api/recommend-tests', methods=['POST'])
def recommend_tests():
    data = request.get_json()
    report = data.get('report')
    recommendations = get_recommendations(report)
    return jsonify(recommendations)

def get_recommendations(report):
    recommendations = []
    if 'high cholesterol' in report:
        recommendations.append('Lipid Panel')
    if 'high blood pressure' in report:
        recommendations.append('Blood Pressure Monitoring')
    return recommendations




if __name__ == '__main__':
    app.run(port=5002, debug=True)