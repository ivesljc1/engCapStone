"use client";
import { useState } from "react";

export default function LoginPage() {
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ credential, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setErrorMessage(data.error);
        } else {
          alert("Login successful!");
        }
      })
      .catch((error) => {
        console.error("Error during login:", error);
        setErrorMessage(error.message);
      });
  };

  return (
    <div className="container">
      <div className="form-wrapper">
        <h1 className="title">Login</h1>
        {errorMessage && <p className="error">{errorMessage}</p>}
        <form onSubmit={handleLogin} className="form">
          <input
            type="text"
            placeholder="Email"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
            className="input"
          />
          <input
            type="password"
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
          Don&apos;t have an account?{" "}
          <a href="/register" className="anchor">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
