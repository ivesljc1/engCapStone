"use client";

import { useState } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

export default function ResetPassword() {
  const [email, setEmail] = useState("");

  const forgetPassword = async (e) => {
    e.preventDefault();

    if (!email) {
      alert("Please enter your email address to reset your password.");
      return;
    }
    try {
      const auth = getAuth();
      sendPasswordResetEmail(auth, email, {
        url: "http://localhost:3000/login",
      })
        .then(() => {
          window.location.href = `/checkemail?email=${encodeURIComponent(
            email
          )}`;
        })
        .catch((error) => {
          alert("Error during password reset:", error);
        });
    } catch (error) {
      alert("Error during password reset:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-[520px] rounded-[24px] shadow-[0_2px_6px_rgba(16,24,40,0.06)]">
        <CardHeader className="space-y-0 px-8 pt-8">
          <div className="flex flex-col items-start text-left">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <RotateCcw className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl mb-2">Reset your password</CardTitle>
            <p className="text-gray-600">
              Enter your email address associated with your account and will
              send you an email instruction to reset
            </p>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={forgetPassword}>
            <div className="mb-4">
              <label htmlFor="email" className="block mb-2 font-medium">
                Email Address
              </label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.dowry@example.com"
                className="rounded-lg"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-lg bg-primary hover:bg-primary-hover text-white"
            >
              Reset Password
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-primary hover:underline">
              ← Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
