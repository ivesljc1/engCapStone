"use client";

import PropTypes from "prop-types";
import { useState } from "react";
import MCQAnswer from "./mcqAnswer";
import TextAnswer from "./textAnswer";

const SurveyAnswer = ({ type, options, placeholder, onSubmit }) => {
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [textInput, setTextInput] = useState("");

  const handleSubmit = () => {
    let answer;
    switch (type) {
      case "choice":
        if (!selectedOption) return;
        answer = selectedOption;
        break;
      case "multiselect":
        if (selectedOptions.length === 0) return;
        answer = selectedOptions;
        break;
      case "text":
        if (!textInput.trim()) return;
        answer = textInput;
        break;
    }
    onSubmit(answer);
    setSelectedOption("");
    setSelectedOptions([]);
    setTextInput("");
  };

  const handleMultiSelect = (option) => {
    setSelectedOptions((prev) => {
      if (prev.includes(option)) {
        return prev.filter((item) => item !== option);
      }
      return [...prev, option];
    });
  };

  return (
    <div className="w-full flex justify-center">
      <div className={type === "text" ? "w-full max-w-lg" : "w-fit"}>
        {type === "text" ? (
          <TextAnswer
            placeholder={placeholder}
            value={textInput}
            onChange={setTextInput}
            onSubmit={handleSubmit}
          />
        ) : (
          <MCQAnswer
            options={options}
            selected={type === "choice" ? selectedOption : selectedOptions}
            multiple={type === "multiselect"}
            onOptionSelect={
              type === "choice" ? setSelectedOption : handleMultiSelect
            }
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};

SurveyAnswer.propTypes = {
  type: PropTypes.oneOf(["choice", "multiselect", "text"]).isRequired,
  options: PropTypes.arrayOf(PropTypes.string),
  placeholder: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
};

export default SurveyAnswer;
