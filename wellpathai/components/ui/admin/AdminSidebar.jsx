"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { XMarkIcon } from "@heroicons/react/24/outline";
import AdminNavigation from "./AdminNavigation";
import { signOut, getAuth } from "firebase/auth";
import { auth } from "../../../app/firebase";

// Dynamically import Headless UI components to avoid SSR issues
const Dialog = dynamic(
  () => import("@headlessui/react").then((mod) => mod.Dialog),
  { ssr: false }
);
const DialogBackdrop = dynamic(
  () => import("@headlessui/react").then((mod) => mod.DialogBackdrop),
  { ssr: false }
);
const DialogPanel = dynamic(
  () => import("@headlessui/react").then((mod) => mod.DialogPanel),
  { ssr: false }
);
const TransitionChild = dynamic(
  () => import("@headlessui/react").then((mod) => mod.TransitionChild),
  { ssr: false }
);

/**
 * AdminSidebar Component - Renders the sidebar for the admin section
 * 
 * This component includes:
 * - Mobile responsive sidebar with transition effects
 * - Admin navigation links
 * - User profile section with logout functionality
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.sidebarOpen - Whether the sidebar is open on mobile
 * @param {Function} props.setSidebarOpen - Function to toggle sidebar visibility
 * @param {Function} props.onLogout - Function to handle user logout
 * @returns {JSX.Element} The rendered sidebar component
 */
function AdminSidebar({ sidebarOpen, setSidebarOpen, onLogout }) {
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

  /**
   * Handle sign out functionality
   */
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  // Mobile dialog that appears when sidebar is open on small screens
  const renderDialog = mounted && (
    <Dialog
      open={sidebarOpen}
      onClose={setSidebarOpen}
      className="relative z-50 lg:hidden"
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 flex">
        <DialogPanel
          transition
          className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
        >
          <TransitionChild>
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="-m-2.5 p-2.5"
                aria-label="Close sidebar"
              >
                <span className="sr-only">Close sidebar</span>
                <XMarkIcon aria-hidden="true" className="size-6 text-white" />
              </button>
            </div>
          </TransitionChild>
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
            <div className="flex h-16 shrink-0 items-center">
              <img alt="WellPathAI" src="/wplogo.svg" className="h-8 w-auto" />
              <span className="ml-2 text-lg font-semibold">Admin</span>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <AdminNavigation />
                </li>
              </ul>
            </nav>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );

  return (
    <>
      {/* Mobile sidebar */}
      {renderDialog}

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
          <div className="flex h-16 shrink-0 items-center">
            <img alt="WellPathAI" src="/wplogo.svg" className="h-8 w-auto" />
            <span className="ml-2 text-lg font-semibold">Admin</span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <AdminNavigation />
              </li>

              {/* User profile section at bottom of sidebar */}
              <li className="-mx-6 mt-auto relative">
                <div className="relative">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex w-full items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-50"
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                  >                    
                    <span className="sr-only">Your profile</span>
                    <span aria-hidden="true">{name}</span>
                  </button>

                  {/* Dropdown menu for user actions */}
                  {isOpen && (
                    <div className="absolute bottom-full left-0 w-auto mb-1 bg-white rounded-md shadow-lg">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            onLogout();
                          }}
                          className="flex w-full items-center px-4 py-2 text-sm font-semibold leading-6 group hover:bg-gray-50"
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
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}

export default AdminSidebar; 