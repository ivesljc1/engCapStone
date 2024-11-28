from flask import Blueprint, request, jsonify

recommendationblueprint = Blueprint('recommendation', _name)

@recommendation_blueprint.route('/api/recommend-tests', methods=['POST'])
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