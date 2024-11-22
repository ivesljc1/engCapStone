"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(regex.test(email));
  };

  const validatePassword = (password) => {
    setIsPasswordValid(password.length >= 8);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

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
        alert(data.error);
      } else {
        alert("Registration successful! Please login to continue.");
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Registration Form */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-[520px] px-14">
          <CardHeader className="space-y-2 pt-0 px-0">
            <CardTitle className="text-4xl text-center">Sign Up</CardTitle>
            <p className="text-center text-muted-foreground">
              Enter your credentials to create an account
            </p>
          </CardHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-[14px] leading-4">
                  First name
                </label>
                <Input
                  id="firstName"
                  placeholder="John"
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-[14px] leading-4">
                  Last name
                </label>
                <Input
                  id="lastName"
                  placeholder="Wick"
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-[14px] leading-4">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="john.dowry@example.com"
                className={
                  !isEmailValid ? "border-red-500 focus:border-red-500" : ""
                }
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateEmail(e.target.value);
                }}
              />
              {!isEmailValid && (
                <p className="text-sm text-red-500">
                  Please enter a valid email address
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-[14px] leading-4">
                Phone Number
              </label>
              <Input
                id="phone"
                placeholder="(226) - 988 - 8888"
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="birthday" className="text-[14px] leading-4">
                Birthday
              </label>
              <div className="relative">
                <Input
                  id="birthday"
                  type="date"
                  placeholder="mm/dd/yyyy"
                  className="date-input"
                  style={{
                    colorScheme: "light",
                  }}
                  onChange={(e) => setBirthday(e.target.value)}
                />
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-500"
                  >
                    <path
                      d="M4.5 1C4.77614 1 5 1.22386 5 1.5V2H10V1.5C10 1.22386 10.2239 1 10.5 1C10.7761 1 11 1.22386 11 1.5V2H12.5C13.3284 2 14 2.67157 14 3.5V12.5C14 13.3284 13.3284 14 12.5 14H2.5C1.67157 14 1 13.3284 1 12.5V3.5C1 2.67157 1.67157 2 2.5 2H4V1.5C4 1.22386 4.22386 1 4.5 1ZM10 3V3.5C10 3.77614 10.2239 4 10.5 4C10.7761 4 11 3.77614 11 3.5V3H12.5C12.7761 3 13 3.22386 13 3.5V5H2V3.5C2 3.22386 2.22386 3 2.5 3H4V3.5C4 3.77614 4.22386 4 4.5 4C4.77614 4 5 3.77614 5 3.5V3H10ZM2 6V12.5C2 12.7761 2.22386 13 2.5 13H12.5C12.7761 13 13 12.7761 13 12.5V6H2Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-[14px] leading-4">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className={
                    !isPasswordValid
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validatePassword(e.target.value);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
              <p
                className={`text-sm ${
                  !isPasswordValid ? "text-red-500" : "text-muted-foreground"
                }`}
              >
                Must be at least 8 characters
              </p>
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary-hover"
              onClick={handleRegister}
            >
              Create an account
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Image and Quote */}
      <div className="flex-1 relative bg-gray-50">
        <div className="relative h-full">
          <Image
            src="/doctor-patient.jpg"
            alt="Doctor with patient"
            fill
            className="object-cover"
          />
          {/* Quote overlay with blur effect */}
          <div
            className="absolute bottom-16 left-8 right-8 rounded-xl p-6"
            style={{
              background: "rgba(255, 255, 255, 0.70)",
              backdropFilter: "blur(25px)",
              borderRadius: "12px",
            }}
          >
            <p className="text-xl font-medium mb-4">
              "WellPath AI transforms the diagnostic process, providing patients
              with accurate, actionable insights while saving time and
              resources."
            </p>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden relative">
                <Image
                  src="/doctor-avatar.jpg"
                  alt="Dr. Doug Grace"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-medium">Dr. Doug Grace</p>
                <p className="text-gray-500 text-sm">
                  Healthcare Expert & Project Advisor
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
