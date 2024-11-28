export const questions = {
  // Text input question example
  textQuestion: {
    id: "main_symptom",
    type: "text",
    title: "Let's start with the symptom that's troubling you the most.",
    placeholder: "e.g. Headache",
    validation: {
      required: true,
      minLength: 2,
      maxLength: 100
    },
    metadata: {
      field: "primary_symptom",
      category: "symptoms"
    }
  },

  // Multiple choice question example
  mcqQuestion: {
    id: "symptom_duration",
    type: "mcq",
    title: "How long have you been experiencing this?",
    numOptions: 4,
    options: [
      "Less than a day",
      "A few days",
      "More than a week",
      "More than a month"
    ],
    validation: {
      required: true,
      single: true
    },
    metadata: {
      field: "symptom_duration",
      category: "symptoms"
    }
  }
}; 