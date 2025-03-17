"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CaseBreadcrumb from "@/components/ui/CaseBreadcrumb";
import CaseList from "@/components/ui/CaseList";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { set } from "date-fns";

/**
 * DashboardPage Component
 *
 * This is the main dashboard page that displays:
 * 1. A welcome header with a start survey button
 * 2. The user's cases list with case cards
 *
 * @returns {JSX.Element} The rendered dashboard page
 */
export default function DashboardPage() {
  // State to hold the cases data
  const [cases, setCases] = useState([]);
  // State to track if the data is loading
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Simulate fetching cases data from an API
  useEffect(() => {
    // This would normally be a fetch call to your API
    const loadCases = async () => {
      try {
        // In a real app, this would be a fetch call
        // fetch('/api/cases').then(res => res.json())
        const response = await fetch("/api/cases/summary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
          }),
        });
        const data = await response.json();
        setCases(data);
      } catch (error) {
        console.error("Failed to load cases:", error);
        // In a real app, you might want to show an error state
      } finally {
        setIsLoading(false);
      }
    };

    loadCases();
  }, [userId]); // Reload cases when userId changes

  useEffect(() => {
    const auth = getAuth();
    setIsLoading(true);

    // Check initial auth state
    if (auth.currentUser) {
      setUserId(auth.currentUser.uid);
    }

    // Listen for auth changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setIsLoading(false);
      } else {
        setUserId(null);
        window.location.href = "/login";
      }
    });

    return () => unsubscribe();
  }, []); // Auth listener setup only runs once

  return (
    <div className="px-6 py-8">
      {/* Breadcrumb Navigation */}
      <CaseBreadcrumb />

      {/* Welcome Section */}
      <div className="flex flex-col items-start gap-8 rounded-[1.5rem] bg-primary/25 p-10 mb-12">
        <div className="flex flex-col gap-4">
          <h1 className="text-[32px] font-semibold text-gray-900">
            Precision insights, tailored for your health.
          </h1>
          <p className="text-gray-600">
            Use our AI-powered tool to identify potential health concerns and
            receive tailored recommendations in minutes.
          </p>
        </div>
        <Link
          href="/survey"
          className="rounded-full bg-[#D7A8A0] px-6 py-3 text-white hover:bg-[#c49991] transition-colors"
        >
          Start
        </Link>
      </div>

      {/* Cases Section */}
      <CaseList cases={cases} loading={isLoading} />
    </div>
  );
}
