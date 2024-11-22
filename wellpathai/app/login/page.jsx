"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

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
            if (!data.error) {
              window.location.href = "/patient";
            }
          });
        })
        .catch((error) => {
          console.error("Error during login:", error);
        });
    } catch (error) {
      console.error("Error during login:", error);
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
          <div className="grid gap-4">
            <Input
              type="email"
              placeholder="Email"
              className="rounded-lg"
              onChange={(e) => setCredential(e.target.value)}
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="rounded-lg"
                onChange={(e) => setPassword(e.target.value)}
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
              className="w-full rounded-lg bg-primary hover:bg-primary-hover"
              onClick={handleLogin}
            >
              Log in
            </Button>
          </div>
          <div className="mt-4 text-center">
            <Link href="#" className="text-sm text-gray-500">
              Forgot password?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
