'use client'

import { Bars3Icon } from '@heroicons/react/24/outline'
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { auth } from "../../../app/firebase";

/**
 * AdminTopBar Component - Renders the top navigation bar for the admin section on mobile
 * 
 * This component includes:
 * - Hamburger menu button to open sidebar
 * - Title display
 * - User profile dropdown with sign out option
 * 
 * This component is only visible on mobile devices (hidden on larger screens).
 * 
 * @param {Object} props - Component props
 * @param {Function} props.setSidebarOpen - Function to toggle sidebar visibility
 * @param {Function} props.onLogout - Function to handle user logout
 * @returns {JSX.Element} The rendered top bar component
 */
function AdminTopBar({ setSidebarOpen, onLogout }) {
  // State for component mounting (used for client-side rendering)
  const [mounted, setMounted] = useState(false);
  // State for user name display
  const [name, setName] = useState("");
  // State for user profile dropdown
  const [isOpen, setIsOpen] = useState(false);
  // Get Firebase auth instance
  const auth = getAuth();

  // Effect to handle component mounting and user info
  useEffect(() => {
    setMounted(true);
    const user = auth.currentUser;
    if (user) {
      setName(user.displayName);
    }
  }, []);

  return (
    <div className="sticky top-0 z-40 flex items-center justify-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
      {/* Hamburger menu button */}
      <button 
        type="button" 
        onClick={() => setSidebarOpen(true)} 
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        aria-label="Open sidebar"
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon aria-hidden="true" className="size-6" />
      </button>
      
      {/* Page title */}
      <div className="flex-1 text-sm/6 font-semibold text-gray-900">Home</div>
      
      {/* User profile section */}
      <div className='flex !gap-0'>
        {/* Dropdown menu for user actions - only shown when isOpen is true */}
        {isOpen && (
          <div className="bottom-full left-0 w-auto bg-white">
            <div>
              <button
                onClick={() => {
                  onLogout();
                }}
                className="flex w-full items-center px-4 py-3 text-sm font-semibold leading-6 group hover:bg-gray-50 rounded-3xl"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-gray-400 group-hover:text-primary-hover"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="text-gray-900 group-hover:text-primary-hover">
                  Sign out
                </span>
              </button>
            </div>
          </div>
        )}

        {/* User profile button - toggles the dropdown */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-x-4 px-4 py-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-50 rounded-3xl"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >                    
          <span className="sr-only">Your profile</span>
          <span aria-hidden="true">{name}</span>
        </button>
      </div>
      
    </div>
  )
}

export default AdminTopBar 