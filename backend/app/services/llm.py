import json
from openai import AsyncOpenAI
from app.core.config import settings
from app.schemas.copilot import ParsedSpecSchema

client = AsyncOpenAI(
    api_key=settings.PROXY_API_KEY,
    base_url=settings.PROXY_API_BASE_URL
)

SYSTEM_PROMPT = """
Ты — ведущий инженер-сметчик компании "Digital Geotech Hub". 
Твоя задача: проанализировать сырой текст спецификации или технического задания и извлечь данные для расчета стоимости работ.

Извлеки следующие данные строго в формате JSON:
1. work_type: тип работ (например: вдавливание шпунта, погружение шпунта вибропогружателем, бурение).
2. volume: объем работ (только число, в погонных метрах или тоннах).
3. soil_type: тип или категория грунта, если указаны.
4. required_profile: марка/тип шпунта (например: Л5-УМ, Л4, VL606).

Если данные отсутствуют, используй null. 
Отвечай ТОЛЬКО чистым JSON, без пояснений и Markdown разметки.
"""

async def parse_text_with_ai(text: str) -> ParsedSpecSchema:
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Текст спецификации:\n\n{text}"}
        ],
        response_format={"type": "json_object"}
    )
    
    content = response.choices[0].message.content
    data = json.loads(content)
    return ParsedSpecSchema(**data)
