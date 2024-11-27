'use client';

import PropTypes from 'prop-types';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

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
        
        const isOverflowing = textRef.current.scrollHeight > availableHeight ||
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
    <div className="h-full flex flex-col justify-between">
      <div className="invisible">
        <button className="px-6 py-3">Placeholder</button>
      </div>
      
      <div className="flex flex-col items-start h-1/2">
        {/* Logo with margin compensation */}
        <div className="w-16 h-16 -mb-16">
          <Image 
            src="/logo_no_text.svg"
            alt="Logo"
            width={logoSize}
            height={logoSize}
            priority
          />
        </div>

        {/* Text container with top padding to prevent overlap */}
        <div ref={containerRef} className="h-full w-full pt-20">
          <h2 
            ref={textRef}
            style={{ 
              fontSize: `${fontSize}px`,
              lineHeight: '125%'
            }}
            className="font-normal text-[#1E2E35] font-serif w-full"
          >
            {title}
          </h2>
        </div>
      </div>

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
  );
};

Question.propTypes = {
  title: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired
};

export default Question;
