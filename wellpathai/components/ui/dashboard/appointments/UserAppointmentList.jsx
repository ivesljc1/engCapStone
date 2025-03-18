"use client";

import { useState, useEffect, useMemo } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import AppointmentStatusBadge from "./AppointmentStatusBadge";
import { formatDateShort } from "@/lib/formatDate";


function getDuration(startStr, endStr) {
  if (!startStr || !endStr) return "N/A";

  const start = new Date(startStr);
  const end = new Date(endStr);

  if (isNaN(start) || isNaN(end)) {
    return "N/A";
  }

  const diffMs = end - start;
  if (diffMs < 0) {
    return "N/A";
  }

  const diffMins = diffMs / 60000;
  const hours = Math.floor(diffMins / 60);
  const minutes = Math.floor(diffMins % 60);

  return `${hours}h ${minutes}m`;
}

export default function UserAppointmentList({ appointments, currentUserEmail }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");

  const userAppointments = useMemo(() => {
    return appointments.filter((apt) => apt.email === currentUserEmail);
  }, [appointments, currentUserEmail]);

  useEffect(() => {
    let filtered = [...userAppointments];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((apt) => {
        const hasCase = apt.case_name?.toLowerCase().includes(q);
        const hasDate = formatDateShort(apt.start_time).toLowerCase().includes(q);
        const hasId = apt.id?.toLowerCase().includes(q);
        return hasCase || hasDate || hasId;
      });
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((apt) => apt.status === selectedStatus);
    }

    filtered.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    setFilteredAppointments(filtered);
  }, [userAppointments, searchQuery, selectedStatus]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  if (!appointments) {
    return <div className="text-center py-10">Loading appointments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <p className="text-sm text-gray-600">Home / My Appointments</p>
      </div>

      <h1 className="text-2xl font-semibold text-gray-900">My Appointments</h1>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-2">
          <button
            className={`rounded-full px-3 py-1 text-sm ${
              selectedStatus === "all" ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
            onClick={() => handleStatusChange("all")}
          >
            All
          </button>
          <button
            className={`rounded-full px-3 py-1 text-sm ${
              selectedStatus === "scheduled" ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
            onClick={() => handleStatusChange("scheduled")}
          >
            Scheduled
          </button>
          <button
            className={`rounded-full px-3 py-1 text-sm ${
              selectedStatus === "completed" ? "bg-green-600 text-white" : "bg-gray-100"
            }`}
            onClick={() => handleStatusChange("completed")}
          >
            Completed
          </button>
          <button
            className={`rounded-full px-3 py-1 text-sm ${
              selectedStatus === "cancelled" ? "bg-red-700 text-white" : "bg-gray-100"
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
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  No appointments found.
                </td>
              </tr>
            ) : (
              filteredAppointments.map((apt) => {
                const durationText = getDuration(apt.start_time, apt.end_time);
                return (
                  <tr key={apt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateShort(apt.start_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {durationText}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {apt.case_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <AppointmentStatusBadge appointmentStatus={apt.status} />
                    </td>
                  </tr>
                );
              })
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
