"use client";

import { useState, useEffect } from "react";
import AppointmentList from "@/components/ui/admin/appointments/AppointmentList";
import appointmentsData from "@/data/adminAppointments.json";

/**
 * AdminPage - Main admin dashboard page
 *
 * This component serves as the main landing page for the admin section.
 * It displays the appointment list from the JSON data.
 *
 * @param {Object} props - Component props
 * @param {Function} props.onLogout - Function to handle user logout
 * @returns {JSX.Element} The rendered admin dashboard page
 */
function AdminPage({ onLogout }) {
  // State to store appointments data
  const [appointments, setAppointments] = useState(null);

  // Load appointments data on component mount
  useEffect(() => {
    // In a real application, this would be an API call
    // Here we're using the imported JSON data directly
    const fetchAppointments = async () => {
      const request = await fetch("/api/appointments/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await request.json();
      setAppointments(data);
    };

    fetchAppointments();
  }, []);

  return (
    <div className="py-2">
      <AppointmentList appointments={appointments} />
    </div>
  );
}

// Wrap the component with withAuth HOC to ensure only authenticated admins can access it
// The withAuth HOC is imported automatically through the layout.jsx file
export default AdminPage;
