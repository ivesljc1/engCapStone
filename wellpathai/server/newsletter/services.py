import smtplib
import uuid
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from .firebase_init import db, bucket
from datetime import datetime
import os

def generate_unique_pdf_id():
    """Generate a unique PDF ID and ensure it's not already in the consultation collection."""
    while True:
        pdf_id = str(uuid.uuid4())  # Generate a unique ID
        doc_ref = db.collection("consultation").document(pdf_id).get()
        if not doc_ref.exists:
            return pdf_id

def upload_pdf(file, user_email, user_id, visit_id):
    """Upload PDF to Firebase Storage and return the download URL."""
    if not file or file.filename == "":
        return None

    # Generate a unique ID for the PDF
    pdf_id = generate_unique_pdf_id()

    # Set up the blob path using the unique ID
    blob_path = f"user_pdfs/{user_id}/{pdf_id}.pdf"
    blob = bucket.blob(blob_path)

    # Upload file to Firebase Storage
    blob.upload_from_file(file, content_type="application/pdf")
    blob.make_public()
    pdf_url = blob.public_url

    # Add consultation document and get its reference
    consultation_ref = db.collection("consultation").document(pdf_id)
    consultation_ref.set({
        "consultationId": pdf_id,
        "userId": user_id,
        "visitId": visit_id,
        "pdfUrl": pdf_url,
        "email": user_email,
        "uploadedAt": datetime.now().isoformat()
    })

    # Update visit document with consultation ID
    db.collection("visits").document(visit_id).update({
        "consultationID": pdf_id,
        "hasNewReport": True,
        "appointmentStatus": "completed"
    })

    # Update user document if it exists
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()
    if user_doc.exists:
        user_ref.update({"pdfUrl": pdf_url})
        send_email_notification(user_email, pdf_url)

    return pdf_url

def send_email_notification(user_email, pdf_url):
    sender_email = os.getenv("EMAIL_USER")  # Use environment variable
    sender_password = os.getenv("EMAIL_PASSWORD")  # Use environment variable

    if not sender_email or not sender_password:
        print("Error: Email credentials are not set in environment variables.")
        return

    subject = "Your Report is Ready!"
    body = f"""
    Hello,

    A new report has been uploaded for you. You can download it using the link below:

    {pdf_url}

    If you have any questions, please contact support.

    Best regards,
    WellPath AI Team
    """

    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = user_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, user_email, msg.as_string())
        server.quit()
        print(f"Email sent to {user_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")

def get_pdf(consultation_id):
    """Get PDF URL for a consultation"""
    consultation = db.collection("consultation").document(consultation_id).get()
    
    if consultation.exists:
        return consultation.to_dict().get("pdfUrl")
    
    return None

def check_report_exists(visit_id):
    """
    Check if a report already exists for a specific visit
    
    Args:
        visit_id (str): The ID of the visit to check
        
    Returns:
        dict: A dictionary containing:
            - exists (bool): Whether a report exists
            - consultation_id (str, optional): The consultation ID if a report exists
            - pdf_url (str, optional): The URL of the PDF if a report exists
    """
    if not visit_id:
        return {"exists": False}
    
    # Get the visit document
    visit_doc = db.collection("visits").document(visit_id).get()
    
    if not visit_doc.exists:
        return {"exists": False}
    
    # Check if the visit has a consultation ID
    visit_data = visit_doc.to_dict()
    consultation_id = visit_data.get("consultationID")
    
    if not consultation_id:
        return {"exists": False}
    
    # Get the consultation document to retrieve the PDF URL
    consultation_doc = db.collection("consultation").document(consultation_id).get()
    
    if not consultation_doc.exists:
        return {"exists": False}
    
    consultation_data = consultation_doc.to_dict()
    pdf_url = consultation_data.get("pdfUrl")
    
    return {
        "exists": True, 
        "consultation_id": consultation_id,
        "pdf_url": pdf_url
    }
