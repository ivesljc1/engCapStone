'use client';

import PropTypes from 'prop-types';

const TextAnswer = ({ placeholder, value, onChange, onSubmit }) => {
  return (
    <div className="flex flex-col gap-4 w-full max-w-lg">
      <div className="flex flex-col gap-4">
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-6 py-4 
            h-48
            resize-none
            rounded-3xl
            border border-primary
            text-primary
            placeholder:text-primary/50
            focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <div className="-mb-16">
          <button
            onClick={onSubmit}
            className="float-right px-8 py-3 
              rounded-full
              bg-primary 
              text-white
              hover:bg-primary-hover
              transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

TextAnswer.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default TextAnswer;
