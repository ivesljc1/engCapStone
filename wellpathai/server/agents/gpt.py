from flask import jsonify
from openai import OpenAI
from questionnaire.questionnaire import (
    get_all_questions_in_questionnaire, 
    add_question_to_questionnaire,
    record_result_to_questionnaire
)
import json
import os
from dotenv import load_dotenv

load_dotenv(".env.local")

client = OpenAI(api_key = os.getenv("OPENAI_API_KEY"))

def call_gpt(questionnaire_id, user_id):
    # Get the questionnaire data
    questionnaire_data = get_all_questions_in_questionnaire(questionnaire_id, user_id)
    
    # Craft the prompt
    system_prompt = "You are an intelligent assistant for a wellness app, guiding users through dynamic, personalized questions to identify potential health needs."
    user_prompt = f"""
    ### Instructions:
    1. Use the user's previous answers to decide the next step:
        - Avoid redundant, similar or low-impact questions.
        - Evaluate the user's condition using reasoning akin to Bayesian networks (i.e., leverage probabilities to infer the most likely issues affecting the patient).
        - If a clear hypothesis emerges from the answers, solidify it by **asking deeper or related aspects of the symptoms** to confirm it.
        - If the user's answers diverge from the model's prediction, switch to the new direction and ask questions to confirm or deepen understanding of the new path.
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

    ### Response Format:
    ```json
    {{
    "question": "Your next question here",
    "type": "text" | "choice" | "multiselect",
    "options": ["option1", "option2", ...]  // Required only for "choice" or "multiselect"
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

        else:
            return {"status": "error", "error": "Unknown response format"}

    except json.JSONDecodeError:
        return {"status": "error", "error": "Failed to parse JSON response"}

def get_gpt_conclusion(questionnaire_id, user_id):
    # Get the questionnaire data
    questionnaire_data = get_all_questions_in_questionnaire(questionnaire_id, user_id)

    # Craft the prompt
    system_prompt = "You are a health assistant generating concise wellness report and personalized recommendations for supplements or tests based on users' questionnaire responses."
    user_prompt = f"""
    ### Instructions:
    1. Based on the user's answers, generate a concise and actionable health report:
        - Provide a **conclusion** that synthesizes the data and identifies key health recommendations.
        - Include **suggestions** for supplements, tests, or lifestyle changes relevant to the user's responses.
    2. Avoid making guessing recommendations. Base all suggestions on the provided answers.

    ### User's Answers:
    {questionnaire_data}

    ### Response Formats:
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
        print("Debugging output from response of gpt: ", response_data, flush=True)

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

def generate_case_title(questionnaire_id, user_id):
    """
    Generate a concise title (max 2 words) for a case based on the answered questions in a questionnaire
    
    Args:
        questionnaire_data (dict): The questionnaire data containing the user's answers
        
    Returns:
        str: A generated title for the case
    """
    
    questionnaire_data = get_all_questions_in_questionnaire(questionnaire_id, user_id)

    if not questionnaire_id:
        return None
    
    # Craft the prompt
    system_prompt = "You are a medical assistant tasked with creating concise, descriptive titles."
    user_prompt = f"""
    ### Instructions:
    1. Based on the user's answers, generate a short description and a concise title with a maximum of 2 words.
    2. The title should be descriptive of the health condition or main concern.
    3. Use medical terminology when appropriate.

    ### User's Answers:
    {questionnaire_data}

    ### Response Format:
    ```json
    {{
    "description": "Your description here",
    "title": "Your Title Here"
    }}
    ```
    """
    
    # Make the API call
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.7,
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
        content = response.choices[0].message.content
        
        # Strip the code block markers and newlines
        json_string = content.strip("```json\n").strip("```")
        
        # Parse the JSON string
        response_data = json.loads(json_string)
        
        if "title" and "description" in response_data:
            return response_data["description"], response_data["title"]
        else:
            print("Error: No title in GPT response")
            return None
            
    except Exception as e:
        print(f"Error generating case title: {str(e)}")
        return None