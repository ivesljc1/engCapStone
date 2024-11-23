"use client";
import withAuth from "../hoc/withAuth";
import { auth } from "../firebase";

function AdminPage({ onLogout }) {
  return (
    <div>
      <h1>Admin Page</h1>
      <p>
        Welcome to the admin page. Here you can manage the application settings
        and user data.
      </p>
    </div>
  );
}

export default withAuth(AdminPage);
