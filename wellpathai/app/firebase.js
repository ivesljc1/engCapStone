// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyDJl_UYen5VbRA7l7tvTFiPyIgLGhb6CpY",
//   authDomain: "wellpathai.firebaseapp.com",
//   projectId: "wellpathai",
//   storageBucket: "wellpathai.firebasestorage.app",
//   messagingSenderId: "451075073838",
//   appId: "1:451075073838:web:e62fc387a646ec970e3cbf",
// };

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default auth;
