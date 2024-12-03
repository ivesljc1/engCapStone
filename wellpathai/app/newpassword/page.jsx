"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAuth, confirmPasswordReset } from "firebase/auth";
import { auth } from "../firebase";
import { useRouter, useSearchParams } from "next/navigation";

function useQuery() {
  const searchParams = useSearchParams();

  const params = new URLSearchParams(searchParams.toString());

  return params;
}

export default function CreateNewPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const auth = getAuth();
  const router = useRouter();
  const query = useQuery();
  const oobCode = query.get("oobCode");

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      alert("Please enter your new password and confirm it.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      confirmPasswordReset(auth, oobCode, newPassword)
        .then(() => {
          alert("Password reset successful!");
          router.push("/login");
        })
        .catch((error) => {
          alert(
            "Error during password reset: Make sure your password is at least 8 characters long."
          );
        });
    } catch (error) {
      console.error("Error during password reset:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-[520px] rounded-[24px] shadow-[0_2px_6px_rgba(16,24,40,0.06)]">
        <CardHeader className="space-y-0 px-8 pt-8">
          <div className="flex flex-col items-start text-left">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl mb-2">
              Create a new password
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form className="grid gap-4" onSubmit={handleResetPassword}>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                placeholder="New password"
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-lg"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                placeholder="Confirm new password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-lg"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full rounded-lg bg-primary hover:bg-primary-hover text-white"
            >
              Reset Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
