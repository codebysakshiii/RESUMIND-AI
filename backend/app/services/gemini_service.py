
import os
import asyncio

from google import genai
from app.core.config import settings


def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY", "")

    if not api_key:
        return None

    return genai.Client(
        api_key=api_key,
        http_options={"timeout": 30000}
    )


async def generate_ai_suggestions(prompt: str):
    client = get_gemini_client()

    if client is None:
        return {
            "success": False,
            "suggestion": None,
            "error": "Gemini API key is not configured."
        }

    try:
        model = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

        # Submit background generation request
        interaction = await asyncio.to_thread(
            client.interactions.create,
            model=model,
            input=prompt,
            background=True,
            timeout=30000
        )

        interaction_id = interaction.id

        if not interaction_id:
            raise RuntimeError("Gemini did not return an interaction ID.")

        print("Gemini interaction started:", interaction_id)

        # Poll for up to 5 minutes
        for attempt in range(60):
            await asyncio.sleep(5)

            result = await asyncio.to_thread(
                client.interactions.get,
                id=interaction_id,
                timeout=30000
            )

            status = str(result.status).lower()

            print(f"Gemini status ({attempt + 1}/60): {status}")

            if status == "completed":
                suggestion = result.output_text or ""

                if not suggestion.strip():
                    return {
                        "success": False,
                        "suggestion": None,
                        "error": "Gemini returned an empty response."
                    }

                return {
                    "success": True,
                    "suggestion": suggestion.strip(),
                    "error": None
                }

            if status in ("failed", "cancelled", "incomplete"):
                return {
                    "success": False,
                    "suggestion": None,
                    "error": f"Gemini task ended with status: {status}"
                }

        return {
            "success": False,
            "suggestion": None,
            "error": "Gemini response timed out after 5 minutes."
        }

    except Exception as error:
        print(
            f"Gemini API error: {type(error).__name__}: {error}"
        )

        return {
            "success": False,
            "suggestion": None,
            "error": "AI service is temporarily unavailable."
        }
