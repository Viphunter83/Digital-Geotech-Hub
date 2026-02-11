import json
import logging
from typing import Dict, Any, List
from openai import AsyncOpenAI
from app.core.config import settings
from app.schemas.copilot import ParsedSpecSchema
from app.services.ai.document_processor import DocumentProcessor

class GeotechAnalyzer:
    """
    Expert system for geotechnical audit.
    Coordinates document processing, RAG with standards, and engineering risk assessment.
    """
    
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.PROXY_API_KEY,
            base_url=settings.PROXY_API_BASE_URL
        )
        self.standards_path = "app/data/standards/geotech_standards.json"
        try:
            with open(self.standards_path, "r", encoding="utf-8") as f:
                self.standards = json.load(f)
        except Exception:
            self.standards = {}

    async def analyze_project(self, processed_doc: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main entry point for professional audit.
        """
        full_text = processed_doc.get("full_text", "")
        sections = processed_doc.get("sections", {})
        
        # 1. High-fidelity Extraction pass
        technical_data = await self._extract_technical_parameters(full_text)
        
        # 2. Risk Assessment pass (using RAG context)
        risks = await self._assess_engineering_risks(technical_data, full_text)
        
        # 3. Generate Expert Summary
        summary = await self._generate_professional_summary(technical_data, risks, sections)
        
        return {
            "parsed_data": technical_data,
            "risks": risks,
            "technical_summary": summary,
            "confidence_score": 0.95 if technical_data.soil_type and technical_data.volume else 0.75
        }

    async def _extract_technical_parameters(self, text: str) -> ParsedSpecSchema:
        response = await self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Ты высококвалифицированный инженер-чертежник. Твоя задача — извлечь ТОЧНЫЕ параметры объекта из ТЗ. Верни только JSON."},
                {"role": "user", "content": f"Извлеки параметры ТЗ: {text[:15000]}"} # Limit to fit context
            ],
            response_format={"type": "json_object"}
        )
        data = json.loads(response.choices[0].message.content)
        return ParsedSpecSchema(**data)

    async def _assess_engineering_risks(self, data: ParsedSpecSchema, text: str) -> List[Dict[str, str]]:
        # Simulation of RAG: Inject standards context based on soil type
        soil_context = ""
        if data.soil_type:
            gost = self.standards.get("ГОСТ 25100-2020", {})
            for key, risk_desc in gost.get("risks", {}).items():
                if key in data.soil_type.lower():
                    soil_context += f"- НОРМАТИВНЫЙ РИСК: {risk_desc}\n"

        response = await self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Проанализируй инженерные риски объекта. Учитывай близость зданий, сложность грунтов и уровень вод. Верни список объектов {risk: str, impact: str}."},
                {"role": "user", "content": f"Данные объекта: {data.model_dump_json()}\nНормативы: {soil_context}\nРазрез: {text[:5000]}"}
            ],
            response_format={"type": "json_object"}
        )
        result = json.loads(response.choices[0].message.content)
        return result.get("risks", [])

    async def _generate_professional_summary(self, data: Any, risks: List[Any], sections: Dict[str, str]) -> str:
        response = await self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Напиши итоговый экспертный отчет в Markdown. Стиль: строгий, профессиональный, инженерный. Используй заголовки, списки и таблицы."},
                {"role": "user", "content": f"Параметры: {data}\nРиски: {risks}\nГеология (контекст): {sections.get('geology', 'Нет данных')}"}
            ]
        )
        return response.choices[0].message.content

# Singleton
geotech_analyzer = GeotechAnalyzer()
