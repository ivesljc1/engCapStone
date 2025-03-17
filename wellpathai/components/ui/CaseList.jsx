"use client";

import { useState, useEffect } from "react";
import CaseCard from "./CaseCard";

/**
 * CaseList Component
 * 
 * This component displays a grid of case cards and handles
 * empty states when no cases are available.
 * 
 * @param {Object} props - Component props
 * @param {Array} props.cases - Array of case data objects
 * @param {boolean} props.loading - Whether the cases are currently loading
 * @returns {JSX.Element} The rendered case list
 */
export default function CaseList({ cases = [], loading = false }) {
  // State to handle loading animations
  const [isLoading, setIsLoading] = useState(loading);
  
  // Update loading state when prop changes
  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  // If loading, show skeleton UI
  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Cases:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3).fill().map((_, index) => (
            <div key={index} className="p-6 border border-gray-200 rounded-[1.5rem] bg-gray-50 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
              <div className="h-9 bg-gray-200 rounded-full w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If no cases, show empty state
  if (!cases || cases.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Cases:</h2>
        <div className="p-8 border border-gray-200 rounded-[1.5rem] bg-gray-50 text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Cases Found</h3>
          <p className="text-gray-500 mb-6">
            You don't have any cases on file yet. Start a health consultation to create your first case.
          </p>
          <a 
            href="/survey" 
            className="inline-block rounded-full bg-[#D7A8A0] px-6 py-3 text-white hover:bg-[#c49991] transition-colors"
          >
            Start Consultation
          </a>
        </div>
      </div>
    );
  }

  // Render case cards
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Cases:</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.map((caseData) => (
          <CaseCard key={caseData.id} caseData={caseData} />
        ))}
      </div>
    </div>
  );
} 