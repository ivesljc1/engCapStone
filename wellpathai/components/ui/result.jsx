"use client";

import PropTypes from "prop-types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ReportSection = ({ conclusion, suggestions, otcMedications, clinicalNotes }) => {
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

          {otcMedications && otcMedications.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-medium mb-4">Recommended Medications</h2>
              
              {/* Disclaimer card */}
              <div className="mb-6 p-4 bg-gray-50 border-l-4 border-primary rounded-r-lg text-sm">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-700">
                    The following medications are provided for informational purposes only. Always consult with a healthcare professional before taking any medication.
                  </p>
                </div>
              </div>
              
              {/* Medications grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {otcMedications.map((med, index) => (
                  <div key={index} className="bg-white overflow-hidden shadow-md rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                    {/* Card header and content in a single vertical layout */}
                    <div className="flex flex-col h-full">
                      {/* Header with medication name and price */}
                      <div className="p-6 pb-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-gray-800">{med.name}</h3>
                          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium text-sm">
                            {med.price_range}
                          </span>
                        </div>
                      </div>
                      
                      {/* Medication category tag - using medication_type if available or fallback */}
                      <div className="px-6">
                        <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/5 rounded-full">
                          {med.medication_type || med.purpose.split(' ')[0]}
                        </span>
                      </div>
                      
                      {/* Medication description */}
                      <div className="p-6 pt-4 flex-grow">
                        <div className="mb-6">
                          <h4 className="text-sm uppercase text-gray-500 font-medium mb-2">How it helps</h4>
                          <p className="text-gray-700">{med.purpose}</p>
                        </div>
                        
                        <div className="border-t border-gray-100 pt-4">
                          <h4 className="text-sm uppercase text-gray-500 font-medium mb-2">Considerations</h4>
                          <p className="text-gray-700">{med.considerations}</p>
                        </div>
                      </div>
                      
                      {/* Card footer with icon */}
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs text-gray-500">Consult doctor before use</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {clinicalNotes && clinicalNotes.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-medium mb-4">For Healthcare Providers:</h2>
              
              <div className="bg-white overflow-hidden shadow-md rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                <div className="flex flex-col h-full">
                  {/* Header with title */}
                  <div className="p-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center">
                      <span className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-500 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </span>
                      <h3 className="text-xl font-bold text-gray-800">Clinical Notes</h3>
                    </div>
                  </div>
                  
                  {/* Clinical notes content */}
                  <div className="p-6">
                    <ul className="space-y-4">
                      {clinicalNotes.map((note, index) => (
                        <li key={index} className="bg-gray-50 p-4 rounded-xl">
                          <div className="flex">
                            <div className="flex-shrink-0 mr-3">
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-500 rounded-full">
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
                  
                  {/* Card footer */}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ReportSection.propTypes = {
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
};

export default ReportSection;
