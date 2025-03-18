"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import CaseBreadcrumb from "@/components/ui/CaseBreadcrumb";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDateShort } from "@/lib/formatDate";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase";
import VisitStatusBadge from "@/components/ui/VisitStatusBadge";
import {
  CalendarIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

/**
 * CaseDetailPage Component
 *
 * This page displays detailed information about a specific case,
 * showing a summary and a table of all visits with appointment status and actions.
 *
 * @returns {JSX.Element} The rendered case detail page
 */
export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params.id;

  // State for case data
  const [userId, setUserId] = useState(null);
  const [visits, setVisits] = useState(null);
  const [caseName, setCaseName] = useState(null);
  const [caseDescription, setCaseDescription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch case data
  useEffect(() => {
    const fetchCaseData = async () => {
      setIsLoading(true);
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
        setIsLoading(false);
      }
    };

    fetchCaseData();
  }, [caseId]);

  useEffect(() => {
    const auth = getAuth();
    setIsLoading(true);

    if (auth.currentUser) {
      setUserId(auth.currentUser.uid);
      setIsLoading(false);
    }

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

  if (isLoading) {
    return (
      <div className="px-6 py-8">
        <CaseBreadcrumb />
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-6 w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded mb-4 w-2/3"></div>
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
          <div className="h-6 bg-gray-200 rounded mb-8 w-3/4"></div>
          <div className="h-10 bg-gray-200 rounded mb-6 w-1/4"></div>
          <div className="bg-white rounded-[1.5rem] border border-gray-200 p-6">
            <div className="h-6 bg-gray-200 rounded mb-4 w-full"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!caseName || !caseDescription) {
    return (
      <div className="px-6 py-8">
        <CaseBreadcrumb />
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Case Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The case you're looking for doesn't exist or you don't have access
            to it.
          </p>
          <Link
            href="/dashboard"
            className="rounded-full bg-[#D7A8A0] px-6 py-3 text-white hover:bg-[#c49991]"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Handle book appointment
  const handleBookAppointment = (visitId) => {
    // Find the visit in the visits array
    const selectedVisit = visits.find((visit) => visit.visitId === visitId);

    if (selectedVisit) {
      // Create the URL with query parameters
      const calUrl = `https://cal.com/wellpathai?case=${encodeURIComponent(
        caseName
      )}&visit=${encodeURIComponent(selectedVisit.visitDate)}`;

      // Open the URL in a new window
      window.open(calUrl, "_blank");
    } else {
      console.error(`Visit with ID ${visitId} not found`);
    }
  };

  // Handle cancel appointment
  const handleCancelAppointment = (visitId) => {
    console.log(`Cancelling appointment for visit ${visitId}`);
    // In a real app, this would trigger an API call to cancel the appointment
  };

  return (
    <div className="px-6 py-8">
      <CaseBreadcrumb caseName={caseName} />

      {/* Case Header */}
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{caseName}</h1>

      {/* Visits Table */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 uppercase mb-4">
          Your Visits
        </h2>

        <div className="overflow-x-auto rounded-[1.5rem] border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Questionnaire Report
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visits.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No visits recorded for this case yet.
                  </td>
                </tr>
              ) : (
                visits.map((visit) => (
                  <tr key={visit.visitId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {visit.visitDate}{" "}
                      {visit.hasNewReport && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          New Report
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <VisitStatusBadge
                        appointmentStatus={visit.appointmentStatus}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {visit.questionnairesID ? (
                        <button
                          onClick={() =>
                            handleView(visit.questionnairesID, visit.visitId)
                          }
                          className="text-[#D7A8A0] hover:text-[#c49991] hover:underline"
                        >
                          View
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {visit.appointmentStatus === "unscheduled" && (
                        <Button
                          onClick={() => handleBookAppointment(visit.visitId)}
                          variant="outline"
                          size="sm"
                          className="text-xs px-3 py-1 h-auto rounded-full hover:border-gray-500 hover:text-gray-500"
                        >
                          <CalendarIcon className="h-3 w-3" />
                          Book Appointment
                        </Button>
                      )}
                      {visit.appointmentStatus === "scheduled" && (
                        <Button
                          onClick={() => handleCancelAppointment(visit.id)}
                          variant="outline"
                          size="sm"
                          className="text-xs px-3 py-1 h-auto rounded-full hover:border-blue-600 hover:text-blue-600"
                        >
                          <XMarkIcon className="h-3 w-3" />
                          Cancel
                        </Button>
                      )}
                      {visit.appointmentStatus === "completed" &&
                        visit.consultationID && (
                          <Button
                            onClick={() =>
                              handleDownload(
                                visit.consultationID,
                                visit.visitId
                              )
                            }
                            variant="outline"
                            size="sm"
                            className="text-xs px-3 py-1 h-auto rounded-full hover:border-green-600 hover:text-green-600"
                          >
                            <ArrowDownTrayIcon className="h-3 w-3" />
                            Download Report
                          </Button>
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
