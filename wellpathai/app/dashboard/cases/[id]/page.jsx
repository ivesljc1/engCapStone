"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import CaseBreadcrumb from '@/components/ui/CaseBreadcrumb';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatDateShort } from '@/lib/formatDate';

/**
 * CaseDetailPage Component
 * 
 * This page displays detailed information about a specific case,
 * showing a summary and a table of all visits with downloadable reports.
 * 
 * @returns {JSX.Element} The rendered case detail page
 */
export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params.id;
  
  // State for case data
  const [caseData, setCaseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch case data
  useEffect(() => {
    const fetchCaseData = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await fetch(`/api/cases/${caseId}`);
        // const data = await response.json();
        
        // For now, we'll use our JSON file
        const response = await import('@/data/userCases.json');
        const allCases = response.default;
        const foundCase = allCases.find(c => c.id.toString() === caseId);
        
        if (foundCase) {
          setCaseData(foundCase);
        } else {
          console.error("Case not found");
        }
      } catch (error) {
        console.error("Error fetching case data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCaseData();
  }, [caseId]);
  
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
  
  if (!caseData) {
    return (
      <div className="px-6 py-8">
        <CaseBreadcrumb />
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Case Not Found</h2>
          <p className="text-gray-600 mb-6">The case you're looking for doesn't exist or you don't have access to it.</p>
          <Link href="/dashboard" className="rounded-full bg-[#D7A8A0] px-6 py-3 text-white hover:bg-[#c49991]">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  // Format date for display
  const formatVisitDate = (date) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };
  
  // Simulate visit data since we only have IDs in our JSON
  const visitDates = [
    "2025-03-16",
    "2025-02-28",
    "2025-02-10",
    "2025-01-15",
    "2024-12-20"
  ];
  
  // Generate fake visits if needed
  const simulateVisits = () => {
    // In a real app, these would be fetched from an API
    // Here we're generating data based on the visit IDs
    if (!caseData.visits || caseData.visits.length === 0) return [];
    
    return caseData.visits.map((visitId, index) => ({
      id: visitId,
      date: visitDates[index % visitDates.length], // Cycle through dates
      hasQuestionnaire: true,
      hasReport: index % 2 === 0 // Every other visit has a report
    }));
  };
  
  const visits = simulateVisits();
  
  // Handle download (would be a real download in a production app)
  const handleDownload = (type, visitId) => {
    console.log(`Downloading ${type} for visit ${visitId}`);
    // In a real app, this would trigger a file download
  };
  
  return (
    <div className="px-6 py-8">
      <CaseBreadcrumb caseName={caseData.title} />
      
      {/* Case Header */}
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{caseData.title}</h1>
      <p className="text-gray-600 mb-8">
        Here is a AI generated summary about the case. Generated based on the all the past visits and updates.
      </p>
      
      {/* Visits Table */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 uppercase mb-4">Your Visits</h2>
        
        <div className="overflow-x-auto rounded-[1.5rem] border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Questionnaire Report
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consultation Report
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visits.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                    No visits recorded for this case yet.
                  </td>
                </tr>
              ) : (
                visits.map((visit, index) => {
                  const isNewReport = index === 0 && caseData.newReportCount > 0;
                  
                  return (
                    <tr key={visit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatVisitDate(visit.date)}
                        {isNewReport && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            New Report
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        {visit.hasQuestionnaire ? (
                          <button 
                            onClick={() => handleDownload('questionnaire', visit.id)}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            Download
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        {visit.hasReport ? (
                          <button 
                            onClick={() => handleDownload('report', visit.id)}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            Download
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}