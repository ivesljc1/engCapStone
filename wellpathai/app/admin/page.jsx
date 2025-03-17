"use client";

/**
 * AdminPage - Main admin dashboard page
 * 
 * This component serves as the main landing page for the admin section.
 * All content has been removed as requested.
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onLogout - Function to handle user logout
 * @returns {JSX.Element} The rendered admin dashboard page
 */
function AdminPage({ onLogout }) {
  return (
    <div>
      {/* Main content area - completely empty as requested */}
    </div>
  );
}

// Wrap the component with withAuth HOC to ensure only authenticated admins can access it
// The withAuth HOC is imported automatically through the layout.jsx file
export default AdminPage;
