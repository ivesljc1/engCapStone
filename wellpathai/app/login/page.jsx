"use client";
import { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function LoginPage() {
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const auth = getAuth();
      signInWithEmailAndPassword(auth, credential, password)
        .then((userCredential) => {
          // Get the user token
          return userCredential.user.getIdToken();
        })
        .then((idToken) => {
          // Send the token to your server for validation
          fetch("/api/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: idToken }),
          }).then((data) => {
            if (data.error) {
              setErrorMessage(data.error);
            } else {
              window.location.href = "/patient";
            }
          });
        })
        .catch((error) => {
          console.error("Error during login:", error);
        });
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="container">
      <div className="form-wrapper">
        <h1 className="title">Login</h1>
        {errorMessage && <p className="error">{errorMessage}</p>}
        <form onSubmit={handleLogin} className="form">
          <input
            type="text"
            name="email"
            placeholder="Email"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
            className="input"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
          />
          <button type="submit" className="button">
            Login
          </button>
        </form>
        <p className="link">
          Forgot your password? <a className="anchor">Reset password</a>
        </p>
        <p className="link">
          Don&apos;t have an account?{" "}
          <a href="/register" className="anchor">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
