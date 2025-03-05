"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function LoginPage() {
  const [formData, setFormData] = useState({ credential: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const { credential, password } = formData;

    if (!credential || !password) {
      alert("Please enter your email and password to login.");
      return;
    }

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credential,
        password
      );

      console.log(userCredential);

      if (!userCredential) {
        throw new Error("Failed to authenticate.");
      }

      if (!userCredential.user.emailVerified) {
        alert("Please verify your email before logging in.");
        return;
      }

      // Get the user token
      const idToken = await userCredential.user.getIdToken();

      // Send the token to your server for validation
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: idToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to authenticate.");
      }

      const data = await response.json(); // Parse the response JSON

      // Check if the user is an admin
      if (data.isAdmin) {
        window.location.href = "/admin"; // Redirect to admin dashboard
      } else {
        window.location.href = "/dashboard"; // Redirect to user dashboard
      }
    } catch (error) {
      console.log("Login error:", error);
      alert("Invalid email or password, please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-[520px] rounded-[24px] shadow-[0_2px_6px_rgba(16,24,40,0.06)]">
        <CardHeader className="space-y-0 px-8 pt-8">
          <div className="flex justify-between items-center">
            <CardTitle>Sign in</CardTitle>
            <Link href="/register" className="text-sm text-primary">
              I don't have an account
            </Link>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleLogin} className="grid gap-4">
            <Input
              type="email"
              placeholder="Email"
              className="rounded-lg"
              name="credential"
              onChange={handleChange}
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="rounded-lg"
                name="password"
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <Button
              type="submit"
              className="w-full rounded-lg bg-primary hover:bg-primary-hover text-white"
            >
              Log in
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/resetpassword" className="text-sm text-gray-500">
              Forgot password?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
