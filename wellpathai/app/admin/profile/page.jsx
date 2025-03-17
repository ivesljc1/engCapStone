"use client";

import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";

/**
 * AdminProfilePage - Admin profile page
 * 
 * This component displays the admin user's profile information.
 * 
 * @returns {JSX.Element} The rendered admin profile page
 */
function AdminProfilePage() {
  // State for user profile information
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // Get Firebase auth instance
  const auth = getAuth();

  // Effect to load user information
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setName(user.displayName || "Admin User");
      setEmail(user.email || "");
    }
  }, []);

  return (
    <div>
      <div className="flex flex-col items-start gap-8 rounded-[32px] bg-primary/25 p-10 mb-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-[32px] font-semibold text-gray-900">
            Profile
          </h1>
          <p className="text-gray-600">
            View and manage your admin account information.
          </p>
        </div>
      </div>
      
      {/* Profile information card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Name</h3>
            <p className="mt-1 text-base font-medium text-gray-900">{name}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
            <p className="mt-1 text-base font-medium text-gray-900">{email}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Role</h3>
            <p className="mt-1 text-base font-medium text-gray-900">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProfilePage; 