"use client";
import { useEffect, useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  console.log(email, firstName, lastName, birthday, password, phone);

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
      console.log(data);
      if (data.error) {
        setErrorMessage(data.error);
      } else {
        alert(
          "Registration successful! A verification email and SMS have been sent."
        );
        setIsVerifying(true); // Show verification input
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  // const verifyPhoneCode = async () => {
  //   try {
  //     const response = await fetch("http://localhost:5002/verify-phone", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ phone, verificationCode }),
  //     });

  //     const data = await response.json();
  //     if (data.error) {
  //       setErrorMessage(data.error);
  //     } else {
  //       alert("Phone number verified! You can now log in.");
  //       window.location.href = "/login";
  //     }
  //   } catch (error) {
  //     console.error("Error during phone verification:", error);
  //     setErrorMessage("Invalid verification code. Please try again.");
  //   }
  // };

  return (
    <div className="container">
      <div className="form-wrapper">
        <h1 className="title">Register</h1>
        {errorMessage && <p className="error">{errorMessage}</p>}
        {
          // !isVerifying ?
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
          //  : (
          //   <div className="verification-wrapper">
          //     <h2 className="title">Verify Your Phone</h2>
          //     <p className="info">
          //       A 6-digit verification code has been sent to your phone number.
          //     </p>
          //     <input
          //       type="text"
          //       placeholder="Verification Code"
          //       value={verificationCode}
          //       onChange={(e) => setVerificationCode(e.target.value)}
          //       required
          //       className="input"
          //     />
          //     <button onClick={verifyPhoneCode} className="button">
          //       Verify
          //     </button>
          //   </div>
          // )
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
