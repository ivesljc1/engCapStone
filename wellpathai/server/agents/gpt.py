from flask import jsonify
from openai import OpenAI
from questionnaire.questionnaire import (
    get_all_questions_in_questionnaire, 
    add_question_to_questionnaire,
    record_result_to_questionnaire
)
import json

client = OpenAI(api_key="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")

def call_gpt(questionnaire_id, user_id):
    # Get the questionnaire data
    questionnaire_data = get_all_questions_in_questionnaire(questionnaire_id, user_id)
    

    # Craft the prompt
    system_prompt = "You are an assistant guiding a medical questionnaire for a wellness app. Your goal is to ask short, specific questions to help the user determine which supplements or tests they might need."

    user_prompt = f"""
    ### Instructions:
    1. Use the user's previous answers to decide the next most relevant question:
        - The maximum number of questions in total is 10.
        - Provide a conclusion when confident there is enough information to make accurate and relevant suggestions or have reached the total number of 25 questions.
        - If you have reached the maximum number of questions, provide a conclusion based on the data gathered.
        - **Do not** asking the same question twice where the user has previously answered, search through the user's previous answers to avoid repetition.
        - Otherwise, ask only the **most critical next question** to gather data.
    2. For each question, specify:
        - **Type**: "text", "choice", or "multiselect".
        - **Options**: Include options only for "choice" or "multiselect".
            - The **number of options must not exceed 5**.
            - You can include:
                - Yes/No/Not Sure questions in "choice" if relevant.
                - Scale questions on a range of 1-5 (e.g., 1 = low, 5 = high) in "choice" if applicable.
    3. Respond in JSON format as shown below.

    ### User's Previous Answers:
    {questionnaire_data}

    ### Response Formats:
    **For a question:**
    ```json
    {{
    "question": "Your next question here",
    "type": "text" | "choice" | "multiselect",
    "options": ["option1", "option2", ...]  // Required only for "choice" or "multiselect"
    }}
    ```
    **For a conclusion:**
    ```json
    {{
    "conclusion": "Your conclusion here",
    "suggestions": ["suggestion1", "suggestion2", ...]
    }}
    ```
    """

    
    # Make the API call
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0.5,
        messages=[
            {
                "role": "system", 
                "content": system_prompt
            },
            {
                "role": "user", 
                "content": user_prompt
            }
        ]
    )

    # Get the response content
    advice = response.choices[0].message.content

    # Strip the code block markers and newlines
    json_string = advice.strip("```json\n").strip("```")

    try:
        # Parse the JSON string
        response_data = json.loads(json_string)

        '''
        Response_data format should be like this:
        {
            "question": "How would you describe your diet?",
            "type": "multiselect",
            "options": [
                "Vegetarian", "Vegan", "Pescatarian", "Omnivore",
                "Low-carb", "Gluten-free", "None of the above"
            ]
        }
        '''

        print("Debugging output from response of gpt: ", response_data, flush=True)
        # response_data = {'question': 'How would you rate your overall energy levels on a scale of 1-5?', 'type': 'choice', 'options': ['1', '2', '3', '4', '5']}
        # Check if the response is a question or a conclusion
        if "question" in response_data:
            # Add the question to the questionnaire            
            success, message = add_question_to_questionnaire(questionnaire_id, user_id, response_data)
            if success:
                return response_data
            else:
                return {"status": "error", "error": message}

        elif "conclusion" in response_data:
            # Record the result in the questionnaire
            success, message = record_result_to_questionnaire(questionnaire_id, user_id, response_data)
            if success:
                return response_data
            else:
                return {"status": "error", "error": message}

        else:
            return {"status": "error", "error": "Unknown response format"}

    except json.JSONDecodeError:
        return {"status": "error", "error": "Failed to parse JSON response"}

def get_gpt_conclusion(questionnaire_id, user_id):
    # Get the questionnaire data
    questionnaire_data = get_all_questions_in_questionnaire(questionnaire_id, user_id)

    # Craft the prompt
    system_prompt = "You are an assistant guiding a medical questionnaire for a wellness app. Your goal is to ask short, specific questions to help the user determine which supplements or tests they might need."

    user_prompt = f"""
    ### Instructions:
    1. Use the user's previous answers to generate a conclusion based on the data gathered.:
        - Provide a conclusion with the gata gathered to make accurate and relevant suggestions.
    2. Respond in JSON format as shown below.

    ### User's Previous Answers:
    {questionnaire_data}

    ### Response Formats:
    **For a conclusion:**
    ```json
    {{
    "conclusion": "Your conclusion here",
    "suggestions": ["suggestion1", "suggestion2", ...]
    }}
    ```
    """

    # Make the API call
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0.5,
        messages=[
            {
                "role": "system", 
                "content": system_prompt
            },
            {
                "role": "user", 
                "content": user_prompt
            }
        ]
    )
    
    # Get the response content
    advice = response.choices[0].message.content
    
    # Strip the code block markers and newlines
    json_string = advice.strip("```json\n").strip("```")
    
    try:
        # Parse the JSON string
        response_data = json.loads(json_string)
        
        # Check if the response is a conclusion
        if "conclusion" in response_data:
            # Record the result in the questionnaire
            success, message = record_result_to_questionnaire(questionnaire_id, user_id, response_data)
            if success:
                return response_data
            else:
                return {"status": "error", "error": message}
        else:
            return {"status": "error", "error": "Unknown response format"}
    except json.JSONDecodeError:
        return {"status": "error", "error": "Failed to parse JSON response"}