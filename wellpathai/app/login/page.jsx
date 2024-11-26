"use client"

import Link from "next/link"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button.jsx"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)

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
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="rounded-lg"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
            <Button type="submit" className="w-full rounded-lg bg-primary hover:bg-primary-hover text-white">
              Log in
            </Button>
          </div>
          <div className="mt-4 text-center">
            <Link href="/resetpassword" className="text-sm text-gray-500">
              Forgot password?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}