"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import UserAppointmentList from "@/components/ui/dashboard/appointments/UserAppointmentList";

export default function UserAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserEmail(user.email);
      } else {
        window.location.href = "/login";
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadAllAppointments = async () => {
      try {
        const response = await fetch("/api/appointments/all");
        if (!response.ok) {
          throw new Error("Failed to fetch all appointments");
        }
        const data = await response.json();
        console.log("UserAppointmentsPage => all appointments:", data);

        setAppointments(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading appointments:", error);
        setIsLoading(false);
      }
    };

    loadAllAppointments();
  }, []);

  if (isLoading) {
    return <div className="p-6">Loading your appointments...</div>;
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
