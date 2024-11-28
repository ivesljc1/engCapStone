'use client';

import PropTypes from 'prop-types';

const MCQAnswer = ({ options = [], numOptions = 4, selectedOption, onOptionSelect }) => {
  return (
    <div className="inline-flex flex-col gap-4 items-end">
      {Array.isArray(options) && options.slice(0, numOptions).map((option, index) => (
        <button
          key={index}
          onClick={() => onOptionSelect(option)}
          className={`px-6 py-4 
            rounded-3xl
            border border-primary
            text-left
            transition-all
            active:scale-95
            ${selectedOption === option 
              ? 'bg-primary text-white' 
              : 'text-primary hover:bg-[#F0EDEE]'
            }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

MCQAnswer.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string),
  numOptions: PropTypes.number,
  selectedOption: PropTypes.string,
  onOptionSelect: PropTypes.func.isRequired
};

export default MCQAnswer;
