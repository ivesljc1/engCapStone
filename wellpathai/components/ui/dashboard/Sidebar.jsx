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

  useEffect(() => {
    setMounted(true);
    const user = auth.currentUser;
    console.log(user.uid);
    user;
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
              <li>
                <button
                  type="button"
                  onClick={() => {
                    handleSignOut();
                    onLogout();
                  }}
                  className="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-50"
                >
                  <span>Sign out</span>
                </button>
              </li>
              <li className="-mx-6 mt-auto">
                <a
                  href="#"
                  className="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-50"
                >
                  <img
                    alt=""
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    className="size-8 rounded-full bg-gray-50"
                  />
                  <span className="sr-only">Your profile</span>
                  <span aria-hidden="true">{name}</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
