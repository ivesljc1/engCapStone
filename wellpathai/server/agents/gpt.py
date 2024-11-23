from openai import OpenAI
client = OpenAI()



# Sample questionnaire data
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

# Craft the prompt
prompt = f"""
You are a helpful assistant. Analyze the following medical questionnaire and provide general wellness advice based on the information provided.

Questionnaire:
{questionnaire_data}
"""

# Make the API call
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {
            "role": "system", 
            "content": "You are a helpful assistant. Analyze the following medical questionnaire and provide general wellness advice based on the information provided."},
        {
            "role": "user", 
            "content": questionnaire_data}
    ]
)

# Get the advice
advice = response.choices[0].message

# Display the advice
print("General Wellness Advice:")
print(advice)
