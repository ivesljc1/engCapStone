import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from .firebase_init import db, bucket

def upload_pdf(file, user_email):
    """上传 PDF 到 Firebase Storage 并返回下载 URL"""
    if not file or file.filename == "":
        return None

    blob = bucket.blob(f"user_pdfs/{user_email}.pdf")

    blob.upload_from_file(file, content_type="application/pdf")

    blob.make_public()
    pdf_url = blob.public_url

    user_query = db.collection("users").where("email", "==", user_email).stream()
    user_doc = next(user_query, None)
    
    if user_doc:
        db.collection("users").document(user_doc.id).update({"pdfUrl": pdf_url})

        send_email_notification(user_email, pdf_url)

    return pdf_url

def send_email_notification(user_email, pdf_url):
    sender_email = "wellpathai@gmail.com"  
    sender_password = "xwbs znkw zjcg xxcd" 

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


