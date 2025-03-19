from flask import jsonify
from openai import OpenAI
import json
import os
from dotenv import load_dotenv

load_dotenv(".env.local")

client = OpenAI(api_key = os.getenv("OPENAI_API_KEY"))

def generate_next_question(questionnaire_data):
    # Craft the prompt
    system_prompt = "You are an intelligent, empathetic healthcare assistant for a wellness app, guiding users through personalized, conversational health assessments. Your goal is to make users feel like they're talking with a caring, attentive healthcare professional rather than filling out a form."
    user_prompt = f"""
    ### Instructions:
    1. IMPORTANT: You can only ask a MAXIMUM of 8-9 questions total for the entire assessment, so each question must be highly strategic and provide maximum diagnostic value. 

    2. Review the user's previous answers carefully and generate the next most informative question:
        - AVOID asking questions that are redundant or similar to ones already asked - this wastes your limited question allowance
        - Do not ask for information the patient has already provided in previous answers
        - Frame questions in a genuinely conversational, human tone - as if you're speaking to the patient in person
        - Very important: Vary your question formats and approaches - don't use the same patterns repeatedly, aviod sounding repetitive
        - Use natural language patterns, including contractions (e.g., "I'm wondering" instead of "I am wondering")
        - Vary your question formats and approaches - don't use the same patterns repeatedly
        - Focus on clinically relevant follow-up questions that help narrow down potential diagnoses or identify the root cause
        - Prioritize questions that differentiate between diagnostic possibilities
        - When appropriate, explore potential triggers, timing, severity, duration, and alleviating/aggravating factors
        - Ask specific, concrete questions that are easy for the user to answer accurately
        - Avoid medical jargon unless absolutely necessary, preferring plain language
        - Show empathy and sensitivity when asking about difficult health topics

    3. For each question, specify:
        - **Type**: Choose the best format for clinical data collection:
            - "text" for open-ended responses (use sparingly for specific descriptions)
            - "choice" for single-selection questions (preferred for most questions)
            - "multiselect" for selecting multiple applicable options
        
        - **Options**: When using "choice" or "multiselect":
            - Limit to 2-5 clear, distinct options that cover the likely range of responses
            - Ensure options are mutually exclusive when using "choice" 
            - For severity scales, use descriptive labels (e.g., "Mild: noticeable but doesn't limit activities" rather than just "Mild")
            - Include "None of the above" or "Other" options when appropriate
            - For yes/no questions, consider adding "Unsure" as a third option when relevant

    4. EXAMPLES of conversational vs non-conversational questions:

        NON-CONVERSATIONAL (AVOID):
        - "Describe pain characteristics."
        - "Do you have family history of migraines?"
        - "Rate severity on scale 1-5."
        - "List all medications you are taking."
        
        CONVERSATIONAL (USE VARIED APPROACHES):
        - "Could you tell me a bit more about how the pain feels? Is it sharp, dull, throbbing, or something else?"
        - "I'm curious - has anyone in your family experienced similar headaches or been diagnosed with migraines?"
        - "On a scale from 1 to 5, where 1 is barely noticeable and 5 is severe enough to stop your daily activities, how would you rate the intensity of this pain?"
        - "What medications are helping you manage this issue right now?"
        - "Have you noticed any particular activities or foods that might trigger these symptoms?"
        - "Let's talk about how your sleep has been lately. Are you having any trouble falling asleep or staying asleep through the night?"

    5. Respond in JSON format as shown below.

    ### User's Previous Answers:
    {questionnaire_data}

    ### Response Format:
    ```json
    {{
    "question": "Your next question here, phrased conversationally and naturally as if spoken by a caring provider",
    "type": "text" | "choice" | "multiselect",
    "options": ["option1", "option2", ...]  // Required only for "choice" or "multiselect"
    }}
    ```
    """
    # Make the API call
    response = client.chat.completions.create(
        model="gpt-4o",
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
        model="gpt-4o",
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
        import json5
        response_data = json5.loads(json_string)
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
            model="gpt-4o",
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