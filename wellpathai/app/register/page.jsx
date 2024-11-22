"use client";
import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          birthday,
          password,
          phone,
        }),
      });

      const data = await response.json();
      if (data.error) {
        setErrorMessage(data.error);
      } else {
        alert("Registration successful! Please login to continue.");
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="container">
      <div className="form-wrapper">
        <h1 className="title">Register</h1>
        {errorMessage && <p className="error">{errorMessage}</p>}
        {
          <form onSubmit={handleRegister} className="form">
            <input
              type="text"
              name="firstName"
              placeholder="FirstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="input"
            />
            <input
              type="text"
              name="lastName"
              placeholder="LastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="input"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="input"
            />
            <input
              type="date"
              name="birthday"
              placeholder="Birthday"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
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
              Register
            </button>
          </form>
        }
        <p className="link">
          Already have an account?{" "}
          <a href="/login" className="anchor">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}
