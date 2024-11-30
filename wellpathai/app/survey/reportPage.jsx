"use client";

import Link from "next/link";
import { TestCard } from "@/components/ui/report/testCard";
import { SupplementCard } from "@/components/ui/report/supplementCard";

export default function ReportPage(result) {
  const tests = [
    {
      image: "/placeholder.png",
      title: "Blood Test",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur amet labore.",
    },
    {
      image: "/placeholder.png",
      title: "Blood Test",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur amet labore.",
    },
  ];

  const supplements = [
    {
      id: 1,
      image: "/placeholder.png",
      name: "NatureWise, Oral Health Probiotics, For Children and Adults (120 Capsules)",
      price: "22.46",
    },
    {
      id: 2,
      image: "/placeholder.png",
      name: "NatureWise, Oral Health Probiotics, For Children and Adults (120 Capsules)",
      price: "19.99",
    },
    {
      id: 3,
      image: "/placeholder.png",
      name: "NatureWise, Oral Health Probiotics, For Children and Adults (120 Capsules)",
      price: "19.99",
    },
  ];

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
              Report Nov 23
            </h2>
            <p className="mt-4 text-gray-600">
              Based on your responses to the health survey, there are
              indications of potential risks related to metabolic health,
              vitamin deficiencies, and cardiovascular health. Addressing these
              areas proactively will help improve overall wellness.
            </p>
          </div>

          {/* Report Sections */}
          {[1, 2, 3, 4].map((section) => (
            <div key={section} className="mb-8">
              <h2 className="text-xl font-medium mb-4">Report subtitle</h2>
              <div className="space-y-4">
                <p className="text-gray-700">2.1 Metabolic Health</p>
                <p className="text-gray-600">
                  Survey Insight: You reported symptoms such as fatigue after
                  meals, difficulty managing weight, and occasional sugar
                  cravings, which could indicate blood sugar irregularities.
                </p>
                <div className="space-y-2">
                  <p className="text-gray-700">Recommendation:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>
                      Test: Fasting Blood Glucose and HbA1c to evaluate your
                      blood sugar control and risk of prediabetes.
                    </li>
                    <li>
                      Lifestyle Tip: Focus on reducing refined carbohydrates and
                      increasing dietary fiber through vegetables, whole grains,
                      and legumes.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ))}

          {/* Tests Section */}
          <div className="mb-8">
            <h2 className="text-xl font-medium mb-4">Test to do:</h2>
            <div className="grid gap-6">
              {tests.map((test, index) => (
                <TestCard
                  key={index}
                  image={test.image}
                  title={test.title}
                  description={test.description}
                />
              ))}
            </div>
          </div>

          {/* Supplements Section */}
          <div>
            <h2 className="text-xl font-medium mb-4">
              Recommended Supplements:
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {supplements.map((supplement) => (
                <SupplementCard
                  key={supplement.id}
                  image={supplement.image}
                  name={supplement.name}
                  price={supplement.price}
                  onClick={() => console.log("Clicked supplement:", supplement)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
