"use client";

import React from "react";

const LoadingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="relative flex flex-col justify-center">
        <img
          alt="WellPathAI"
          src="/wplogo.svg"
          className="h-16 w-auto animate-pulse"
        />
        <div className="mt-3 flex justify-center">
          <div className="relative">
            {/* Loading spinner with brand colors */}
            <div className="w-10 h-10 rounded-full absolute border-4 border-solid border-gray-400"></div>
            <div className="w-10 h-10 rounded-full animate-spin absolute border-4 border-solid border-primary-600 border-t-transparent"></div>
          </div>
        </div>
        {/* <p className="mt-4 text-gray-600 text-sm font-medium">Loading...</p> */}
      </div>
    </div>
  );
};

export default LoadingPage;
