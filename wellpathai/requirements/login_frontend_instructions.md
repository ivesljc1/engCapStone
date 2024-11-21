# WellPath AI - Frontend Implementation for Login and Signup

## Overview
This guide details the implementation of the Login and Signup functionalities for the WellPath AI platform. These pages provide users a secure way to create and manage accounts, which will be the entry point for accessing personalized health services.

## Feature Requirements
- Use Next.js with Shadcn/UI for building user interfaces.
- Clerk will be used for the authentication system, managing sign-up, sign-in, and password resets.
- Implement Login and Signup functionalities based on the mockups provided.
- For icons, use Heroicon.

## Pages Required
1. Login Page
2. Signup Page

## General Layout
- Login Page: A centered form on the left side.
- Signup Page: A centered form on the left side and a visually appealing image or design on the right side.

## Login Page Requirements
- Fields:
  - Email: Standard email input field.
  - Password: Password input with visibility toggle.
- Buttons:
  - Log In: Submit button to log in.
  - Forgot Password?: Redirects the user to a password reset flow.
  - Sign Up Link: A link at the top right of the form prompting users to create an account if they don't have one.
- Form Validation:
  - Email and Password fields must have validation for correctness (e.g., valid email format, minimum password length).
- Follow the aesthetic seen in the mockups – clean, easy-to-read fields with ample space.
- Use Shadcn/UI components to build form elements like inputs, buttons, and checkboxes for consistency in design and usability.


## Signup Page Requirements
- Fields:
  - First Name: Text input for user's first name.
  - Last Name: Text input for user's last name.
  - Email Address: Standard email input field.
  - Phone Number: Input for the user’s phone number.
  - Birthday: Use date picker for capturing the user’s date of birth.
  - Password: Password input field with visibility toggle and minimum requirements indicated.
- Buttons:
  - Create Account: A button to submit the form and create an account.
  - Login Link: A link for users who already have an account, taking them to the login page.
- Form Validation:
  - All fields must be validated for correct input format (e.g., valid email, appropriate password length, non-empty required fields).
- Quote Section:
  - To the right side, include a section with a quote from a credible healthcare professional, emphasizing the platform’s reliability and benefits.


## Validation and User Flow
- Login Flow:
  - Upon logging in successfully, users should be redirected to the Home Page.
  - If login fails, show an error message near the fields (e.g., "Incorrect email or password").
- Signup Flow:
  - Upon successful account creation, users should be redirected to a welcome screen or directly logged in.
  - Include an error message if account creation fails (e.g., "Email is already in use").

## Relevant Docs
- Clerk Documentation: `https://docs.clerk.com/`
- Shadcn/UI Documentation: `https://docs.shadcn.com/`
- Next.js Best Practices: `https://nextjs.org/docs/getting-started`

## Development Guidelines
- Form Components:
  - All new components, such as input fields or buttons, should be located in `/components/` and be named using the format `example-component.tsx`.
- Authentication Logic:
  - Authentication logic for login and signup should be integrated using Clerk and kept modular for ease of use across other areas of the application.

## File Structure for Login & Signup

WELLPATHAI
├── .vscode
├── app
│   ├── fonts
│   │   ├── GeistMonoVF.woff
│   │   ├── GeistVF.woff
│   ├── login
│   │   ├── page.jsx
│   ├── register
│   │   ├── page.jsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.js
│   ├── page.jsx
├── node_modules
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   ├── window.svg
├── requirements
│   ├── login_frontend_instructions.md
├── server
│   ├── __pycache__
│   ├── forgetpw
│   ├── login
│   ├── register
│   ├── app.py
│   ├── firebase.py
│   ├── wellpathai-firebase-adminsdk-k0jhw-273e518091.json
├── .eslintrc.json
├── .gitignore
├── .prettierignore
├── jsconfig.json
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.js