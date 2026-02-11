import json
from openai import AsyncOpenAI
from app.core.config import settings
from app.schemas.copilot import ParsedSpecSchema

client = AsyncOpenAI(
    api_key=settings.PROXY_API_KEY,
    base_url=settings.PROXY_API_BASE_URL
)

from typing import Tuple
from app.schemas.copilot import ParsedSpecSchema

SYSTEM_PROMPT = """
Ты — старший инженер-геотехник компании "Digital Geotech Hub". 
Твоя задача: провести профессиональный технический аудит документа (спецификация или ТЗ).

Верни JSON со следующими полями:
- work_type (str): Тип работ.
- volume (float): Объем работ в тоннах/метрах.
- soil_type (str): Тип грунтов.
- required_profile (str): Требуемый профиль шпунта (если указан).
- depth (float): Глубина погружения шпунта.
- groundwater_level (float): Уровень грунтовых вод.
- special_conditions (list[str]): Особые условия (стесненность, наличие зданий рядом и т.д.).
- technical_summary (str): Профессиональное резюме объекта в формате Markdown. В резюме укажи: анализ задачи, оценку сложности (геология, стесненность), рекомендации по методу работ и критические риски.

Будь точен в извлечении данных. Техническое резюме должно быть экспертным и лаконичным.
"""

import re

def clean_numeric(val):
    if isinstance(val, (int, float)): return val
    if isinstance(val, str):
        # Extract digits, signs and dots
        clean = "".join(re.findall(r"[-+]?\d*\.?\d+", val))
        try: return float(clean)
        except: return None
    return None

async def parse_text_with_ai(text: str) -> Tuple[ParsedSpecSchema, str, float]:
    """
    Parses text and returns (StructuredData, MarkdownSummary, ConfidenceScore)
    """
    # 1. Structured Data
    data_response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "Извлеки технические данные в JSON. ВАЖНО: поля volume, depth, groundwater_level должны быть ЧИСЛАМИ (float) БЕЗ ЕДИНИЦ ИЗМЕРЕНИЯ (только цифры). Поля: work_type, volume, soil_type, required_profile, depth, groundwater_level, special_conditions (list)."},
            {"role": "user", "content": text}
        ],
        response_format={"type": "json_object"}
    )
    data = json.loads(data_response.choices[0].message.content)
    
    # Clean numeric fields just in case
    for field in ["volume", "depth", "groundwater_level"]:
        if field in data:
            data[field] = clean_numeric(data[field])

    parsed_data = ParsedSpecSchema(**data)

    # 2. Expert Summary
    summary_response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "Ты — старший инженер-геотехник. Напиши профессиональный экспертный аудит объекта на основе ТЗ в формате Markdown. Укажи: Анализ задачи, Сложность геологии, Рекомендации по шпунту и методу погружения, Критические риски."},
            {"role": "user", "content": text}
        ]
    )
    summary = summary_response.choices[0].message.content

    # 3. Confidence
    confidence = 0.98 if parsed_data.required_profile and parsed_data.volume else 0.85

    return parsed_data, summary, confidence

async def chat_with_ai(message: str, history: list, context: str = None) -> str:
    """
    Continues the conversation with AI based on technical context.
    """
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT}
    ]
    
    if context:
        messages.append({"role": "system", "content": f"КОНТЕКСТ ОБЪЕКТА (ТЗ):\n{context}"})
    
    # Add history
    for msg in history:
        messages.append({"role": msg.role, "content": msg.content})
    
    # Add new message
    messages.append({"role": "user", "content": message})
    
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=messages
    )
    
    return response.choices[0].message.content
