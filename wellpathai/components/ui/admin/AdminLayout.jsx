"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "./AdminSidebar.jsx";
import AdminTopBar from "./AdminTopBar.jsx";

/**
 * AdminLayout Component - Renders the layout for the admin section
 * 
 * This component establishes the main layout structure for admin pages including:
 * - Sidebar with navigation (collapsible on mobile)
 * - Top navigation bar (visible on mobile)
 * - Main content area with proper padding/spacing
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The content to display in the main area
 * @param {Function} props.onLogout - Function to handle user logout
 * @returns {JSX.Element} The rendered admin layout
 */
export default function AdminLayout({ children, onLogout }) {
  // State to control sidebar visibility on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Sidebar component - handles navigation */}
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={onLogout}
      />
      
      {/* Top bar component - visible on mobile */}
      <AdminTopBar setSidebarOpen={setSidebarOpen} onLogout={onLogout} />
      
      {/* Main content area */}
      <main className="py-10 lg:pl-72">
        <div className="px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </>
  );
} 