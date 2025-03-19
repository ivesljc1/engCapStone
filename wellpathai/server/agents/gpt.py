from flask import jsonify
from openai import OpenAI
import json
import os
from dotenv import load_dotenv

load_dotenv(".env.local")

client = OpenAI(api_key = os.getenv("OPENAI_API_KEY"))

def generate_next_question(questionnaire_data):
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
        return response_data
    except json.JSONDecodeError:
        return {"status": "error", "error": "Failed to parse JSON response"}

def generate_conclusion(questionnaire_data):
    # Craft the prompt
    system_prompt = "You are a clinical advisor generating insightful health reports with actionable, personalized recommendations based on questionnaire data."
    user_prompt = f"""
    ### Instructions:
    1. Based on the patient's answers, generate an insightful health report with four distinct sections:
        
        a) For the **conclusion** section:
           - Focus on analyzing symptoms, patterns, and potential underlying causes
           - DO NOT repeat demographic information (age, gender) or directly restate questionnaire answers
           - Synthesize key insights and clinical implications of the information provided
           - Use third-person language (e.g., "The patient," "They") - never use "you" pronouns
        
        b) For the **suggestions** section:
           - Provide 3-5 specific, actionable recommendations
           - Each suggestion should be detailed and personalized (not generic advice)
           - Include specific lifestyle modifications, self-care approaches, or health strategies
           - When recommending supplements or tests, explain WHY they would be beneficial
        
        c) For the **otc_medications** section (over-the-counter recommendations):
           - ONLY include if appropriate based on the patient's symptoms and condition
           - Provide EXACTLY 2-3 relevant medication or product options (not 1, not 4+)
           - Your recommendations can include ANY over-the-counter products including:
              * Oral medications (tablets, capsules, liquids)
              * Topical products (creams, ointments, patches)
              * Medical devices (braces, massagers, hot/cold packs)
              * Supplements or vitamins when appropriate
           - For each recommendation, provide:
              * name: Full product name
              * medication_type: Format or type of product (e.g., "Tablet", "Cream", "Spray", "Patch", "Device", "Supplement")
              * purpose: How it helps with the specific symptom(s)
              * price_range: Approximate cost range (e.g., "$5-$15")
              * considerations: Important usage notes, potential side effects, and contraindications
           - If medications/products are not appropriate, return an empty array
        
        d) For the **clinical_notes** section (for healthcare providers):
           - Identify 2-4 key areas for clinical investigation
           - Suggest specific tests, examinations, or specialist referrals that would be appropriate
           - Note any red flags or priority concerns in the patient's data
           - Use professional medical terminology while keeping it understandable

    2. Only base your analysis on the provided answers - avoid speculative recommendations.

    ### Patient's Answers:
    {questionnaire_data}

    ### Response Format:
    ```json
    {{
    "conclusion": "Your clinical analysis here",
    "suggestions": ["detailed suggestion 1", "detailed suggestion 2", ...],
    "otc_medications": [
      {{
        "name": "Medication name",
        "medication_type": "Product type (Tablet, Cream, Device, etc.)",
        "purpose": "What it does for this specific condition",
        "price_range": "$X-$Y",
        "considerations": "Important usage notes, side effects, contraindications"
      }}
    ],
    "clinical_notes": ["clinical recommendation 1", "clinical recommendation 2", ...]
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
        return response_data
    except json.JSONDecodeError:
        return {"status": "error", "error": "Failed to parse JSON response"}

def generate_case_title(questionnaire_data):
    """
    Generate a concise title (max 2 words) for a case based on the answered questions in a questionnaire
    
    Args:
        questionnaire_data (dict): The questionnaire data containing the user's answers
        
    Returns:
        str: A generated title for the case
    """
    
    # Craft the prompt
    system_prompt = "You are a medical professional creating concise, informative case summaries."
    user_prompt = f"""
    ### Instructions:
    1. Based on the user's answers, generate two outputs:
       a) A concise summary description of the primary health condition or concern
       b) A brief title (maximum 2 words) that describes the primary health condition or concern
    
    2. For the description:
       - Focus immediately on the key symptoms, health concerns, or conditions
       - Describe specific characteristics, patterns, and notable features of the condition
       - DO NOT include demographic information (age, gender, height, weight)
       - DO NOT use phrases like "this case tracks" or refer to the case folder itself
       - DO NOT use time-bound descriptions that would become outdated (e.g., "for the past two weeks")
       - Write in clear, factual medical language that is still accessible to patients
       - Limit to 1-2 sentences that capture the essential clinical picture
    
    3. For the title:
       - Make it concise (1-2 words maximum)
       - Focus on the primary symptom or health concern
       - Use standard medical terminology that is still understandable to patients

    ### Examples of good descriptions:
    - "Recurring headaches characterized by pressure and throbbing sensations in the temples and behind the eyes. Symptoms are associated with stress, poor sleep, and sensitivity to light and noise."
    - "Persistent difficulty falling and staying asleep with associated daytime fatigue and concentration issues."
    - "General health assessment with focus on preventive care, lifestyle optimization, and establishing baseline health metrics."

    ### User's Answers:
    {questionnaire_data}

    ### Response Format:
    ```json
    {{
    "description": "Primary condition characterized by key symptoms and notable features. Associated with relevant triggers or factors.",
    "title": "Primary Condition"
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