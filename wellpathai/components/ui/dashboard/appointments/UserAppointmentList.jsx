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

/**
 * UserAppointmentList Component
 *
 * 1. 只显示当前用户的 appointments（通过 currentUserEmail 过滤）
 * 2. 移除 Patient 列和 Actions 列
 * 3. 其余功能（搜索、状态过滤）保持不变
 *
 * @param {Object} props - Component props
 * @param {Array} props.appointments - List of appointment data (包含所有用户的)
 * @param {String} props.currentUserEmail - 当前登录用户的邮箱
 * @returns {JSX.Element} The rendered appointment list for user
 */
export default function UserAppointmentList({ appointments, currentUserEmail }) {
  // State for search and filtered appointments
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");

  // 用 useMemo 缓存只属于当前用户的 appointments，避免每次 render 都产生新的数组
  const userAppointments = useMemo(() => {
    // 如果你的数据库字段是 email（而非 patientEmail），请改成 apt.email
    return appointments.filter(
      (apt) => apt.email === currentUserEmail
    );
  }, [appointments, currentUserEmail]);

  // 根据搜索和状态进一步过滤
  useEffect(() => {
    let filtered = [...userAppointments];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (appointment) =>
          appointment.id.toLowerCase().includes(query) ||
          appointment.event_name?.toLowerCase().includes(query) ||
          formatDateShort(appointment.start_time).toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (appointment) => appointment.status === selectedStatus
      );
    }

    // Sort by date: 根据需求可以按 date 字段排序
    if (selectedStatus === "scheduled") {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    setFilteredAppointments(filtered);
  }, [userAppointments, searchQuery, selectedStatus]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle status filter change
  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb navigation */}
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

      {/* Header with title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">My Appointments</h1>
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
              {/* 只显示 Date, Duration, Case, Status */}
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
                <td
                  colSpan="4"
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No appointments found.
                </td>
              </tr>
            ) : (
              filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  {/* Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateShort(appointment.start_time)}
                  </td>

                  {/* Duration */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTime(appointment.time)}
                  </td>

                  {/* Case */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* 如果后端提供的字段是 event_name 或 caseTitle，请根据实际调整 */}
                    {appointment.event_name}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <AppointmentStatusBadge
                      appointmentStatus={appointment.status}
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
