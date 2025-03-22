import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PropTypes from "prop-types";

const ReportSection = ({
  questions,
  conclusion,
  suggestions,
  otcMedications,
  clinicalNotes,
}) => {
  const filteredQuestions = Array.isArray(questions)
    ? questions.filter((q) => !["q2", "q3"].includes(q.id))
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Left Container - Fixed Title */}
        <div className="fixed w-[400px] pt-8">
          <h1 className="text-[40px] font-serif leading-tight">
            Questionnaire
            <br />
            Report
            <br />
            <span className="text-lg font-sans text-gray-600">Patient View</span>
          </h1>
        </div>

        {/* Right Container - Content with offset for fixed left container */}
        <div className="flex-1 ml-[400px]">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center mb-10">Report</h2>
          </div>

          {/* 1. Conclusion Section */}
          {conclusion && (
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h2 className="text-xl font-medium">Conclusion</h2>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <ReactMarkdown
                  remarkPlugins={remarkGfm}
                  className="text-gray-700 prose prose-sm max-w-none"
                >
                  {conclusion}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* 2. Suggestions Section */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="bg-green-50 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h2 className="text-xl font-medium">Suggestions</h2>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <ul className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-green-600 text-xs font-medium">{index + 1}</span>
                    </div>
                    <span className="text-gray-700">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. Questions & Answers Section */}
          {filteredQuestions.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                  <span className="text-gray-700 font-bold">3</span>
                </div>
                <h2 className="text-xl font-medium">Questions & Answers</h2>
              </div>
              <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
                <div className="border-b border-gray-100 bg-gray-50 px-6 py-3">
                  <h3 className="font-medium text-gray-700">Your Responses</h3>
                </div>
                <div className="p-6">
                  <div className="divide-y divide-gray-100">
                    {filteredQuestions.map((q, index) => (
                      <div key={q.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex">
                          <div className="flex-shrink-0 mr-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-600 rounded-full">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-md font-medium text-gray-800 mb-1">
                              {q.question}
                            </h4>
                            <div className="bg-gray-50 p-3 rounded-lg text-gray-700">
                              {q.answer}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. Recommended Medications Section */}
          {otcMedications && otcMedications.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center mb-4">
                <div className="bg-rose-50 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                  <span className="text-rose-600 font-bold">4</span>
                </div>
                <h2 className="text-xl font-medium">Recommended Medications</h2>
              </div>

              {/* Disclaimer for healthcare providers */}
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg text-sm">
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 mt-0.5 text-blue-500 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-gray-700">
                    The patient has been informed that these medications are for informational purposes only 
                    and advised to consult with you before starting any new treatment. Please review these 
                    recommendations as part of your comprehensive care plan.
                  </p>
                </div>
              </div>

              {/* Medications Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {otcMedications.map((med, index) => (
                  <div key={index} className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-300">
                    {/* Header: Name and Price */}
                    <div className="flex justify-between items-center px-6 py-4">
                      <h3 className="text-lg font-bold text-gray-800">{med.name}</h3>
                      <span className="text-rose-400 font-medium">{med.price_range}</span>
                    </div>
                    
                    {/* Medication Type Tag */}
                    <div className="px-6 mb-4">
                      <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-300 bg-rose-50 rounded-full">
                        {med.medication_type || med.purpose.split(' ')[0]}
                      </span>
                    </div>
                    
                    {/* How It Helps Section */}
                    <div className="px-6 mb-4">
                      <h4 className="text-sm text-gray-500 font-medium uppercase mb-2">HOW IT HELPS</h4>
                      <p className="text-gray-700">{med.purpose}</p>
                    </div>
                    
                    {/* Considerations Section */}
                    <div className="px-6 mb-4">
                      <h4 className="text-sm text-gray-500 font-medium uppercase mb-2">CONSIDERATIONS</h4>
                      <p className="text-gray-700">{med.considerations}</p>
                    </div>
                    
                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-500">Consult doctor before use</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Clinical Notes Section */}
          {clinicalNotes && clinicalNotes.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center mb-4">
                <div className="bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold">5</span>
                </div>
                <h2 className="text-xl font-medium">For Healthcare Providers</h2>
              </div>

              <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
                <div className="p-6">
                  <ul className="space-y-4">
                    {clinicalNotes.map((note, index) => (
                      <li key={index} className="bg-blue-50 p-4 rounded-xl">
                        <div className="flex">
                          <div className="flex-shrink-0 mr-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full">
                              {index + 1}
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-700">{note}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>These notes are intended for healthcare professionals only</span>
                  </div>
                </div>
              </div>
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
  otcMedications: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      purpose: PropTypes.string.isRequired,
      price_range: PropTypes.string.isRequired,
      considerations: PropTypes.string.isRequired,
      medication_type: PropTypes.string,
    })
  ),
  clinicalNotes: PropTypes.arrayOf(PropTypes.string),
};

ReportSection.defaultProps = {
  otcMedications: [],
  clinicalNotes: [],
  questions: [],
};

export default ReportSection;
