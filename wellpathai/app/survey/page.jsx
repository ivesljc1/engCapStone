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
  const [progress, setProgress] = useState({ current: 0, max: 10 });


  const initializeQuestionnaire = async () => {
    setLoading(true);
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
      setCurrentQuestion(data.first_question["data"])
    } catch (error) {
      console.error("Error initializing questionnaire:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (answer) => {
    if (!answer || (typeof answer === 'string' && answer.trim().length === 0)) {
      console.error('Please provide a valid answer');
      return;
    }
    

    setLoading(true);

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
          // case_id: caseId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.is_complete) {
        // Questionnaire is complete
        setIsComplete(true);
        setCurrentQuestion(null);
      } else if (data.next_question) {
        // Set the next question from the bundled response
        setCurrentQuestion(data.next_question);
        
        // Update progress if available
        if (data.question_count && data.max_questions) {
          setProgress({
            current: data.question_count,
            max: data.max_questions
          });
        }
      } 
    } catch (err) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } finally {
      setLoading(false);
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
