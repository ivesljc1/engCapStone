"use client";

import { useState, useEffect } from "react";
import SurveyAnswer from "@/components/ui/survey/surveyAnswer";
import Question from "@/components/ui/survey/surveyQuestion";
import LoadingPage from "@/components/ui/loadingPage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function QuestionPage() {
  const [userId, setUserId] = useState(null);

  const [questionnaireId, setQuestionnaireId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  const initializeQuestionnaire = async () => {
    try {
      const response = await fetch("/api/questionnaire/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setQuestionnaireId(data.questionnaire_id);
      await getNextQuestion(data.questionnaire_id);
    } catch (error) {
      console.error("Error initializing questionnaire:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNextQuestion = async (qId) => {
    // return a loading question while waiting for the next question
    setLoadingQuestion(true);
    setCurrentQuestion({ question: "Loading question..." });

    try {
      // First try to get an initialized/unanswered question
      const response = await fetch(
        `/api/questionnaire/get-most-recent-question?questionnaire_id=${qId}&user_id=${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("data received: ", data);

      // Handle different responses
      if (data) {
        //id is in the format of qxx, where xx is the id, get the id in integer format
        if (parseInt(data.id.substring(1)) > 15) {
          await fetch(
            "/api/questionnaire/get-conclusion?questionnaire_id=${qId}&user_id=${userId}",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          window.location.href = "/report";
        }
        console.log("Setting current question: ", data);
        setLoadingQuestion(false);
        setCurrentQuestion(data);
      } else if ("conclusion" in data) {
        // Redirect to results page or show completion message
        window.location.href = "/report";
      }
    } catch (error) {
      console.error("Error fetching/generating question:", error);
    }
  };

  const handleSubmit = async (answer) => {
    try {
      const response = await fetch("/api/questionnaire/record-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionnaire_id: questionnaireId,
          user_id: userId,
          question_id: currentQuestion.id,
          answer: answer,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await getNextQuestion(questionnaireId);
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  const handleBack = () => {
    // Implement back functionality if needed
    console.log("Going back");
  };

  useEffect(() => {
    const auth = getAuth();
    setLoading(true);

    // Check initial auth state
    if (auth.currentUser) {
      setUserId(auth.currentUser.uid);
    }

    // Listen for auth changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        window.location.href = "/login";
      }
    });

    return () => unsubscribe();
  }, []); // Auth listener setup only runs once

  // Separate useEffect for questionnaire initialization
  useEffect(() => {
    if (userId) {
      initializeQuestionnaire();
    }
  }, [userId]); // Run when userId changes

  if (loading) return <LoadingPage />;
  if (!currentQuestion) return <div>No questions available</div>;

  return (
    <div className="min-h-screen flex items-center justify-center py-6 xl:py-16">
      <div className="flex h-[calc(100vh-48px)] xl:h-[calc(100vh-128px)] max-w-[1440px] w-full mx-auto px-6 xl:px-28">
        <div className="w-1/2 pr-6">
          <Question title={currentQuestion.question} onBack={handleBack} />
        </div>

        <div className="w-1/2 pl-6 flex items-center justify-center">
          {loadingQuestion ? (
            <div></div>
          ) : (
            <SurveyAnswer
              type={currentQuestion.type}
              placeholder={currentQuestion.placeholder}
              options={currentQuestion.options}
              numOptions={currentQuestion.numOptions}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
