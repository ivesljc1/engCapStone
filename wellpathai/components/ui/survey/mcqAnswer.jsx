"use client";

import PropTypes from "prop-types";

const MCQAnswer = ({
  options = [],
  selected,
  multiple = false,
  onOptionSelect,
  onSubmit,
}) => {
  return (
    <div className="inline-flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        {options.slice(0, 5).map((option, index) => (
          <button
            key={index}
            onClick={() => onOptionSelect(option)}
            className={`px-6 py-4 
              rounded-3xl
              border border-primary
              text-left
              transition-all
              active:scale-95
              ${
                multiple
                  ? Array.isArray(selected) && selected.includes(option)
                    ? "bg-primary text-white"
                    : "text-primary hover:bg-[#F0EDEE]"
                  : selected === option
                  ? "bg-primary text-white"
                  : "text-primary hover:bg-[#F0EDEE]"
              }`}
          >
            {option}
          </button>
        ))}
      </div>
      <button
        onClick={onSubmit}
        className="px-8 py-3 
          rounded-full
          bg-primary 
          text-white
          hover:bg-primary-hover
          transition-colors"
      >
        Next
      </button>
    </div>
  );
};

MCQAnswer.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string),
  numOptions: PropTypes.number,
  selectedOption: PropTypes.string,
  onOptionSelect: PropTypes.func.isRequired,
};

export default MCQAnswer;
