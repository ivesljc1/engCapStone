'use client';

import PropTypes from 'prop-types';
import { useState } from 'react';
import MCQAnswer from './mcqAnswer';
import TextAnswer from './textAnswer';

const SurveyAnswer = ({ 
  type, 
  numOptions, 
  options,
  placeholder,
  onSubmit 
}) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [textInput, setTextInput] = useState('');

  const handleSubmit = () => {
    if (type === 'mcq') {
      onSubmit(selectedOption);
    } else {
      onSubmit(textInput);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className={type === 'mcq' ? 'w-fit' : 'w-full max-w-lg'}>
        {type === 'mcq' ? (
          <MCQAnswer
            numOptions={numOptions}
            options={options}
            onOptionSelect={onSubmit}
          />
        ) : (
          <TextAnswer
            placeholder={placeholder}
            value={textInput}
            onChange={setTextInput}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};

SurveyAnswer.propTypes = {
  type: PropTypes.oneOf(['mcq', 'text']).isRequired,
  numOptions: PropTypes.number,
  options: PropTypes.arrayOf(PropTypes.string),
  placeholder: PropTypes.string,
  onSubmit: PropTypes.func.isRequired
};

export default SurveyAnswer;
