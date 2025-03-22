from flask import Blueprint, request, jsonify
from .services import upload_pdf
from .firebase_init import db
from newsletter.services import ( get_pdf, check_report_exists )

newsletter_bp = Blueprint("newsletter", __name__)

@newsletter_bp.route("/api/upload_user_pdf", methods=["POST"])
def upload_user_pdf():
    if "newsletter" not in request.files or "userEmail" not in request.form:
        return jsonify({"error": "Missing file or user email"}), 400

    file = request.files["newsletter"]
    user_email = request.form["userEmail"]
    user_id = request.form["userId"]
    visit_id = request.form["visitId"]

    pdf_url = upload_pdf(file, user_email, user_id,visit_id)

    if not pdf_url:
        return jsonify({"error": "Invalid file type or user not found"}), 400

    return jsonify({"message": "PDF uploaded successfully!", "pdfUrl": pdf_url}), 200

# Return a file from Firebase Storage to the user for download
@newsletter_bp.route("/api/get_pdf", methods=["POST"])
def get_consultation_pdf():
    data = request.get_json()
    consultation_id = data.get("consultationID")
    
    if not consultation_id:
        return jsonify({"error": "consultationID is required"}), 400
    
    result = get_pdf(consultation_id)
    
    if not result:
        return jsonify({"error": "Failed to get PDF"}), 500
    
    return jsonify({"pdfUrl": result}), 200

@newsletter_bp.route("/api/check_report_exists", methods=["GET"])
def check_visit_report():
    visit_id = request.args.get("visit_id")
    
    if not visit_id:
        return jsonify({"error": "visit_id is required"}), 400
    
    result = check_report_exists(visit_id)
    
    return jsonify(result), 200