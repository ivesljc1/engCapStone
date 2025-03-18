"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import UserAppointmentList from "@/components/ui/dashboard/appointments/UserAppointmentList";

export default function UserAppointmentsPage() {
  const [appointments, setAppointments] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [userId, setUserId] = useState("");

  // 监听用户登录状态
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setCurrentUserEmail(user.email);
      } else {
        // 用户未登录，重定向到登录页
        window.location.href = "/login";
      }
    });
    return () => unsubscribe();
  }, []);

  // 当 userId 确定后，从后端 API 获取该用户的 appointments
  useEffect(() => {
    if (!userId) return;
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`/api/appointments/user?userId=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch appointments");
        const data = await response.json();
        setAppointments(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading appointments:", error);
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [userId]);

  if (isLoading) {
    return <div className="text-center py-10">Loading appointments...</div>;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <UserAppointmentList
        appointments={appointments}
        currentUserEmail={currentUserEmail}
      />
    </div>
  );
}
