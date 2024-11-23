"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // For Next.js navigation
import { getAuth, onAuthStateChanged } from "firebase/auth";

const withAuth = (Component, adminOnly = false) => {
  return (props) => {
    const [loading, setLoading] = useState(true); // For showing a loading state
    const [isAuthorized, setIsAuthorized] = useState(false); // To track if the user is allowed to view the page
    const [isLoggingOut, setIsLoggingOut] = useState(false); // To track logout state
    const router = useRouter();
    const auth = getAuth();

    useEffect(() => {
      const checkAuth = onAuthStateChanged(auth, async (user) => {
        if (!user && !isLoggingOut) {
          // User is not logged in, and this is not a logout action
          alert(
            "You must be logged in to view this page, redirecting to login..."
          );
          setTimeout(() => {
            router.push("/login"); // Redirect to login page
          }, 500);
          return;
        }

        if (user) {
          // User is logged in, check admin status if required
          const idTokenResult = await user.getIdTokenResult();
          const isAdmin = idTokenResult.claims.isAdmin || false;

          if (adminOnly && !isAdmin) {
            // If the page is admin-only and the user is not an admin
            alert("You are not authorized to view this page.");
            setTimeout(() => {
              router.push("/dashboard"); // Redirect to the user dashboard
            }, 500);
            return;
          }

          // If checks pass, allow the user to see the page
          setIsAuthorized(true);
          setLoading(false);
        }
      });

      return () => checkAuth();
    }, [auth, router, adminOnly, isLoggingOut]);

    if (loading) {
      // While checking authentication, display a loading spinner or blank screen
      return (
        <div className="fixed inset-0 bg-gray-100 flex justify-center items-center z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <div className="absolute text-center">
            <h2 className="text-lg font-semibold text-gray-900">Loading...</h2>
            <p className="text-gray-500">This won't take long.</p>
          </div>
        </div>
      );
    }

    if (!isAuthorized) {
      // Prevent rendering if the user is unauthorized
      return null;
    }

    // Render the wrapped component if authorized
    return (
      <Component
        {...props}
        onLogout={() => {
          setIsLoggingOut(true);
          auth.signOut().then(() => {
            router.push("/login");
          });
        }}
      />
    );
  };
};

export default withAuth;
