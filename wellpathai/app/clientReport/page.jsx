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
import ReportSection from "@/components/ui/result";

export default function ReportPage() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conclusion, setConclusion] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [questionnaireID, setQuestionnaireID] = useState(null);
  const [questions, setQuestions] = useState([]);

  const fetchReport = async () => {
    // Fetch the user's questionnaire report from the API endpoint
    const data = await fetch(
      `/api/questionnaire/get-questionnaire?questionnaire_id=${questionnaireID}`,
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
      console.log(result);
      // Update the state with the fetched conclusion and suggestions
      setQuestions(result.questions);
      setConclusion(result.result.analysis.conclusion);
      setSuggestions(result.result.analysis.suggestions);
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
    if (questionnaireID) {
      fetchReport();
    }
  }, [questionnaireID]);

  useEffect(() => {
    // Extract the questionnaireID from the URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get("questionnaireID");
    setQuestionnaireID(id);
  }, []);

  if (loading) return <LoadingPage />;

  return (
    <ReportSection
      questions={questions}
      conclusion={conclusion}
      suggestions={suggestions}
    />
  );
}
