"use client";

import PropTypes from "prop-types";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const Question = ({ title, onBack }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [fontSize, setFontSize] = useState(64);
  const logoSize = 64;

  useEffect(() => {
    const calculateOptimalFontSize = () => {
      if (!containerRef.current || !textRef.current) return;

      const container = containerRef.current;
      const availableHeight = container.clientHeight;
      const maxFontSize = 64;
      
      // Set initial font size based on word count
      const wordCount = title.split(/\s+/).length;
      
      // Define font size thresholds based on word count
      let initialFontSize;
      if (wordCount <= 10) {
        // Short questions (1-10 words) - large font
        initialFontSize = 64;
      } else if (wordCount <= 20) {
        // Medium questions (11-20 words) - medium font
        initialFontSize = 52;
      } else if (wordCount <= 35) {
        // Longer questions (21-35 words) - medium-small font
        initialFontSize = 40;
      } else if (wordCount <= 50) {
        // Very long questions (36-50 words) - small font
        initialFontSize = 30;
      } else {
        // Extremely long questions (51+ words) - very small font
        initialFontSize = 22;
      }
      
      // Set the initial font size
      textRef.current.style.fontSize = `${initialFontSize}px`;
      
      // Check if we need to adjust further using binary search
      const isOverflowing =
        textRef.current.scrollHeight > availableHeight ||
        textRef.current.scrollWidth > container.clientWidth;
      
      // If the word-count-based size is too large, adjust it down with binary search
      if (isOverflowing) {
        let min = 12; // Minimum readable font size
        let max = initialFontSize - 1;
        
        while (min <= max) {
          const currentFontSize = Math.floor((min + max) / 2);
          textRef.current.style.fontSize = `${currentFontSize}px`;
          
          const stillOverflowing =
            textRef.current.scrollHeight > availableHeight ||
            textRef.current.scrollWidth > container.clientWidth;
          
          if (stillOverflowing) {
            max = currentFontSize - 1;
          } else {
            min = currentFontSize + 1;
          }
        }
        
        // Final check to ensure we're not overflowing
        textRef.current.style.fontSize = `${max}px`;
        const finalIsOverflowing = 
          textRef.current.scrollHeight > availableHeight ||
          textRef.current.scrollWidth > container.clientWidth;
        
        // If still overflowing after the best font size, reduce a bit more for safety
        if (finalIsOverflowing && max > 12) {
          max = Math.max(12, max - 2);
        }
        
        setFontSize(max);
      } else {
        // If not overflowing, we can keep the word-count-based size
        setFontSize(initialFontSize);
      }
    };

    calculateOptimalFontSize();

    // Recalculate on window resize
    const resizeObserver = new ResizeObserver(calculateOptimalFontSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [title]);

  // Add CSS for custom scrollbar styles
  useEffect(() => {
    // Create a style element
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      /* Custom scrollbar styles for webkit browsers */
      .scrollbar-container::-webkit-scrollbar {
        width: 8px;
      }
      
      .scrollbar-container::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .scrollbar-container::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 20px;
        border: transparent;
      }
      
      .scrollbar-container::-webkit-scrollbar-thumb:hover {
        background-color: rgba(0, 0, 0, 0.3);
      }
      
      /* Only show scrollbar when hovering */
      .scrollbar-container {
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
      }
    `;
    
    // Append the style element to the document head
    document.head.appendChild(styleElement);
    
    // Clean up function to remove the style element when component unmounts
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className="h-full flex flex-col relative">
      {/* Logo at the top */}
      <div className="absolute top-7 left-0 w-full flex justify-start">
        <div className="flex w-16 h-16">
          <Image
            src="/logo_no_text.svg"
            alt="Logo"
            width={logoSize}
            height={logoSize}
            priority
          />
        </div>
      </div>

      {/* Content vertically centered with fixed height */}
      <div className="flex-grow flex justify-center items-center">
        {/* Fixed-size container with custom scrollbar */}
        <div
          className="w-full max-w-2xl h-[50vh] overflow-y-auto rounded-lg scrollbar-container"
          style={{ 
            maxHeight: "calc(100vh - 250px)",
          }}
        >
          {/* Text container */}
          <div ref={containerRef} className="flex w-full items-start p-1">
            <h2
              ref={textRef}
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: "125%",
              }}
              className="font-normal text-[#1E2E35] font-serif w-full text-left transition-all duration-300"
            >
              {title}
            </h2>
          </div>
        </div>
      </div>

      {/* Button fixed at the bottom and left-aligned */}
      <div className="absolute bottom-7 left-0 w-full flex justify-start">
        <button
          onClick={onBack}
          className="w-fit px-6 py-3 
            rounded-full
            border border-primary
            text-primary
            transition-all
            hover:bg-[#F0EDEE]
            active:bg-primary
            active:text-white
            active:scale-95"
        >
          Back
        </button>
      </div>
    </div>
  );
};

Question.propTypes = {
  title: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default Question;
