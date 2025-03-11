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

