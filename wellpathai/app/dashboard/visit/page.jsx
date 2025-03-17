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

  const caseId = "P2JB9hcENJNSTaL4lhYA"; // Example case ID

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

  const updateNewReport = async (visitId) => {
    try {
      const response = await fetch(`/api/visit/updateStatus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visitId: visitId,
          status: false,
        }),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const updatedVisit = await response.json();

      // Update the newReport status in the state to false
      setVisits((prevVisits) =>
        prevVisits.map((visit) =>
          visit.id === updatedVisit.id ? { ...visit, newReport: false } : visit
        )
      );
    } catch (error) {
      console.error("Error updating visit status:", error);
    }
  };

  const handleView = (questionnairesID, visitID) => {
    console.log("Visit ID:", visitID);
    // Redirect to the questionnaire results page, open a new tab
    updateNewReport(visitID);
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

  const handleDownload = async (consultationID, visitID) => {
    updateNewReport(visitID);
    // First fetch the PDF URL
    await fetch("/api/get_pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ consultationID }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.pdfUrl) {
          // Create a temporary anchor element
          const link = document.createElement("a");
          link.href = data.pdfUrl;
          link.setAttribute("download", "report.pdf"); // Suggested filename
          link.setAttribute("target", "_blank");

          // Append to the document, click it, and remove it
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          console.error("No PDF URL found");
        }
      })
      .catch((error) => {
        console.error("Error downloading PDF:", error);
      });
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Content */}
      <main className="flex-1 p-8 bg-white">
        <h1 className="text-2xl font-bold">{caseName}</h1>
        <p className="text-gray-600 mt-2">{caseDescription}</p>

        {/* Pass visits to VisitList Component */}
        <VisitList
          visits={visits}
          onView={handleView}
          onDownload={handleDownload}
        />
      </main>
    </div>
  );
}
