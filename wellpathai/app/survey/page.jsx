'use client';

import { useState } from 'react';
import SurveyAnswer from "@/components/ui/survey/surveyAnswer";
import Question from "@/components/ui/survey/surveyQuestion";
import { questions } from '@/data/questions';

export default function SurveyPage() {
  const handleSubmit = (answer) => {
    console.log("Submitted:", answer);
  };

  const handleBack = () => {
    console.log("Going back");
  };

  // @Allen 看这里, 如果要看其他问题, 请修改这里 改成 questions.textQuestion 或 questions.mcqQuestion
  // 这里是从 data/questions.js 里导入的问题
  const currentQuestion = questions.mcqQuestion;

  return (
    <div className="min-h-screen flex items-center justify-center py-6 xl:py-16">
      <div className="flex h-[calc(100vh-48px)] xl:h-[calc(100vh-128px)] max-w-[1440px] w-full mx-auto px-6 xl:px-28">
        <div className="w-1/2 pr-6">
          <Question 
            title={currentQuestion.title}
            onBack={handleBack}
          />
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
  );
}
