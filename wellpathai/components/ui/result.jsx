import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PropTypes from "prop-types";

const ReportSection = ({ questions, conclusion, suggestions }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Left Container - Fixed Title */}
        <div className="fixed w-[400px] pt-8">
          <h1 className="text-[40px] font-serif leading-tight">
            Questionnaire
            <br />
            Report
          </h1>
        </div>

        {/* Right Container - Content with offset for fixed left container */}
        <div className="flex-1 ml-[400px]">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center mb-10">Report</h2>
          </div>

          {/* Questions Section */}
          {questions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-medium mb-4">Questions & Answers:</h2>
              <div className="space-y-6">
                {questions.map((q, index) => (
                  <div
                    key={q.id}
                    className="p-4 border border-gray-200 rounded-lg shadow-sm"
                  >
                    <h3 className="text-lg font-semibold text-gray-800">
                      {index + 1}. {q.question}
                    </h3>
                    <p className="text-gray-600 mt-2">
                      <span className="font-medium">Answer:</span> {q.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conclusion Section */}
          {conclusion && (
            <div className="mb-8">
              <h2 className="text-xl font-medium mb-4">Conclusion:</h2>
              <ReactMarkdown
                remarkPlugins={remarkGfm}
                className="text-gray-600"
              >
                {conclusion}
              </ReactMarkdown>
            </div>
          )}

          {/* Suggestions Section */}
          {suggestions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-medium mb-4">Suggestions:</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                {suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ReportSection.propTypes = {
  questions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      question: PropTypes.string.isRequired,
      answer: PropTypes.string.isRequired,
    })
  ),
  conclusion: PropTypes.string.isRequired,
  suggestions: PropTypes.arrayOf(PropTypes.string).isRequired,
};

// Default props for optional questions
ReportSection.defaultProps = {
  questions: [],
};

export default ReportSection;
