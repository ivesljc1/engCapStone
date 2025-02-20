from google.oauth2 import service_account
from googleapiclient.discovery import build
import json
import os

SCOPES = ['https://www.googleapis.com/auth/calendar']
SERVICE_ACCOUNT_FILE = 'server/appointment/wellpathai-451322-8a5ac9218add.json'
CALENDAR_ID_FILE = 'server/appointment/calendar_id.json'

def setup_calendar():
    # Check if calendar ID is already stored
    if os.path.exists(CALENDAR_ID_FILE):
        with open(CALENDAR_ID_FILE, 'r') as f:
            return json.load(f)['calendar_id']
    
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    calendar_service = build('calendar', 'v3', credentials=credentials)
    
    calendar_body = {
        'summary': 'WellPath Appointments',
        'timeZone': 'UTC'
    }
    
    try:
        created_calendar = calendar_service.calendars().insert(body=calendar_body).execute()
        calendar_id = created_calendar['id']
        
        # Share calendar with owner (your Gmail account)
        rule = {
            'scope': {
                'type': 'user',
                'value': 'leyangxing@gmail.com'  # Your Gmail account
            },
            'role': 'owner'
        }
        
        # Add sharing rule
        calendar_service.acl().insert(calendarId=calendar_id, body=rule).execute()
        
        # Store calendar ID
        with open(CALENDAR_ID_FILE, 'w') as f:
            json.dump({'calendar_id': calendar_id}, f)
        
        print(f"Calendar created and shared with {rule['scope']['value']}")
        return calendar_id
        
    except Exception as e:
        print(f"Error setting up calendar: {e}")
        return None