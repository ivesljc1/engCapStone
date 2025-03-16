from flask import Blueprint, request, jsonify
from .services import upload_pdf
from .firebase_init import db

newsletter_bp = Blueprint("newsletter", __name__)

@newsletter_bp.route("/api/upload_user_pdf", methods=["POST"])
def upload_user_pdf():
    if "newsletter" not in request.files or "userEmail" not in request.form:
        return jsonify({"error": "Missing file or user email"}), 400

    file = request.files["newsletter"]
    user_email = request.form["userEmail"]

    pdf_url = upload_pdf(file, user_email)

    if not pdf_url:
        return jsonify({"error": "Invalid file type or user not found"}), 400

    return jsonify({"message": "PDF uploaded successfully!", "pdfUrl": pdf_url}), 200

@newsletter_bp.route("/api/get_user_report/<user_email>", methods=["GET"])
def get_user_report(user_email):
    """获取 `report` collection 里的 PDF URL"""
    report_doc = db.collection("report").document(user_email).get()

    if report_doc.exists:
        return jsonify(report_doc.to_dict()), 200
    return jsonify({"error": "No report found"}), 404