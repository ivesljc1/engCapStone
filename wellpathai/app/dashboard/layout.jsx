"use client";

import DashboardLayout from "../../components/ui/dashboard/DashboardLayout";
import withAuth from "../hoc/withAuth";

const AuthenticatedDashboardLayout = withAuth(DashboardLayout);

export default function DashboardRootLayout({ children }) {
  return (
    <AuthenticatedDashboardLayout>{children}</AuthenticatedDashboardLayout>
  );
}
