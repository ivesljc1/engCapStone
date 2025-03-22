import React from "react";

export default function Progress({ current, max }) {
  // Make sure we have valid numbers to work with
  const currentValue = typeof current === "number" ? current : 0;
  const maxValue = typeof max === "number" && max > 0 ? max : 1;

  // Calculate percentage completion using the validated values
  const percentage = Math.min(
    100,
    Math.max(0, (currentValue / maxValue) * 100)
  );

  return (
    <div className="w-full">
      {/* Progress percentage display */}
      <div className="flex justify-between text-sm text-gray-500 mb-1">
        <span>
          Question {currentValue} of {maxValue}
        </span>
        <span>{Math.round(percentage)}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
        <div
          className="bg-primary h-full transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
          aria-valuenow={currentValue}
          aria-valuemin="0"
          aria-valuemax={maxValue}
          role="progressbar"
          aria-label={`${currentValue} of ${maxValue} questions completed`}
        />
      </div>
    </div>
  );
}
