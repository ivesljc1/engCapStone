"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import UserAppointmentList from "@/components/ui/dashboard/appointments/UserAppointmentList";

/**
 * UserAppointmentsPage Component
 * 
 * This page displays the appointments for the current user.
 * 
 * 1. Listen for authentication state to get the current user's userId and email.
 * 2. Once the userId is available, call /api/appointments/user?userId=... to fetch the user's appointments.
 * 3. Pass the fetched appointments and currentUserEmail to UserAppointmentList for display.
 */
export default function UserAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [userId, setUserId] = useState("");

  // Listen for auth state changes to get current user's userId and email.
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setCurrentUserEmail(user.email);
      } else {
        window.location.href = "/login";
      }
    });
    return () => unsubscribe();
  }, []);

  // Once we have userId, fetch all appointments for the current user.
  useEffect(() => {
    if (!userId) return;
    const fetchUserAppointments = async () => {
      try {
        const response = await fetch(`/api/appointments/user?userId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user appointments");
        }
        const data = await response.json();
        console.log("UserAppointmentsPage: user appointments =>", data);
        setAppointments(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading user appointments:", error);
        setIsLoading(false);
      }
    };
    fetchUserAppointments();
  }, [userId]);

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
