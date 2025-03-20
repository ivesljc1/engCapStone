# WellPath AI - Healthcare AI Assistant

<p align="center">
  <img src="public/logo_no_text.svg" alt="WellPath AI Logo" width="200"/>
</p>

## About The Project

WellPath AI is an innovative healthcare platform that leverages AI to provide personalized health insights based on user-provided information. The platform connects patients with healthcare providers through an intelligent system that collects health data, analyzes symptoms, and generates comprehensive health reports.

## Features

- **User Authentication**: Secure login/registration system with email verification.
- **Dynamic Health Questionnaires**: AI-driven surveys that adapt based on user responses.
- **Case Management**: Organize health concerns into cases with detailed history.
- **Visit Tracking**: Record and monitor health visits over time.
- **AI Analysis**:
  - Health conclusions based on symptoms.
  - Personalized recommendations.
  - OTC medication suggestions.
  - Clinical notes for healthcare providers.
- **Appointment Scheduling**: Book appointments with healthcare providers.
- **Admin Dashboard**: Manage patients and appointments.

## Tech Stack

### **Frontend**

- Next.js 14 (React framework)
- TailwindCSS (styling)
- Shadcn/UI (component library)
- React Hooks for state management

### **Backend**

- Python with Flask
- Firebase Firestore (database)
- Firebase Authentication

### **AI Integration**

- OpenAI GPT for health analysis

### **Third-party Services**

- Cal.com for appointment scheduling

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js 18 or higher
- Python 3.9 or higher
- Firebase account
- OpenAI API key
- Cal.com account (for appointment functionality)

### Installation

1. **Clone the repository**

   ```sh
   git clone https://github.com/yourusername/engCapStone.git
   cd wellpathai
   ```

2. **Install frontend dependencies**

   ```sh
   npm install
   ```

3. **Setup environment variables**
   Create a `.env.local` file in the root directory and add the following:

   ```sh
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   OPENAI_API_KEY=your_openai_api_key
   CAL_API_KEY=your_cal_api_key
   ```

4. **Install backend dependencies**

   ```sh
   cd server
   pip install -r requirements.txt
   ```

5. **Start the development servers**

   - **Frontend**:
     ```sh
     npm run dev
     ```
   - **Backend**:
     ```sh
     cd server
     uvicorn main:app --reload
     ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Project Structure

```sh
wellpathai/
├── app/                  # Next.js app directory
│   ├── clientReport/     # Client report viewing
│   ├── dashboard/        # User dashboard
│   ├── login/            # Authentication
│   ├── questionnaireView/# Questionnaire viewing
│   ├── register/         # User registration
│   ├── report/           # Health reports
│   ├── resetpassword/    # Password reset
│   ├── survey/           # Health questionnaires
│   └── ...
├── components/           # Reusable React components
│   ├── ui/               # UI components
│   └── ...
├── public/               # Static assets
├── server/               # Python backend
│   ├── agents/           # AI integration
│   ├── appointment/      # Appointment management
│   ├── questionnaire/    # Questionnaire processing
│   └── ...
└── ...
```

## Usage

1. Create an account or log in.
2. Start a health survey from the dashboard.
3. Complete the questionnaire by answering the adaptive questions.
4. View your health report with personalized recommendations.
5. Book an appointment with a healthcare provider.
6. Track your cases and visits over time.

## API Documentation

The backend API provides several endpoints:

- `/api/questionnaire/*` - Questionnaire management
- `/api/cases/*` - Case management
- `/api/visit/*` - Visit management
- `/api/appointments/*` - Appointment scheduling

## Development Guidelines

- **Component Creation**: All new UI components should be placed in the `/components/ui/` directory.
- **Styling**: Use TailwindCSS for styling components.
- **State Management**: Use React Hooks for component state.
- **Authentication**: Firebase handles all authentication operations.

## Deployment

The application can be deployed using:

- **Frontend**: Vercel
- **Backend**: Google Cloud Run or any Python-compatible service

## Contributors

- Kai On Ng
- Jiancheng Luo
- Yun Yuan
- Leyang Xing
