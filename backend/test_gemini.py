
import os
import time
from google import genai
from app.core.config import settings

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = "gemini-3.6-flash"

print("Testing model:", model)

try:
    interaction = client.interactions.create(
        model=model,
        input="Reply with exactly one word: CONNECTED",
        background=True,
        timeout=30000
    )

    print("Interaction ID:", interaction.id)

    for attempt in range(8):
        time.sleep(5)

        result = client.interactions.get(
            id=interaction.id,
            timeout=20000
        )

        print(f"Attempt {attempt + 1}: {result.status}")

        if str(result.status).lower() == "completed":
            print("SUCCESS:", result.output_text)
            break

        if str(result.status).lower() in ("failed", "cancelled"):
            print("FAILED:", result.errors)
            break

    else:
        print("Still processing.")

except Exception as error:
    print("ERROR:", type(error).__name__, str(error))
