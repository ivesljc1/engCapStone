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
import { MagnifyingGlassIcon, CalendarIcon, ChevronDownIcon, EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import AppointmentStatusBadge from "./AppointmentStatusBadge";
import { formatDateShort, formatTime } from "@/lib/formatDate";

/**
 * AppointmentList Component
 * 
 * This component displays a list of appointments with filtering, search,
 * and action functionality for administrators.
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

      {/* Appointments table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Doctor
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                  No appointments found.
                </td>
              </tr>
            ) : (
              filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {appointment.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                    <div className="text-sm text-gray-500">{appointment.patientEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateShort(appointment.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTime(appointment.time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appointment.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AppointmentStatusBadge status={appointment.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appointment.doctor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center space-x-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <EyeIcon className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <PencilIcon className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50">
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 