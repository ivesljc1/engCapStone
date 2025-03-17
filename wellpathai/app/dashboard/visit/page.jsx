"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import VisitList from "@/components/ui/visitList";
import LoadingPage from "@/components/ui/loadingPage";

export default function Dashboard() {
  const [userId, setUserId] = useState(null);
  const [visits, setVisits] = useState(null);
  const [caseName, setCaseName] = useState(null);
  const [caseDescription, setCaseDescription] = useState(null);
  const [loading, setLoading] = useState(true);

  const caseId = "P2JB9hcENJNSTaL4lhYA";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [caseResponse, visitsResponse] = await Promise.all([
          fetch(`/api/cases/${caseId}`),
          fetch(`/api/visit/getVisits?caseId=${caseId}`),
        ]);

        if (!caseResponse.ok || !visitsResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const caseData = await caseResponse.json();
        const visitData = await visitsResponse.json();

        setCaseName(caseData.title);
        setCaseDescription(caseData.description);
        setVisits(visitData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    updateNewReport(visitID);
    window.open(
      `/questionnaireView?questionnaireID=${questionnairesID}`,
      "_blank"
    );
  };

  useEffect(() => {
    const auth = getAuth();
    setLoading(true);

    if (auth.currentUser) {
      setUserId(auth.currentUser.uid);
      setLoading(false);
    }

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
  }, []);

  const handleDownload = async (consultationID, visitID) => {
    updateNewReport(visitID);

    try {
      const response = await fetch("/api/get_pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ consultationID }),
      });

      const data = await response.json();
      if (data.pdfUrl) {
        const link = document.createElement("a");
        link.href = data.pdfUrl;
        link.setAttribute("download", "report.pdf");
        link.setAttribute("target", "_blank");

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error("No PDF URL found");
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div className="flex h-screen bg-gray-100">
      <main className="flex-1 p-8 bg-white">
        <h1 className="text-2xl font-bold">{caseName}</h1>
        <p className="text-gray-600 mt-2">{caseDescription}</p>

        <VisitList
          visits={visits || []}
          onView={handleView}
          onDownload={handleDownload}
        />
      </main>
    </div>
  );
}
