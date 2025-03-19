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
  const [otcMedications, setOtcMedications] = useState([]);
  const [clinicalNotes, setClinicalNotes] = useState([]);
  const [date, setDate] = useState(null);
  /* For a response format
  '''json
  {{
    "conclusion": "Analysis here",
    "suggestions": ["suggestion1", "suggestion2", ...],
    "otc_medications": [
      {
        "name": "Medication name",
        "purpose": "What it does for this specific condition",
        "price_range": "$X-$Y",
        "considerations": "Important usage notes, side effects, contraindications"
      }
    ],
    "clinical_notes": ["note1", "note2", ...]
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
      
      // Handle otc_medications if they exist in the response
      if (result[1].otc_medications) {
        setOtcMedications(result[1].otc_medications);
      }
      
      // Handle clinical_notes if they exist in the response
      if (result[1].clinical_notes) {
        setClinicalNotes(result[1].clinical_notes);
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
          
          {otcMedications && otcMedications.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-medium mb-4">Recommended Medications</h2>
              
              {/* Disclaimer card */}
              <div className="mb-6 p-4 bg-gray-50 border-l-4 border-primary rounded-r-lg text-sm">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-700">
                    The following medications are provided for informational purposes only. Always consult with a healthcare professional before taking any medication.
                  </p>
                </div>
              </div>
              
              {/* Medications grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {otcMedications.map((med, index) => (
                  <div key={index} className="bg-white overflow-hidden shadow-md rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                    {/* Card header and content in a single vertical layout */}
                    <div className="flex flex-col h-full">
                      {/* Header with medication name and price */}
                      <div className="p-6 pb-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-gray-800">{med.name}</h3>
                          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium text-sm">
                            {med.price_range}
                          </span>
                        </div>
                      </div>
                      
                      {/* Medication category tag - using medication_type if available or fallback */}
                      <div className="px-6">
                        <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/5 rounded-full">
                          {med.medication_type || med.purpose.split(' ')[0]}
                        </span>
                      </div>
                      
                      {/* Medication description */}
                      <div className="p-6 pt-4 flex-grow">
                        <div className="mb-6">
                          <h4 className="text-sm uppercase text-gray-500 font-medium mb-2">How it helps</h4>
                          <p className="text-gray-700">{med.purpose}</p>
                        </div>
                        
                        <div className="border-t border-gray-100 pt-4">
                          <h4 className="text-sm uppercase text-gray-500 font-medium mb-2">Considerations</h4>
                          <p className="text-gray-700">{med.considerations}</p>
                        </div>
                      </div>
                      
                      {/* Card footer with icon */}
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs text-gray-500">Consult doctor before use</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {clinicalNotes && clinicalNotes.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-medium mb-4">For Healthcare Providers:</h2>
              
              <div className="bg-white overflow-hidden shadow-md rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                <div className="flex flex-col h-full">
                  {/* Header with title */}
                  <div className="p-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center">
                      <span className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-500 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </span>
                      <h3 className="text-xl font-bold text-gray-800">Clinical Notes</h3>
                    </div>
                  </div>
                  
                  {/* Clinical notes content */}
                  <div className="p-6">
                    <ul className="space-y-4">
                      {clinicalNotes.map((note, index) => (
                        <li key={index} className="bg-gray-50 p-4 rounded-xl">
                          <div className="flex">
                            <div className="flex-shrink-0 mr-3">
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-500 rounded-full">
                                {index + 1}
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-700">{note}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Card footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>These notes are intended for healthcare professionals only</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
