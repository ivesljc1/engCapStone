"use client";

import { useState, useEffect } from "react";
import AppointmentList from "@/components/ui/admin/appointments/AppointmentList";

/**
 * AdminAppointmentsPage Component
 * 
 * This page displays the appointment management interface for administrators.
 * It loads appointment data and passes it to the AppointmentList component.
 * 
 * @returns {JSX.Element} The rendered admin appointments page
 */
export default function AdminAppointmentsPage() {
  // State for appointment data
  const [appointments, setAppointments] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load appointment data
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await fetch('/api/admin/appointments');
        // const data = await response.json();
        
        // For now, we'll import our mock data
        const response = await import('@/data/adminAppointments.json');
        const data = response.default;
        
        // Simulate a brief loading delay for demo purposes
        setTimeout(() => {
          setAppointments(data);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error loading appointments:", error);
        setIsLoading(false);
      }
    };
    
    loadAppointments();
  }, []);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-6 py-8">
      <AppointmentList appointments={appointments} />
    </div>
  );
} 