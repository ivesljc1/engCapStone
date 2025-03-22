'use client'

import { Bars3Icon } from '@heroicons/react/24/outline'
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { auth } from "../../../app/firebase";


function TopBar({ setSidebarOpen, onLogout }) {

  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const auth = getAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const user = auth.currentUser;
    if (user) {
      setName(user.displayName);
    }
  }, []);

  return (
    <div className="sticky top-0 z-40 flex items-center justify-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
      <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-gray-700 lg:hidden">
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon aria-hidden="true" className="size-6" />
      </button>
      <div className="flex-1 text-sm/6 font-semibold text-gray-900">Home</div>
      

      <div className='flex !gap-0'>
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

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-x-4 px-4 py-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-50 rounded-3xl"
      >                    
        <span className="sr-only">Your profile</span>
        <span aria-hidden="true">{name}</span>
      </button>
      </div>
      
    </div>
  )
}

export default TopBar
