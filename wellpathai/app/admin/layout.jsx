"use client";

import AdminLayout from "../../components/ui/admin/AdminLayout";
import withAuth from "../hoc/withAuth";

// Create an authenticated admin layout using the withAuth HOC
// The second parameter 'true' ensures only admin users can access this layout
const AuthenticatedAdminLayout = withAuth(AdminLayout, true);

export default function AdminRootLayout({ children }) {
  return (
    <AuthenticatedAdminLayout>{children}</AuthenticatedAdminLayout>
  );
} 