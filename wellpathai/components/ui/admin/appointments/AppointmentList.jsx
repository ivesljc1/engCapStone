"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbPage,
  BreadcrumbHome,
} from "@/components/ui/breadcrumb";
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import AppointmentStatusBadge from "./AppointmentStatusBadge";
import FileUploadModal from "./FileUploadModal";
import { formatDateShort } from "@/lib/formatDate";

/**
 * Compute duration from end_time - start_time
 * Returns a string like "1h 30m"
 *
 * @param {string} startStr - The start time string.
 * @param {string} endStr - The end time string.
 * @returns {string} The computed duration.
 */
function getDuration(startStr, endStr) {
  if (!startStr || !endStr) return "N/A";

  const start = new Date(startStr);
  const end = new Date(endStr);

  if (isNaN(start) || isNaN(end)) return "N/A";

  const diffMs = end - start;
  if (diffMs < 0) return "N/A";

  const diffMins = diffMs / 60000;
  const hours = Math.floor(diffMins / 60);
  const minutes = Math.floor(diffMins % 60);

  return `${hours}h ${minutes}m`;
}

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

  // State for file upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Filter and sort appointments based on search query and status
  useEffect(() => {
    if (!appointments) return;

    let filtered = [...appointments];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (appointment) =>
          appointment.patientName.toLowerCase().includes(query) ||
          appointment.patientEmail.toLowerCase().includes(query) ||
          appointment.id.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (appointment) => appointment.status === selectedStatus
      );
    }

    // Sort appointments by start_time ascending.
    filtered.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    setFilteredAppointments(filtered);
    console.log(filtered);
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

  /**
   * Open the file upload modal for a specific patient
   * @param {Object} patient - The patient data
   */
  const handleOpenUploadModal = (patient) => {
    setSelectedPatient(patient);
    setIsUploadModalOpen(true);
  };

  /**
   * Handle file upload
   * @param {File} file - The uploaded file
   */
  const handleFileUpload = (file) => {
    // In a real app, this would send the file to the server
    console.log(
      `File uploaded for patient ${selectedPatient?.patientName}:`,
      file
    );
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
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header with title and button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
        <Button className="flex items-center gap-2 text-white rounded-full bg-[#D7A8A0] hover:bg-[#c49991]">
          <CalendarIcon className="h-4 w-4" />
          <span>Manage Availability</span>
        </Button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        {/* Status filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedStatus === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusChange("all")}
            className={`rounded-full ${
              selectedStatus === "all"
                ? "bg-[#D7A8A0] text-white hover:bg-[#c49991]"
                : ""
            }`}
          >
            All
          </Button>
          <Button
            variant={selectedStatus === "scheduled" ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusChange("scheduled")}
            className={`rounded-full ${
              selectedStatus === "scheduled"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : ""
            }`}
          >
            Scheduled
          </Button>
          <Button
            variant={selectedStatus === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusChange("completed")}
            className={`rounded-full ${
              selectedStatus === "completed"
                ? "bg-green-600 text-white hover:bg-green-700"
                : ""
            }`}
          >
            Completed
          </Button>
          <Button
            variant={selectedStatus === "cancelled" ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusChange("cancelled")}
            className={`rounded-full ${
              selectedStatus === "cancelled"
                ? "bg-red-700 text-white hover:bg-red-800"
                : ""
            }`}
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
            className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#D7A8A0] focus:border-transparent"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Appointments table */}
      <div className="overflow-x-auto rounded-[1.5rem] border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Patient
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Duration
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Case
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAppointments.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No appointments found.
                </td>
              </tr>
            ) : (
              filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {appointment.patientName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {appointment.name} - {appointment.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateShort(appointment.start_time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getDuration(appointment.start_time, appointment.end_time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appointment.case_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AppointmentStatusBadge appointmentStatus={appointment.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs px-2 py-1 h-auto rounded-full hover:border-blue-600 hover:text-blue-600"
                        onClick={() => handleOpenUploadModal(appointment)}
                      >
                        <DocumentTextIcon className="h-3 w-3" />
                        Upload Report
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs px-2 py-1 h-auto rounded-full hover:border-green-600 hover:text-green-600"
                      >
                        <ClipboardDocumentListIcon className="h-3 w-3" />
                        View Questionnaire
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {filteredAppointments.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-3 text-sm text-gray-500 bg-gray-50 text-center">
            Showing all {filteredAppointments.length}{" "}
            {filteredAppointments.length === 1 ? "appointment" : "appointments"}
          </div>
        )}
      </div>

      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleFileUpload}
        patientName={selectedPatient?.patientName || ""}
      />
    </div>
  );
}
