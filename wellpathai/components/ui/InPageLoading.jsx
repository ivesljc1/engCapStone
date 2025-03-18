import React from "react";
import CaseBreadcrumb from "@/components/ui/CaseBreadcrumb";

/**
 * InPageLoading Component
 *
 * A reusable loading skeleton UI component that displays a standardized
 * loading state for pages with content loading.
 *
 * @param {Object} props
 * @param {boolean} props.showBreadcrumb - Whether to show the breadcrumb navigation (default: true)
 * @param {number} props.itemCount - Number of skeleton items to show (default: 3)
 * @returns {JSX.Element} Loading skeleton UI
 */
export default function InPageLoading({
  showBreadcrumb = true,
  itemCount = 3,
}) {
  return (
    <div className="px-6 py-8">
      {showBreadcrumb && <CaseBreadcrumb />}
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded mb-6 w-1/3"></div>
        <div className="h-6 bg-gray-200 rounded mb-4 w-2/3"></div>
        <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
        <div className="h-6 bg-gray-200 rounded mb-8 w-3/4"></div>
        <div className="h-10 bg-gray-200 rounded mb-6 w-1/4"></div>
        <div className="bg-white rounded-[1.5rem] border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded mb-4 w-full"></div>
          <div className="space-y-4">
            {Array.from({ length: itemCount }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
