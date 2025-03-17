"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbSeparator, 
  BreadcrumbLink, 
  BreadcrumbPage,
  BreadcrumbHome
} from "@/components/ui/breadcrumb";
import { MagnifyingGlassIcon, CalendarIcon, PlusIcon } from "@heroicons/react/24/outline";
import AppointmentCard from "./AppointmentCard";

/**
 * AppointmentList Component
 * 
 * This component displays a list of appointments with filtering and search
 * functionality for administrators, using a card-based layout based on the Figma design.
 * 
 * @param {Object} props - Component props
 * @param {Array} props.appointments - List of appointment data
 * @returns {JSX.Element} The rendered appointment list
 */
export default function AppointmentList({ appointments }) {
  // State for search and filtered appointments
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  // Filter appointments based on search query and status
  useEffect(() => {
    if (!appointments) return;
    
    let filtered = [...appointments];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(appointment => 
        appointment.patientName.toLowerCase().includes(query) || 
        appointment.patientEmail.toLowerCase().includes(query) ||
        appointment.type.toLowerCase().includes(query) ||
        appointment.id.toLowerCase().includes(query)
      );
    }
    
    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(appointment => 
        appointment.status === selectedStatus
      );
    }
    
    setFilteredAppointments(filtered);
  }, [appointments, searchQuery, selectedStatus]);

  /**
   * Handle search input change
   * @param {Event} e - The input change event
   */
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  /**
   * Handle status filter change
   * @param {string} status - The selected status filter
   */
  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  // If appointments data isn't loaded yet, show loading state
  if (!appointments) {
    return <div className="text-center py-10">Loading appointments...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbHome href="/admin" />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Appointments</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header with title and buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>Schedule</span>
          </Button>
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            <span>New Appointment</span>
          </Button>
        </div>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        {/* Status filters */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={selectedStatus === "all" ? "default" : "outline"} 
            size="sm"
            onClick={() => handleStatusChange("all")}
          >
            All
          </Button>
          <Button 
            variant={selectedStatus === "scheduled" ? "default" : "outline"} 
            size="sm"
            onClick={() => handleStatusChange("scheduled")}
          >
            Scheduled
          </Button>
          <Button 
            variant={selectedStatus === "completed" ? "default" : "outline"} 
            size="sm"
            onClick={() => handleStatusChange("completed")}
          >
            Completed
          </Button>
          <Button 
            variant={selectedStatus === "cancelled" ? "default" : "outline"} 
            size="sm"
            onClick={() => handleStatusChange("cancelled")}
          >
            Cancelled
          </Button>
        </div>

        {/* Search box */}
        <div className="relative w-full sm:w-auto">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search appointments..."
            className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Appointments cards grid */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">No appointments found.</p>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))
        )}
      </div>
    </div>
  );
} 