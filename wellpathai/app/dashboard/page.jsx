"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CaseBreadcrumb from '@/components/ui/CaseBreadcrumb';
import CaseList from '@/components/ui/CaseList';

/**
 * DashboardPage Component
 * 
 * This is the main dashboard page that displays:
 * 1. A welcome header with a start survey button
 * 2. The user's cases list with case cards
 * 
 * @returns {JSX.Element} The rendered dashboard page
 */
export default function DashboardPage() {
  // State to hold the cases data
  const [cases, setCases] = useState([]);
  // State to track if the data is loading
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate fetching cases data from an API
  useEffect(() => {
    // This would normally be a fetch call to your API
    const loadCases = async () => {
      try {
        // In a real app, this would be a fetch call
        // fetch('/api/cases').then(res => res.json())
        const response = await import('@/data/userCases.json');
        setCases(response.default);
      } catch (error) {
        console.error("Failed to load cases:", error);
        // In a real app, you might want to show an error state
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCases();
  }, []);
  
  return (
    <div className="px-6 py-8">
      {/* Breadcrumb Navigation */}
      <CaseBreadcrumb />
      
      {/* Welcome Section */}
      <div className="flex flex-col items-start gap-8 rounded-[1.5rem] bg-primary/25 p-10 mb-12">
        <div className="flex flex-col gap-4">
          <h1 className="text-[32px] font-semibold text-gray-900">
            Precision insights, tailored for your health.
          </h1>
          <p className="text-gray-600">
            Use our AI-powered tool to identify potential health concerns and receive
            tailored recommendations in minutes.
          </p>
        </div>
        <Link 
          href="/survey"
          className="rounded-full bg-[#D7A8A0] px-6 py-3 text-white hover:bg-[#c49991] transition-colors"
        >
          Start
        </Link>
      </div>
      
      {/* Cases Section */}
      <CaseList cases={cases} loading={isLoading} />
    </div>
  );
}
