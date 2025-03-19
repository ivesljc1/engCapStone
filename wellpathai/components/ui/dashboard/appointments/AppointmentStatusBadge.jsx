/**
 * AppointmentStatusBadge Component
 *
 * This component displays a colored badge indicating the appointment status.
 * Different statuses have different colors:
 * - scheduled: blue
 * - completed: green
 * - cancelled: red
 *
 * @param {Object} props - Component props
 * @param {string} props.appointmentStatus - The appointment status
 * @returns {JSX.Element} The rendered status badge
 */
export default function AppointmentStatusBadge({ appointmentStatus, endTime }) {
  const now = new Date();
  const appointmentEndTime = new Date(endTime); // Convert Firestore string to Date

  // If the appointment has ended, override the status to "completed"
  if (appointmentEndTime < now) {
    appointmentStatus = "completed";
  }

  // Define color schemes for different statuses
  const statusStyles = {
    scheduled: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-200 text-red-900",
  };

  if (appointmentStatus == "confirmed") {
    appointmentStatus = "scheduled";
  }

  // Get the appropriate style for the current status
  const style = statusStyles[appointmentStatus] || "bg-gray-100 text-gray-800";

  // Capitalize the first letter of the status for display
  const displayStatus =
    appointmentStatus.charAt(0).toUpperCase() + appointmentStatus.slice(1);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {displayStatus}
    </span>
  );
}
