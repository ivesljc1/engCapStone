"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import LoadingPage from "@/components/ui/loadingPage";
import AdminReportSection from "@/components/ui/admin/adminReport";

export default function AdminReportPage() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conclusion, setConclusion] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [questionnaireID, setQuestionnaireID] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [clinicalNotes, setClinicalNotes] = useState([]);
  const [otcMedications, setOtcMedications] = useState([]);

  const fetchReport = async () => {
    // Fetch the user's questionnaire report from the API endpoint
    const data = await fetch(
      `/api/questionnaire/get-questionnaire?questionnaire_id=${questionnaireID}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Check if the fetch request was successful
    if (!data.ok) {
      console.error("Failed to fetch user's health report");
      return; // Exit the function early
    } else {
      try {
        // Parse the JSON response from the server
        const result = await data.json();
        console.log("API Response:", result);
        
        // Update the state with the fetched conclusion and suggestions
        setQuestions(result.questions || {});
        
        if (result.result && result.result.analysis) {
          setConclusion(result.result.analysis.conclusion || "No conclusion available");
          setSuggestions(result.result.analysis.suggestions || []);
          
          // Handle OTC medications if they exist in the response
          if (result.result.analysis.otc_medications) {
            setOtcMedications(result.result.analysis.otc_medications);
          }
          
          // Handle clinical_notes if they exist in the response
          if (result.result.analysis.clinical_notes) {
            setClinicalNotes(result.result.analysis.clinical_notes);
          }
        } else {
          console.error("Invalid response structure", result);
          setConclusion("Could not retrieve conclusion at this time");
          setSuggestions([]);
          setClinicalNotes([]);
          setOtcMedications([]);
        }
      } catch (error) {
        console.error("Error processing response:", error);
        setConclusion("Error processing the report data");
        setSuggestions([]);
        setClinicalNotes([]);
        setOtcMedications([]);
      }
      // Handle OTC medications if they exist in the response
      if (result.result.analysis.otc_medications) {
        setOtcMedications(result.result.analysis.otc_medications);
      }
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
    <AdminReportSection
      questions={Array.isArray(questions) ? questions : Object.values(questions)}
      conclusion={conclusion}
      suggestions={suggestions}
      otcMedications={otcMedications}
      clinicalNotes={clinicalNotes}
    />
  );
}
