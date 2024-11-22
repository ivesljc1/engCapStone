// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJl_UYen5VbRA7l7tvTFiPyIgLGhb6CpY",
  authDomain: "wellpathai.firebaseapp.com",
  projectId: "wellpathai",
  storageBucket: "wellpathai.firebasestorage.app",
  messagingSenderId: "451075073838",
  appId: "1:451075073838:web:e62fc387a646ec970e3cbf",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export default auth;
