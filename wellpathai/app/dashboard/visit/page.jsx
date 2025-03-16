"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import VisitList from "@/components/ui/visitList"; // Import VisitList component
import LoadingPage from "@/components/ui/loadingPage";

export default function Dashboard() {
  const [userId, setUserId] = useState(null);
  const [visits, setVisits] = useState([]);
  const [caseName, setCaseName] = useState("");
  const [caseDescription, setCaseDescription] = useState("");
  const [loading, setLoading] = useState(true);

  const caseId = "udDZX4TmzIQLU2o0OclO"; // Example case ID

  useEffect(() => {
    const fetchCaseData = async () => {
      try {
        const response = await fetch(`/api/cases/${caseId}`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const caseData = await response.json();
        setCaseName(caseData.title);
        setCaseDescription(caseData.description);
      } catch (error) {
        console.error("Error fetching case:", error);
      }
    };

    const fetchVisits = async () => {
      try {
        const response = await fetch(`/api/visit/getVisits?caseId=${caseId}`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const visitData = await response.json();
        setVisits(visitData);
      } catch (error) {
        console.error("Error fetching visits:", error);
      }
    };

    fetchCaseData();
    fetchVisits();
  }, []);

  const handleView = (questionnairesID) => {
    // Redirect to the questionnaire results page, open a new tab
    window.open(
      `/questionnaireView?questionnaireID=${questionnairesID}`,
      "_blank"
    );
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

  if (loading) return <LoadingPage />;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Content */}
      <main className="flex-1 p-8 bg-white">
        <h1 className="text-2xl font-bold">{caseName}</h1>
        <p className="text-gray-600 mt-2">{caseDescription}</p>

        {/* Pass visits to VisitList Component */}
        <VisitList visits={visits} onView={handleView} onDownload={null} />
      </main>
    </div>
  );
}
