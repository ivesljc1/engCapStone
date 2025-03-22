"use client";

import { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import AppointmentStatusBadge from "./AppointmentStatusBadge";
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
 * UserAppointmentList Component
 *
 * This component displays the list of appointments for the current user,
 * with searching, status filtering, and sorting by start_time.
 *
 * Columns displayed:
 *  - Date       -> formatDateShort(apt.startTime)
 *  - Duration   -> getDuration(apt.startTime, apt.endTime)
 *  - Case       -> apt.case_name
 *  - Status     -> apt.status (via AppointmentStatusBadge)
 *
 * @param {Object} props - Component props
 * @param {Array} props.appointments       - The appointment data for the current user
 * @param {String} props.currentUserEmail   - The current user's email (for reference)
 * @returns {JSX.Element} The rendered appointment list.
 */
export default function UserAppointmentList({
  appointments,
  currentUserEmail,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Searching, status filtering, and sorting
  useEffect(() => {
    let filtered = [...appointments];

    if (searchQuery) {
      let q = searchQuery.toLowerCase();
      filtered = filtered.filter((apt) => {
        const hasCase = apt.case_name?.toLowerCase().includes(q);
        const hasDate = formatDateShort(apt.startTime || apt.start_time)
          .toLowerCase()
          .includes(q);
        const hasId = apt.id?.toLowerCase().includes(q);
        return hasCase || hasDate || hasId;
      });
    }

    if (selectedStatus !== "all") {
      console.log("Filtering by status:", selectedStatus);

      const now = new Date(); // Get current date and time

      filtered = filtered.filter((apt) => {
        const endTime = new Date(apt.end_time); // Convert Firestore string to Date object

        if (selectedStatus === "scheduled") {
          return apt.status === "confirmed" && endTime >= now;
        } else if (selectedStatus === "completed") {
          return apt.status === "completed" || endTime < now; // Mark past events as completed
        } else if (selectedStatus === "cancelled") {
          return apt.status === "cancelled";
        }
      });
    }

    // Sort by start_time ascending (using apt.startTime or apt.start_time)
    filtered.sort(
      (a, b) =>
        new Date(a.startTime || a.start_time) -
        new Date(b.startTime || b.start_time)
    );

    setFilteredAppointments(filtered);
  }, [appointments, searchQuery, selectedStatus]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <p className="text-sm text-gray-600">Home / My Appointments</p>
      </div>

      <h1 className="text-2xl font-semibold text-gray-900">My Appointments</h1>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-2">
          <button
            className={`rounded-full px-3 py-1 text-sm ${
              selectedStatus === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100"
            }`}
            onClick={() => handleStatusChange("all")}
          >
            All
          </button>
          <button
            className={`rounded-full px-3 py-1 text-sm ${
              selectedStatus === "scheduled"
                ? "bg-blue-600 text-white"
                : "bg-gray-100"
            }`}
            onClick={() => handleStatusChange("scheduled")}
          >
            Scheduled
          </button>
          <button
            className={`rounded-full px-3 py-1 text-sm ${
              selectedStatus === "completed"
                ? "bg-green-600 text-white"
                : "bg-gray-100"
            }`}
            onClick={() => handleStatusChange("completed")}
          >
            Completed
          </button>
          <button
            className={`rounded-full px-3 py-1 text-sm ${
              selectedStatus === "cancelled"
                ? "bg-red-700 text-white"
                : "bg-gray-100"
            }`}
            onClick={() => handleStatusChange("cancelled")}
          >
            Cancelled
          </button>
        </div>

        <div className="relative w-full sm:w-auto">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search appointments..."
            className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Appointments Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Case
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No appointments found.
                </td>
              </tr>
            ) : (
              filteredAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateShort(apt.startTime || apt.start_time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getDuration(
                      apt.startTime || apt.start_time,
                      apt.endTime || apt.end_time
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {apt.case_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AppointmentStatusBadge
                      appointmentStatus={apt.status}
                      endTime={apt.end_time}
                    />
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
    </div>
  );
}
