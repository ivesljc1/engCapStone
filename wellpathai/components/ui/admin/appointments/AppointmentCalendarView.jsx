"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { DocumentTextIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import AppointmentStatusBadge from "./AppointmentStatusBadge";

// Dynamic imports for FullCalendar to avoid SSR issues
import dynamic from 'next/dynamic';
const FullCalendar = dynamic(() => 
  import('@fullcalendar/react').then(mod => mod.default), 
  { ssr: false }
);
const dayGridPlugin = dynamic(() => 
  import('@fullcalendar/daygrid').then(mod => mod.default), 
  { ssr: false }
);
const timeGridPlugin = dynamic(() => 
  import('@fullcalendar/timegrid').then(mod => mod.default), 
  { ssr: false }
);
const interactionPlugin = dynamic(() => 
  import('@fullcalendar/interaction').then(mod => mod.default), 
  { ssr: false }
);

/**
 * AppointmentCalendarView Component
 * 
 * This component displays appointments in a calendar view using FullCalendar.
 * It provides a more visual representation of appointments across time.
 * 
 * @param {Object} props - Component props
 * @param {Array} props.appointments - Array of appointment objects
 * @param {Function} props.onUploadReport - Function to handle report upload
 * @returns {JSX.Element} The rendered calendar view
 */
export default function AppointmentCalendarView({ appointments, onUploadReport }) {
  // State to track client-side rendering
  const [mounted, setMounted] = useState(false);
  // State for the selected appointment for the popup
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  // State for popup position
  const [popupPosition, setPopupPosition] = useState({ left: 0, top: 0 });

  // Format appointments for FullCalendar
  const calendarEvents = appointments.map(appointment => {
    // Parse date and time
    const [startTime, endTime] = appointment.time.split(' - ');
    
    // Get the appointment date
    const dateParts = appointment.date.split('-');
    const appointmentDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    
    // Format start and end times
    const startHour = parseInt(startTime.split(':')[0]);
    const startMinute = parseInt(startTime.split(':')[1].split(' ')[0]);
    const startPeriod = startTime.split(' ')[1];
    
    const endHour = parseInt(endTime.split(':')[0]);
    const endMinute = parseInt(endTime.split(':')[1].split(' ')[0]);
    const endPeriod = endTime.split(' ')[1];
    
    // Convert to 24-hour format if PM
    let startHour24 = startHour;
    if (startPeriod === 'PM' && startHour !== 12) startHour24 += 12;
    if (startPeriod === 'AM' && startHour === 12) startHour24 = 0;
    
    let endHour24 = endHour;
    if (endPeriod === 'PM' && endHour !== 12) endHour24 += 12;
    if (endPeriod === 'AM' && endHour === 12) endHour24 = 0;
    
    // Create Date objects for start and end times
    const startDate = new Date(appointmentDate);
    startDate.setHours(startHour24, startMinute);
    
    const endDate = new Date(appointmentDate);
    endDate.setHours(endHour24, endMinute);
    
    // Define color based on status
    let backgroundColor;
    switch (appointment.status) {
      case 'completed':
        backgroundColor = '#84cc16'; // green
        break;
      case 'scheduled':
        backgroundColor = '#3b82f6'; // blue
        break;
      default:
        backgroundColor = '#6b7280'; // gray
    }
    
    return {
      id: appointment.id,
      title: `${appointment.patientName} - ${appointment.case}`,
      start: startDate,
      end: endDate,
      backgroundColor,
      extendedProps: {
        appointment: appointment
      }
    };
  });

  // Set mounted to true on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Handle event click - show appointment details popup
   * @param {Object} info - FullCalendar event info
   */
  const handleEventClick = (info) => {
    const appointment = info.event.extendedProps.appointment;
    setSelectedAppointment(appointment);
    
    // Position the popup near the event
    const rect = info.el.getBoundingClientRect();
    setPopupPosition({
      left: rect.left + window.scrollX,
      top: rect.bottom + window.scrollY
    });
  };

  /**
   * Close the appointment details popup
   */
  const closePopup = () => {
    setSelectedAppointment(null);
  };

  if (!mounted) {
    return <div className="flex justify-center items-center h-96">Loading calendar...</div>;
  }

  return (
    <div className="h-[700px] relative">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={calendarEvents}
        eventClick={handleEventClick}
        height="100%"
        slotMinTime="08:00:00"
        slotMaxTime="18:00:00"
        allDaySlot={false}
        nowIndicator={true}
        weekends={true}
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
          startTime: '08:00',
          endTime: '18:00',
        }}
      />

      {/* Appointment Details Popup */}
      {selectedAppointment && (
        <div
          className="absolute z-10 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80"
          style={{
            left: `${popupPosition.left}px`,
            top: `${popupPosition.top}px`,
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold">{selectedAppointment.patientName}</h3>
            <button
              onClick={closePopup}
              className="text-gray-400 hover:text-gray-600"
            >
              &times;
            </button>
          </div>
          
          <div className="mb-3">
            <AppointmentStatusBadge status={selectedAppointment.status} />
          </div>
          
          <div className="space-y-2 text-sm mb-4">
            <p className="text-gray-500">{selectedAppointment.patientEmail}</p>
            <p><span className="font-medium">Date:</span> {new Date(selectedAppointment.date).toLocaleDateString()}</p>
            <p><span className="font-medium">Time:</span> {selectedAppointment.time}</p>
            <p><span className="font-medium">Case:</span> {selectedAppointment.case}</p>
            <p className="text-xs text-gray-600 mt-2">{selectedAppointment.caseDetails}</p>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs px-2 py-1 h-auto rounded-xl"
              onClick={() => {
                onUploadReport(selectedAppointment);
                closePopup();
              }}
            >
              <DocumentTextIcon className="h-3 w-3 mr-1" />
              Upload Report
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs px-2 py-1 h-auto rounded-xl"
            >
              <ClipboardDocumentListIcon className="h-3 w-3 mr-1" />
              View Questionnaire
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 