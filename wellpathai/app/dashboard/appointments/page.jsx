"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import UserAppointmentList from "@/components/ui/dashboard/appointments/UserAppointmentList";

export default function UserAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  // 1. 获取当前用户的邮箱
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserEmail(user.email);
      } else {
        // 未登录时，可重定向 /login
        window.location.href = "/login";
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. 获取所有 appointments (和 admin 一样)
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // 改成真实后端:
        // const response = await fetch("/api/appointments/all");
        // const data = await response.json();

        // 或者如果还在用 mock:
        const response = await import("@/data/adminAppointments.json");
        const data = response.default;

        console.log("UserAppointmentsPage: all appointments =>", data);

        setAppointments(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading appointments:", error);
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (isLoading) {
    return <div>Loading your appointments...</div>;
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
