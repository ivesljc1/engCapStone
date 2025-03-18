"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import UserAppointmentList from "@/components/ui/dashboard/appointments/UserAppointmentList";
import InPageLoading from "@/components/ui/InPageLoading";
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

  // refresh function when user finish/cancel the booking in cal.com
  const refreshAppointments = async () => {
    if (!userId) return;

    try {
      setIsLoading(true); // Optional: show some loading state

      const response = await fetch(`/api/appointments/user?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to refresh appointments");

      const freshAppointments = await response.json();
      setAppointments(freshAppointments);

      // Optional: Show a toast notification
      console.log("Appointment data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };
  //refresh visit data when window regains focus
  useEffect(() => {
    // Skip if we don't have necessary data
    if (!userId) return;

    // Function to refresh data when window regains focus
    const handleFocus = () => {
      console.log("Window focused - checking for appointment updates");
      refreshAppointments();
    };

    // Add event listener for when the page regains focus
    window.addEventListener("focus", handleFocus);

    // Cleanup
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [userId]);

  // Loading state
  if (isLoading) {
    return <InPageLoading />;
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
