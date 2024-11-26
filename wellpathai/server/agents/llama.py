import torch
from transformers import pipeline

# Model and pipeline setup
model_id = "meta-llama/Llama-3.2-1B-Instruct"
pipe = pipeline(
    "text-generation",
    model=model_id,
    torch_dtype=torch.float16,
    device_map="auto",
)

# Input data
questionnaire_data = """
Age: 30
Gender: Male
Height: 5'9"
Weight: 165 lbs
Lifestyle: Sedentary job, exercises twice a week
Diet: Balanced diet with occasional fast food
Sleep: Averages 6 hours per night
Concerns: Feels fatigued during the day, occasional headaches
"""

# Flatten messages into a single prompt
messages = [
    {"role": "system", "content": "You are a medical assistant providing health advice!"},
    {"role": "user", "content": questionnaire_data},
]
# prompt = "\n".join([f"{message['role'].capitalize()}: {message['content']}" for message in messages])

# Generate output
outputs = pipe(
    messages,
    max_length=1000,
    truncation=True,
    temperature=0.2,  # Add diversity to the response
)

# Print generated text
print(outputs[0]["generated_text"])
