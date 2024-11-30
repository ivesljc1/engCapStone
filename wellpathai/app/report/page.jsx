"use client";

import Link from "next/link";
import { TestCard } from "@/components/ui/report/testCard";
import { SupplementCard } from "@/components/ui/report/supplementCard";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ReportPage(result) {
  /* For a conclution
  '''json
  {{
    "conclusion": "Your conclusion here",
    "suggestions": ["suggest1", "suggest2", ...]
  }}
    '''
  */

  // conclusion is in markdown format, extract them from result
  result = {
    conclusion:
      "### Summary\n\nBased on the survey, your health shows potential areas for improvement:\n\n- **Metabolic Health**: Elevated blood sugar risk.\n- **Vitamin Deficiency**: Symptoms suggest low Vitamin D levels.\n\nTaking proactive steps can help address these issues.",
    suggestions: [
      "Consider a blood test to evaluate HbA1c and fasting glucose levels.",
      "Include Vitamin D-rich foods like salmon and fortified milk in your diet.",
      "Adopt a consistent exercise routine to support overall cardiovascular health.",
    ],
  };
  const { conclusion, suggestions } = result;
  const [date, setDate] = useState(null);

  useEffect(() => {
    const today = new Date();
    const options = { month: "long", day: "numeric" };
    setDate(today.toLocaleDateString("en-US", options));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Left Container - Fixed Title */}
        <div className="fixed w-[400px] pt-8">
          <h1 className="text-[40px] font-serif leading-tight">
            Here's an health
            <br />
            report based on
            <br />
            survey results
          </h1>
          <Link
            href="/dashboard"
            className="inline-block mt-4 px-4 py-2 rounded-full border border-primary text-primary hover:bg-gray-50 transition-colors"
          >
            Home
          </Link>
        </div>

        {/* Right Container - Content with offset for fixed left container */}
        <div className="flex-1 ml-[400px]">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center mb-10">
              Report {date}
            </h2>
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
}
