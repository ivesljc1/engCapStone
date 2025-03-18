"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbPage,
  BreadcrumbHome,
} from "@/components/ui/breadcrumb";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import AppointmentStatusBadge from "./AppointmentStatusBadge";
import { formatDateShort, formatTime } from "@/lib/formatDate";

export default function UserAppointmentList({ appointments, currentUserEmail }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");

  // 只保留属于当前用户的 appointments
  const userAppointments = useMemo(() => {
    return appointments.filter((apt) => apt.email === currentUserEmail);
  }, [appointments, currentUserEmail]);

  // 搜索 + 状态过滤 + 排序
  useEffect(() => {
    let filtered = [...userAppointments];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.id.toLowerCase().includes(query) ||
          (apt.event_name && apt.event_name.toLowerCase().includes(query)) ||
          formatDateShort(apt.start_time).toLowerCase().includes(query)
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((apt) => apt.status === selectedStatus);
    }

    // 你可以根据 date 或 start_time 排序
    // 这里演示: if scheduled => ascending, else => descending
    if (selectedStatus === "scheduled") {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    setFilteredAppointments(filtered);
  }, [userAppointments, searchQuery, selectedStatus]);

  // 处理搜索
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // 处理状态
  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  if (!appointments) {
    return <div className="text-center py-10">Loading appointments...</div>;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbHome href="/user" />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">My Appointments</h1>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
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

      <div className="overflow-x-auto rounded-[1.5rem] border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                  No appointments found.
                </td>
              </tr>
            ) : (
              filteredAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateShort(apt.start_time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTime(apt.time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {apt.event_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AppointmentStatusBadge appointmentStatus={apt.status} />
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
