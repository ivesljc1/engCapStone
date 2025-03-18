"use client";

import { useState, useEffect } from "react";
// 假设你创建了一个只显示用户自己预约的组件
import UserAppointmentList from "@/components/ui/dashboard/appointments/UserAppointmentList"; 
// 如果你用 Firebase Auth
import { getAuth } from "firebase/auth";

/**
 * UserAppointmentsPage Component
 *
 * 1. 从后端或 mock 数据获取所有 appointments
 * 2. 获取当前登录用户的 email (user.email)
 * 3. 交给 UserAppointmentList 组件只显示自己的预约
 */
export default function UserAppointmentsPage() {
  const [appointments, setAppointments] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  // 获取当前用户
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setCurrentUserEmail(user.email);
    } else {
      // 如果用户未登录，可能要跳转到 /login 或处理
      // window.location.href = "/login";
      console.warn("No user is logged in.");
    }
  }, []);

  // 加载 appointments 数据
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        // 示例：从 mock JSON 里加载
        // 真实环境下可调用 API: fetch("/api/appointments")
        const response = await import("@/data/adminAppointments.json");
        const data = response.default;

        // 模拟延迟
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
      {/* 只显示用户自己预约的列表 */}
      <UserAppointmentList
        appointments={appointments}
        currentUserEmail={currentUserEmail}
      />
    </div>
  );
}
