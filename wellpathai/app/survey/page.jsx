"use client";
import { useEffect } from "react";
import { useState } from "react";

import ReportPage from "@/app/survey/reportPage";
import QuestionPage from "@/app/survey/questionPage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function Survey() {
  const [userId, setUserId] = useState(null);
  const [result, setResult] = useState(null);
  const [hasResult, setHasResult] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `/api/questionnaire/get-most-recent-result?user_id=${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      if (data.error) {
        // No report exists, show QuestionPage
        setHasResult(false);
        setResult(null);
      } else {
        // Report exists, show result
        setHasResult(true);
        setResult(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setHasResult(false);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      setUserId(user.uid);
      fetchData();
    }

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);
  return (
    <div>
      {/* if result is null, render questionpage, if not render report page */}
      {hasResult ? <ReportPage result={result} /> : <QuestionPage />}
    </div>
  );
}
