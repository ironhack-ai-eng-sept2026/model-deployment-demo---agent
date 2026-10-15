import os

from openai import OpenAI


MODEL = "gpt-6-luna"

SYSTEM_PROMPT = """
You are an AI Travel Advisor that helps users plan personalized trips.

Your responsibilities:
- Greet the user and understand their travel plans.
- Gather the destination and trip duration.
- Ask about interests, such as food, museums, hiking, beaches,
  nightlife, and shopping.
- Ask about relevant preferences or constraints when useful.
- Ask follow-up questions only when necessary.
- Clarify contradictory or ambiguous information before generating
  the itinerary.

Once you have enough information, generate a travel plan containing:
1. A trip title.
2. A short trip summary.
3. A day-by-day itinerary.
4. Practical travel tips.
5. An estimated budget, with the currency and assumptions stated.

Be concise, practical, and friendly.
Do not ask unnecessary questions once you have enough information.

If the user has not provided enough information, continue the
conversation instead of generating an incomplete itinerary.

Do not invent precise prices, opening hours, or other time-sensitive
facts. Clearly identify estimates and information that needs verification.
"""


class TravelAdvisor:
    """Handles conversations with the AI Travel Advisor."""

    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")

        if not api_key:
            raise ValueError(
                "OPENAI_API_KEY is missing. "
                "Add it to your .env file."
            )

        self.client = OpenAI(api_key=api_key)

    def get_response(
        self,
        user_message: str,
        previous_response_id: str | None = None,
    ) -> tuple[str, str]:
        """Send a message and return its text and response ID."""

        request = {
            "model": MODEL,
            "instructions": SYSTEM_PROMPT,
            "input": user_message,
        }

        if previous_response_id:
            request["previous_response_id"] = previous_response_id

        response = self.client.responses.create(**request)

        return response.output_text, response.id