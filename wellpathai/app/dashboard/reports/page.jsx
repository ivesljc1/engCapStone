"use client";
import { useState } from "react";
import { useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import LoadingPage from "@/components/ui/loadingPage";

export default function ReportsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const fetchReports = async () => {
    // Fetch the user's reports from the API endpoint
    const data = await fetch(
      `/api/questionnaire/get-all-results?user_id=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!data.ok) {
      console.error("Failed to fetch user's reports");
      return;
    } else {
      const results = await data.json();
      // Update the state with the fetched reports
      setResults(results[1]);
      console.log(results[1]);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    setLoading(true);

    // Check initial auth state
    if (auth.currentUser) {
      setUserId(auth.currentUser.uid);
    }

    // Listen for auth changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setLoading(false);
      } else {
        setUserId(null);
        window.location.href = "/login";
      }
    });

    return () => unsubscribe();
  }, []); // Auth listener setup only runs once

  useEffect(() => {
    // Fetch the user's health report when the user ID changes
    if (userId) {
      fetchReports();
    }
  }, [userId]);

  if (loading) return <LoadingPage />;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
    </div>
  );
}
