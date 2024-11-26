def get_recommendations(report):
    recommendations = []
    # just an example logic! will modify later
    if 'high cholesterol' in report:
        recommendations.append('Lipid Panel')
    if 'high blood pressure' in report:
        recommendations.append('Blood Pressure Monitoring')
    return recommendations