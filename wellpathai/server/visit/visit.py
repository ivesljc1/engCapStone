from firebase_admin import firestore
from datetime import datetime

from flask import jsonify

db = firestore.client()

def create_visit(user_id, case_id, questionnaire_id):
    
    visit_ref = db.collection("visits").document()
    
    try:
        
        visit_ref.set({
            "userId": user_id,
            "caseId": case_id,
            "visitDate": datetime.now().date().isoformat(),
            "questionnairesID": questionnaire_id,
            "consultationID": "",
            "results": [],
        })
        print(f"Visit created successfully: {visit_ref.id}", flush=True)
        return visit_ref.id
    
    except Exception as e:
        print(f"Error creating visit: {str(e)}", flush=True)
        return None

def get_visit(case_id):
    visits = db.collection("visits").where("caseId", "==", case_id).stream()
    visit_list = []
    
    for visit in visits:
        visit_data = visit.to_dict()
        visit_data["visitId"] = visit.id
        visit_list.append(visit_data)
    
    return visit_list

def update_visit_date(visit_id, visit_date):
    
    visit_ref = db.collection("visits").document(visit_id)
    
    try:
        visit_ref.update({
            "visitDate": visit_date
        })
        
        return True
    
    except Exception as e:
        print(f"Error updating visit date: {str(e)}", flush=True)
        return False