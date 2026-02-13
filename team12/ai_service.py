import json
import google.generativeai as genai

api_key = "AIzaSyDj6veF4073Tyz16phGyD7Ckp183jAIcpg"
genai.configure(api_key=api_key)


model = genai.GenerativeModel('gemini-1.5-flash')


def generate_ai_metadata_for_place(place_id, wiki_summary, wiki_tags, avg_rating):
    prompt = f"""
    You are an expert AI Travel Advisor for Iran tourism.
    Your task is to analyze a place and return strictly structured JSON metadata.

    Input Data:
    - Place ID / Name: {place_id}
    - Provided Summary: {wiki_summary}
    - Provided Tags: {wiki_tags}
    - Users Average Rating: {avg_rating}/5

    Instructions:
    1. Identify the place: If the "Provided Summary" is empty or insufficient, use your own broad knowledge base about tourist attractions (especially in Iran) to understand what this place is.
    2. Analyze Suitability: Based on the nature of the place, score its suitability from 0.0 (terrible) to 1.0 (perfect) for different travel styles, budgets, and seasons.
       - Think logically: A ski resort gets 1.0 for winter but 0.1 for summer. A luxury hotel gets 1.0 for LUXURY but 0.1 for ECONOMY. A noisy amusement park might get 0.2 for COUPLE but 0.9 for FRIENDS.
    3. Generate Tags: Create 3 short, attractive tags in Persian (e.g., "مناسب عکاسی", "طبیعت بکر", "تاریخی و آرام").
    4. Generate Reason: Write ONE compelling, short sentence in Persian explaining why someone should visit this place (e.g., "کاخی باشکوه با معماری بی‌نظیر که تجربه‌ای لوکس را در فصل بهار رقم می‌زند.").

    Output format:
    You MUST respond with a valid JSON object ONLY. Do not include markdown formatting like ```json or any other text.
    {{
      "ai_tags": ["تگ۱", "تگ۲", "تگ۳"],
      "ai_reasoning_base": "Persian reason here",
      "ai_suitability_scores": {{
        "travel_style": {{"SOLO": 0.0, "COUPLE": 0.0, "FAMILY": 0.0, "FRIENDS": 0.0, "BUSINESS": 0.0}},
        "budget_level": {{"ECONOMY": 0.0, "MODERATE": 0.0, "LUXURY": 0.0}},
        "season": {{"SPRING": 0.0, "SUMMER": 0.0, "AUTUMN": 0.0, "WINTER": 0.0}}
      }}
    }}
    """

    try:
        generation_config = genai.types.GenerationConfig(
            temperature=0.2,
            candidate_count=1,
            response_mime_type="application/json"
        )

        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )

        text = response.text.strip()

        if text.startswith("```json"):
            text = text[7:-3].strip()
        elif text.startswith("```"):
            text = text[3:-3].strip()

        return json.loads(text)

    except Exception as e:
        print(f"LLM Error for {place_id}: {e}")
        return {
            "ai_tags": ["مکان توریستی"],
            "ai_reasoning_base": "یک جاذبه گردشگری که ارزش بازدید دارد.",
            "ai_suitability_scores": {
                "travel_style": {"SOLO": 0.5, "COUPLE": 0.5, "FAMILY": 0.5, "FRIENDS": 0.5, "BUSINESS": 0.5},
                "budget_level": {"ECONOMY": 0.5, "MODERATE": 0.5, "LUXURY": 0.5},
                "season": {"SPRING": 0.5, "SUMMER": 0.5, "AUTUMN": 0.5, "WINTER": 0.5}
            }
        }