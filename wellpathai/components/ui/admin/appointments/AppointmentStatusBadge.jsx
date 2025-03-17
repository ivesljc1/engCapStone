/**
 * AppointmentStatusBadge Component
 * 
 * This component displays a colored badge indicating the appointment status.
 * Different statuses have different colors:
 * - scheduled: blue
 * - cancelled: red
 * 
 * @param {Object} props - Component props
 * @param {string} props.status - The appointment status
 * @returns {JSX.Element} The rendered status badge
 */
export default function AppointmentStatusBadge({ status }) {
  // Define color schemes for different statuses
  const statusStyles = {
    scheduled: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
  };

  // Get the appropriate style for the current status
  const style = statusStyles[status] || "bg-gray-100 text-gray-800";

  // Capitalize the first letter of the status for display
  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {displayStatus}
    </span>
  );
} 