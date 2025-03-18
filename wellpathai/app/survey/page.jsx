"use client";

import { useState, useEffect } from "react";
import SurveyAnswer from "@/components/ui/survey/surveyAnswer";
import Question from "@/components/ui/survey/surveyQuestion";
import Progress from "@/components/ui/survey/progressBar";
import LoadingPage from "@/components/ui/loadingPage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function QuestionPage() {
  const [userId, setUserId] = useState(null);
  const [questionnaireId, setQuestionnaireId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ current: 1, max: 11 });
  const [caseId, setCaseId] = useState("");
  const [needsNewCase, setNeedsNewCase] = useState(false);

  // Initialize questionnaire for the user
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
      setCurrentQuestion(data.first_question["data"]);
    } catch (error) {
      console.error("Error initializing questionnaire:", error);
    } finally {
      setLoading(false);
    }
  };

  // Submit the user's answer to the current question
  const handleSubmit = async (answer) => {
    if (!answer || (typeof answer === "string" && answer.trim().length === 0)) {
      console.error("Please provide a valid answer");
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
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Store the new_case_flag when it exists in the response
      if (data.new_case_flag !== undefined) {
        console.log("Storing new_case_flag:", data.new_case_flag);
        setNeedsNewCase(data.new_case_flag);
      }

      // Check if this was the existing case selection (q2b)
      if (data.selected_case_id) {
        console.log("Storing selected_case_id:", data.selected_case_id);
        setCaseId(data.selected_case_id);
      }

      if (data.is_complete) {
        // Questionnaire is complete
        setCurrentQuestion(null);
        await generateVisit();
        await generateConclusion();
      } else if (data.next_question) {
        // Set the next question from the bundled response
        setCurrentQuestion(data.next_question);

        setProgress((prevProgress) => ({
          current: prevProgress.current + 1,
          max: prevProgress.max,
        }));
        // Check if we've reached the end of initialized questions and need to create a case
        console.log(data);
        if (
          data.next_question.initialized === false &&
          needsNewCase &&
          !caseId
        ) {
          await createNewCase();
          setNeedsNewCase(false);
        }
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
    } finally {
      setLoading(false);
    }
  };

  // function to generate the visit and redirect to the report page
  const generateVisit = async () => {
    setLoading(true);
    try {
      // Call the generate-visit endpoint with POST method and required parameters
      console.log("Generating visit...");
      const response = await fetch("/api/visit/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          caseId: caseId,
          questionnaireId: questionnaireId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Handle the response properly according to visit_api.py return structure
      if (data.visitId) {
        console.log(`Visit created successfully with ID: ${data.visitId}`);
        // You can store the visitId if needed for future reference
        // setVisitId(data.visitId);

        if (data.addToCase === true) {
          console.log("Visit was successfully added to the case");
        } else {
          console.warn("Visit created but not added to the case");
        }
      }
    } catch (error) {
      console.error("Error generating visit:", error);
      // You might want to add some user feedback here
    } finally {
      setLoading(false);
    }
  };

  // function to generate the conclusion and redirect to the report page
  const generateConclusion = async () => {
    setLoading(true);
    try {
      // Call the generate-result endpoint with POST method and required parameters
      const response = await fetch("/api/questionnaire/generate-result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionnaire_id: questionnaireId,
          user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data.status);

      // Redirect to the report page with the questionnaire_id
      window.location.href = `/report`;
    } catch (error) {
      console.error("Error generating conclusion:", error);
      // You might want to add some user feedback here
    } finally {
      setLoading(false);
    }
  };

  // Function to create a new case
  const createNewCase = async () => {
    try {
      console.log("Creating new case...");
      const response = await fetch("/api/cases/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          questionnaireId: questionnaireId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Case created successfully:", data.message);
        setCaseId(data.caseId);
      } else {
        console.error("Error creating case");
      }
    } catch (error) {
      console.error("Error creating case:", error);
    }
  };

  const handleBack = () => {
    window.location.href = "/dashboard";
  };

  // useEffect to check if the user is authenticated
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

  if (loading || !currentQuestion) return <LoadingPage />;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Add padding to the top for the progress bar */}
      <div className="pt-6 px-6 xl:px-28 max-w-[1440px] w-full mx-auto">
        <Progress current={progress.current} max={progress.max} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center py-4 xl:py-12">
        <div className="flex h-[calc(100vh-100px)] xl:h-[calc(100vh-180px)] max-w-[1440px] w-full mx-auto px-6 xl:px-28">
          <div className="w-1/2 pr-6">
            <Question title={currentQuestion.question} onBack={handleBack} />
          </div>

          <div className="w-1/2 pl-6 flex items-center justify-center">
            <SurveyAnswer
              type={currentQuestion.type}
              placeholder={currentQuestion.placeholder}
              options={currentQuestion.options}
              numOptions={currentQuestion.numOptions}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
