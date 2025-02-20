from google.oauth2 import service_account
from googleapiclient.discovery import build
from .calendar_setup import setup_calendar

SCOPES = ['https://www.googleapis.com/auth/calendar']
SERVICE_ACCOUNT_FILE = 'server/appointment/wellpathai-451322-8a5ac9218add.json'

def init_calendar_service():
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    calendar_service = build('calendar', 'v3', credentials=credentials)
    
    try:
        CALENDAR_ID = setup_calendar() or 'primary'
    except Exception as e:
        print(f"Error getting calendar ID: {e}")
        CALENDAR_ID = 'primary'
        
    return calendar_service, CALENDAR_ID

# Initialize once when module is imported
calendar_service, CALENDAR_ID = init_calendar_service()