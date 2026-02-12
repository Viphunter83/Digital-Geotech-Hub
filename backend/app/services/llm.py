"""
LLM service — Chat AI for interactive geotechnical consultation.
Structured parsing is handled by geotech_analyzer.py (single source of truth).
"""
import json
from openai import AsyncOpenAI
from app.core.config import settings

client = AsyncOpenAI(
    api_key=settings.PROXY_API_KEY,
    base_url=settings.PROXY_API_BASE_URL,
)

CHAT_SYSTEM_PROMPT = """\
Ты — старший инженер-геотехник компании "Digital Geotech Hub" с 20+ летним опытом.
Отвечай на вопросы по геотехнике, шпунтовым ограждениям, свайным работам,
грунтам и нормативной документации (СП, ГОСТ, СНиП).
Будь точен, используй профессиональную терминологию. Отвечай на русском языке.
"""


async def chat_with_ai(message: str, history: list, context: str = None) -> str:
    """
    Interactive chat with the AI Senior Geotechnical Engineer.
    Used by the /api/v1/ai/chat endpoint.
    """
    messages = [{"role": "system", "content": CHAT_SYSTEM_PROMPT}]

    if context:
        messages.append({
            "role": "system",
            "content": f"КОНТЕКСТ ОБЪЕКТА (ТЗ):\n{context}",
        })

    for msg in history:
        messages.append({"role": msg.role, "content": msg.content})

    messages.append({"role": "user", "content": message})

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
    )

    return response.choices[0].message.content
