"use client";

import { useState } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * CaseCard Component
 * 
 * This component displays information about a medical case including
 * the title, description, last visit date, and visit count.
 * It includes interactive elements like "Update" and "View" buttons.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.caseData - The case data to display
 * @returns {JSX.Element} The rendered case card
 */
export default function CaseCard({ caseData }) {
  // State to track if update operation is in progress
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Format the last visit date for display
  const formattedDate = caseData.lastVisitDate ? 
    new Date(caseData.lastVisitDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : 'No visits';

  /**
   * Handles the update button click
   * This would typically trigger an API request in a real application
   */
  const handleUpdate = () => {
    setIsUpdating(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsUpdating(false);
    }, 1000);
  };

  return (
    <div className="p-6 border border-gray-200 rounded-[1.5rem] shadow-sm hover:shadow-sm hover:border-[#D7A8A0] transition-all duration-200 bg-white flex flex-col h-full">
      {/* Card Header with title and update button */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {caseData.title}
        </h3>
        {caseData.newReportCount > 0 && (
          <button 
            onClick={handleUpdate}
            disabled={isUpdating}
            className="text-xs text-primary hover:text-primary-hover"
          >
            {isUpdating ? 'Updating...' : `${caseData.newReportCount} update${caseData.newReportCount !== 1 ? 's' : ''}`}
          </button>
        )}
      </div>
      
      {/* Case description */}
      <div className="flex-grow">
        <p className="text-sm text-gray-600 mb-6 line-clamp-3 leading-relaxed">
          {caseData.description}
        </p>
      </div>
      
      {/* Case metadata */}
      <div className="grid grid-cols-2 gap-2 mb-4 mt-auto">
        <div>
          <p className="text-xs text-gray-500 mb-1">Last Visit</p>
          <p className="text-sm font-medium">
            {formattedDate}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Total Visits</p>
          <p className="text-sm font-medium">
            {caseData.visitCount || 0}
          </p>
        </div>
      </div>
      
      {/* View button */}
      <Link 
        href={`/dashboard/cases/${caseData.id}`} 
        passHref
      >
        <Button 
          className="w-full text-center py-2 bg-[#D7A8A0] text-white rounded-full hover:bg-[#c49991]"
        >
          View
        </Button>
      </Link>
    </div>
  );
} 