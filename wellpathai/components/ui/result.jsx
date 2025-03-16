"use client";

import PropTypes from "prop-types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ReportSection = ({ conclusion, suggestions }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Left Container - Fixed Title */}
        <div className="fixed w-[400px] pt-8">
          <h1 className="text-[40px] font-serif leading-tight">
            Questionnaire
            <br />
            report
          </h1>
        </div>

        {/* Right Container - Content with offset for fixed left container */}
        <div className="flex-1 ml-[400px]">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center mb-10">Report</h2>
          </div>
          <div className="mb-8">
            <h2 className="text-xl font-medium mb-4">Conclusion:</h2>
            <ReactMarkdown remarkPlugins={remarkGfm} className="text-gray-600">
              {conclusion}
            </ReactMarkdown>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-medium mb-4">Suggestions:</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

ReportSection.propTypes = {
  conclusion: PropTypes.string.isRequired,
  suggestions: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ReportSection;
