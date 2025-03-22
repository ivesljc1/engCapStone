"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Navigation from "./Navigation";
import { signOut, getAuth } from "firebase/auth";
import { auth } from "../../../app/firebase";

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

function Sidebar({ sidebarOpen, setSidebarOpen, onLogout }) {
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

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

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
              >
                <span className="sr-only">Close sidebar</span>
                <XMarkIcon aria-hidden="true" className="size-6 text-white" />
              </button>
            </div>
          </TransitionChild>
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
            <div className="flex h-16 shrink-0 items-center">
              <img alt="WellPathAI" src="/wplogo.svg" className="h-8 w-auto" />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <Navigation />
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
      {renderDialog}

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
          <div className="flex h-16 shrink-0 items-center">
            <img alt="WellPathAI" src="/wplogo.svg" className="h-8 w-auto" />
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <Navigation />
              </li>

              <li className="-mx-6 mt-auto relative">
                <div className="relative">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex w-full items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-50"
                  >                    
                    <span className="sr-only">Your profile</span>
                    <span aria-hidden="true">{name}</span>
                  </button>

                  {isOpen && (
                    <div className="absolute bottom-full left-0 w-auto mb-1 bg-white rounded-md">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            // handleSignOut();
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

export default Sidebar;
