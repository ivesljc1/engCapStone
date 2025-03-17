"use client";

import Link from "next/link";
import { TestCard } from "@/components/ui/report/testCard";
import { SupplementCard } from "@/components/ui/report/supplementCard";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import LoadingPage from "@/components/ui/loadingPage";

export default function ReportPage() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conclusion, setConclusion] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [date, setDate] = useState(null);
  /* For a conclution
  '''json
  {{
    "conclusion": "Your conclusion here",
    "suggestions": ["suggest1", "suggest2", ...]
  }}
    '''
  */

  const fetchReport = async () => {
    // Fetch the user's health report from the API endpoint
    const data = await fetch(
      `/api/questionnaire/get-most-recent-result?user_id=${userId}`,
      {
        method: "GET", // HTTP method to use for the request
        headers: {
          "Content-Type": "application/json", // Specify the content type as JSON
        },
      }
    );

    // Check if the fetch request was successful
    if (!data.ok) {
      // Log an error message if the request failed
      console.error("Failed to fetch user's health report");
      return; // Exit the function early
    } else {
      // Parse the JSON response from the server
      const result = await data.json();
      // Update the state with the fetched conclusion and suggestions
      setConclusion(result[1].conclusion);
      setSuggestions(result[1].suggestions);
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
    // Get the current date and format it
    const today = new Date();
    const options = { month: "long", day: "numeric" };
    setDate(today.toLocaleDateString("en-US", options));
  }, []);

  useEffect(() => {
    // Fetch the user's health report when the user ID changes
    if (userId) {
      fetchReport();
    }
  }, [userId]);

  if (loading) return <LoadingPage />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Left Container - Fixed Title */}
        <div className="fixed w-[400px] pt-8">
          <h1 className="text-[40px] font-serif leading-tight">
            Here's an health
            <br />
            report based on
            <br />
            survey results
          </h1>
          <Link
            href="/dashboard"
            className="inline-block mt-4 px-4 py-2 rounded-full border border-primary text-primary hover:bg-gray-50 transition-colors"
          >
            Home
          </Link>
        </div>

        {/* Right Container - Content with offset for fixed left container */}
        <div className="flex-1 ml-[400px]">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center mb-10">
              Report {date}
            </h2>
          </div>
          <div className="mb-8">
            <h2 className="text-xl font-medium mb-4">Conclusion:</h2>
            <ReactMarkdown remarkPlugins={remarkGfm} className="text-gray-600">
              {conclusion}
            </ReactMarkdown>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-medium mb-4">Suggestions:</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
