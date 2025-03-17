"use client";

import { Button } from "@/components/ui/button";
import { ClockIcon, UserIcon } from "@heroicons/react/24/outline";

/**
 * AppointmentCard Component
 * 
 * This component displays a single appointment in a card format 
 * following the exact Figma design.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.appointment - The appointment data
 * @returns {JSX.Element} The rendered appointment card
 */
export default function AppointmentCard({ appointment }) {
  if (!appointment) return null;

  // Extract month and day from the date
  const dateObj = new Date(appointment.date);
  const month = dateObj.toLocaleString('default', { month: 'short' });
  const day = dateObj.getDate();

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Left side with date display */}
      <div className="flex items-start gap-6">
        {/* Date box */}
        <div className="flex flex-col items-center justify-center min-w-[45px] text-center">
          <div className="text-sm text-gray-500">{month}</div>
          <div className="text-2xl font-bold">{day}</div>
        </div>

        {/* Appointment details */}
        <div className="flex flex-col space-y-1">
          {/* Time and case */}
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">{appointment.time}</span>
            <span className="text-sm font-medium ml-2">Case: {appointment.type}</span>
          </div>
          
          {/* Patient name */}
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">{appointment.patientName}</span>
          </div>
          
          {/* View Questionnaire Report link */}
          <div>
            <a 
              href="#" 
              className="text-sm text-primary-hover hover:text-primary underline"
              onClick={(e) => {
                e.preventDefault();
                // Handle view questionnaire report action
              }}
            >
              View Questionnaire Report
            </a>
          </div>
        </div>
      </div>

      {/* Right side - Upload Report button */}
      <Button 
        variant="outline" 
        size="sm" 
        className="rounded-full px-4 text-xs text-primary-hover border-primary-hover hover:bg-primary-hover hover:text-white"
      >
        Upload Report
      </Button>
    </div>
  );
} 