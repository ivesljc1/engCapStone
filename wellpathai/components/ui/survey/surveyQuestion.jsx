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
      let currentFontSize = maxFontSize;

      let min = 12;
      let max = maxFontSize;

      while (min <= max) {
        currentFontSize = Math.floor((min + max) / 2);
        textRef.current.style.fontSize = `${currentFontSize}px`;

        const isOverflowing =
          textRef.current.scrollHeight > availableHeight ||
          textRef.current.scrollWidth > container.clientWidth;

        if (isOverflowing) {
          max = currentFontSize - 1;
        } else {
          min = currentFontSize + 1;
        }
      }

      setFontSize(Math.min(maxFontSize, max));
    };

    calculateOptimalFontSize();

    const resizeObserver = new ResizeObserver(calculateOptimalFontSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [title]);

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
        {/* Fixed-size container with scroll */}
        <div
          className="w-full max-w-2xl h-[50vh] overflow-y-auto rounded-lg"
          style={{ maxHeight: "calc(100vh - 250px)" }}
        >
          {/* Text container */}
          <div ref={containerRef} className="flex w-full items-start">
            <h2
              ref={textRef}
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: "125%",
              }}
              className="font-normal text-[#1E2E35] font-serif w-full text-left"
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
