from flask import Blueprint, jsonify
from case.case import get_user_cases
from visit.visit import get_visit
from datetime import datetime

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/api/dashboard/<user_id>", methods=["GET"])
def get_dashboard(user_id):
   
    cases = get_user_cases(user_id) 

    dashboard_cases = []

    for c in cases:
        case_id = c.get("id")
        title = c.get("title", "")
        description = c.get("description", "")
        
        visits = get_visit(case_id) or []
        total_visits = len(visits)

        last_visit = None
        if total_visits > 0:
            try:
                sorted_visits = sorted(visits, key=lambda v: datetime.fromisoformat(v["visitDate"]))
                last_visit = sorted_visits[-1]["visitDate"] 
            except Exception as e:
                print(f"Error parsing visitDate for case {case_id}: {e}")
                last_visit = None

        dashboard_cases.append({
            "caseId": case_id,
            "title": title,               
            "description": description,
            "totalVisits": total_visits,
            "lastVisit": last_visit
        })

    return jsonify({"cases": dashboard_cases}), 200
