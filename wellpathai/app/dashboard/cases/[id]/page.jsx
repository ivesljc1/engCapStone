"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import InPageLoading from "@/components/ui/InPageLoading";
import CaseBreadcrumb from "@/components/ui/CaseBreadcrumb";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDateShort } from "@/lib/formatDate";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
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
  const [visits, setVisits] = useState([]);
  const [caseName, setCaseName] = useState("");
  const [caseDescription, setCaseDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);

  // Check auth state and set user ID
  useEffect(() => {
    const auth = getAuth();

    // Check initial auth state
    if (auth.currentUser) {
      setUserId(auth.currentUser.uid);
    }

    // Listen for auth changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        window.location.href = "/login";
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch case data when userId is available
  useEffect(() => {
    if (!userId || !caseId) return;

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
        setDataFetched(true);
      } catch (error) {
        console.error("Error fetching data:", error);
        setDataFetched(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCaseData();
  }, [caseId, userId]);

  // refresh function when user finish/cancel the booking in cal.com
  const refreshVisits = async () => {
    if (!caseId) return;

    try {
      setIsLoading(true); // Optional: show some loading state

      const response = await fetch(`/api/visit/getVisits?caseId=${caseId}`);
      if (!response.ok) throw new Error("Failed to refresh visits");

      const freshVisits = await response.json();
      setVisits(freshVisits);

      // Optional: Show a toast notification
      console.log("Visit data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing visits:", error);
    } finally {
      setIsLoading(false);
    }
  };
  //refresh visit data when window regains focus
  useEffect(() => {
    // Skip if we don't have necessary data
    if (!userId || !caseId) return;

    // Function to refresh data when window regains focus
    const handleFocus = () => {
      console.log("Window focused - checking for visit updates");
      refreshVisits();
    };

    // Add event listener for when the page regains focus
    window.addEventListener("focus", handleFocus);

    // Cleanup
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [userId, caseId]);

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

  // Loading state
  if (isLoading) {
    return <InPageLoading />;
  }

  // Case not found (only show after data has been fetched)
  if (dataFetched && (!caseName || !caseDescription)) {
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
      )}&visit=${encodeURIComponent(
        selectedVisit.visitDate
      )}&caseId=${caseId}&visitId=${visitId}&userId=${userId}`;

      // Open the URL in a new window
      window.open(calUrl, "_blank");
    } else {
      console.error(`Visit with ID ${visitId} not found`);
    }
  };

  // Handle cancel appointment
  const handleCancelAppointment = async (visitId) => {
    console.log(`Cancelling appointment for visit ${visitId}`);

    const request = await fetch(`/api/appointments/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        visitId: visitId,
      }),
    });

    if (!request.ok) {
      console.error("Failed to cancel appointment");
      return;
    }

    const data = await request.json();
    console.log(data.message);

    const appointmentId = data.appointmentId;
    const email = data.email;

    const calUrl = `https://cal.com/booking/${appointmentId}?flag.coep=false&isSuccessBookingPage=true&email=${encodeURIComponent(
      email
    )}&eventTypeSlug=1hour&uid=${appointmentId}&cancel=true`;

    window.open(calUrl, "_blank");
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
                          <CalendarIcon className="h-3 w-3 mr-0.5" />
                          Book Appointment
                        </Button>
                      )}
                      {visit.appointmentStatus === "scheduled" && (
                        <Button
                          onClick={() => handleCancelAppointment(visit.visitId)}
                          variant="outline"
                          size="sm"
                          className="text-xs px-3 py-1 h-auto rounded-full hover:border-blue-600 hover:text-blue-600"
                        >
                          <XMarkIcon className="h-3 w-3 mr-0.5" />
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
                            <ArrowDownTrayIcon className="h-3 w-3 mr-0.5" />
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
