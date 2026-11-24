
import os
from google import genai
from app.core.config import settings

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("API key not loaded.")
else:
    try:
        client = genai.Client(api_key=api_key)

        print("Checking available Gemini models...\n")

        for model in client.models.list():
            name = model.name or ""

            if "flash" in name.lower():
                print(name)

    except Exception as error:
        print("Model check failed:", error)
