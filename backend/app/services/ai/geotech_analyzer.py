"""
Expert AI system for geotechnical audit.
Coordinates document processing, RAG with standards, and engineering risk assessment.

Quick Wins applied:
- temperature=0.2 for deterministic technical output
- Full RAG across all 8 standards (not just ГОСТ 25100)
- Smart confidence score based on field completeness
- Improved prompts with role correction and structured output
"""
import json
import logging
from typing import Dict, Any, List, Tuple
from openai import AsyncOpenAI
from app.core.config import settings
from app.schemas.copilot import ParsedSpecSchema
from app.services.ai.document_processor import DocumentProcessor

logger = logging.getLogger(__name__)

# ── Constants ──
AI_MODEL = "gpt-4o"
AI_MODEL_CHEAP = "gpt-4o-mini"
AI_TEMPERATURE = 0.2  # Low temperature for deterministic technical extraction


class GeotechAnalyzer:
    """
    Expert system for geotechnical audit.
    Pipeline: Pre-validate → Extract → RAG Risk Assessment → Summary.
    """

    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.PROXY_API_KEY,
            base_url=settings.PROXY_API_BASE_URL,
        )
        self.standards_path = "app/data/standards/geotech_standards.json"
        try:
            with open(self.standards_path, "r", encoding="utf-8") as f:
                self.standards = json.load(f)
        except Exception:
            self.standards = {}

        # Heuristic keywords for quick validation
        self.geotech_keywords = [
            "шпунт", "сваи", "свая", "грунт", "геология", "котлован", "фундамент",
            "бурение", "вдавливание", "статическое", "динамическое",
            "уровень вод", "скважина", "разрез", "профиль", "основание",
            "несущая способность", "осадка", "деформация", "испытание",
        ]

    # ═══════════════════════════════════════════════
    # Public API
    # ═══════════════════════════════════════════════

    async def analyze_project(self, processed_doc: Dict[str, Any]) -> Dict[str, Any]:
        """Main entry point for professional audit."""
        full_text = processed_doc.get("full_text", "")
        sections = processed_doc.get("sections", {})

        # 0. Pre-validation
        is_valid, reason = await self._pre_validate_document(full_text)
        if not is_valid:
            raise ValueError(f"Not a geotechnical document: {reason}")

        # 1. Extract technical parameters
        technical_data = await self._extract_technical_parameters(full_text)

        # 2. Build RAG context from ALL standards
        rag_context = self._build_rag_context(technical_data, full_text)

        # 3. Risk assessment with full standards context
        risks = await self._assess_engineering_risks(technical_data, full_text, rag_context)

        # 4. Expert summary
        summary = await self._generate_professional_summary(
            technical_data, risks, sections, rag_context
        )

        # 5. Smart confidence
        confidence = self._compute_confidence(technical_data, full_text)

        return {
            "parsed_data": technical_data,
            "risks": risks,
            "technical_summary": summary,
            "confidence_score": confidence,
        }

    # ═══════════════════════════════════════════════
    # Step 1: Technical Parameter Extraction
    # ═══════════════════════════════════════════════

    async def _extract_technical_parameters(self, text: str) -> ParsedSpecSchema:
        response = await self.client.chat.completions.create(
            model=AI_MODEL,
            temperature=AI_TEMPERATURE,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Ты — старший инженер-геотехник с 20+ летним опытом проектирования "
                        "оснований и фундаментов. Твоя задача — ТОЧНО извлечь ключевые "
                        "технические параметры из проектной/сметной документации.\n\n"
                        "Верни строго JSON со следующими полями:\n"
                        "- work_type (str): Тип работ\n"
                        "- volume (float|null): Объем работ (число, без единиц)\n"
                        "- soil_type (str|null): Тип грунта\n"
                        "- required_profile (str|null): Марка шпунта\n"
                        "- depth (float|null): Глубина погружения в метрах (число)\n"
                        "- groundwater_level (float|null): УГВ в метрах (число)\n"
                        "- special_conditions (list[str]): Особые условия\n\n"
                        "ВАЖНО: volume, depth, groundwater_level — ТОЛЬКО числа (float), "
                        "без единиц измерения. Если данных нет — ставь null."
                    ),
                },
                {"role": "user", "content": f"Извлеки параметры ТЗ:\n\n{text[:15000]}"},
            ],
            response_format={"type": "json_object"},
        )
        data = json.loads(response.choices[0].message.content)
        return ParsedSpecSchema(**data)

    # ═══════════════════════════════════════════════
    # Step 2: RAG — Build context from ALL standards
    # ═══════════════════════════════════════════════

    def _build_rag_context(self, data: ParsedSpecSchema, text: str) -> str:
        """
        Build comprehensive normative context by matching ALL relevant standards.
        Uses keyword matching across key_points, rules, and risks.
        """
        context_parts: List[str] = []
        text_lower = text.lower()
        data_str = f"{data.work_type or ''} {data.soil_type or ''} {data.required_profile or ''}".lower()

        for code, standard in self.standards.items():
            title = standard.get("title", "")
            matched_items: List[str] = []

            # Match risks by soil_type and text keywords
            for risk_key, risk_desc in standard.get("risks", {}).items():
                if any(kw in data_str or kw in text_lower for kw in risk_key.lower().split()):
                    matched_items.append(f"  ⚠ РИСК ({risk_key}): {risk_desc}")

            # Match rules by text content
            for rule in standard.get("rules", []):
                # Check if rule keywords appear in document
                rule_words = [w for w in rule.lower().split() if len(w) > 4][:3]
                if any(w in text_lower for w in rule_words):
                    matched_items.append(f"  📏 ПРАВИЛО: {rule}")

            # Match key_points to provide context
            for point in standard.get("key_points", []):
                point_words = [w for w in point.lower().split() if len(w) > 4][:3]
                if any(w in data_str for w in point_words):
                    matched_items.append(f"  📋 {point}")

            if matched_items:
                header = f"\n### {code} — {title}"
                context_parts.append(header + "\n" + "\n".join(matched_items[:6]))

        if not context_parts:
            # Fallback: include all risk sections as general context
            for code, standard in self.standards.items():
                risks = standard.get("risks", {})
                if risks:
                    items = [f"  ⚠ {k}: {v}" for k, v in list(risks.items())[:2]]
                    context_parts.append(f"\n### {code} — {standard.get('title', '')}\n" + "\n".join(items))

        return "\n".join(context_parts) if context_parts else "Нормативный контекст не найден."

    # ═══════════════════════════════════════════════
    # Step 3: Risk Assessment with full RAG context
    # ═══════════════════════════════════════════════

    async def _assess_engineering_risks(
        self, data: ParsedSpecSchema, text: str, rag_context: str
    ) -> List[Dict[str, str]]:
        response = await self.client.chat.completions.create(
            model=AI_MODEL,
            temperature=AI_TEMPERATURE,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Ты — эксперт по геотехническим рискам. Проанализируй инженерные "
                        "риски объекта, используя приведённые нормативные документы.\n\n"
                        "Учитывай:\n"
                        "- Тип грунта и его особенности\n"
                        "- Глубину котлована / погружения\n"
                        "- Уровень грунтовых вод\n"
                        "- Близость к существующей застройке\n"
                        "- Метод производства работ (вибро, вдавливание, забивка)\n"
                        "- Нормативные требования из приведённых ГОСТ и СП\n\n"
                        "Верни JSON: {\"risks\": [{\"risk\": str, \"impact\": str}, ...]}\n"
                        "Каждый risk — конкретная инженерная угроза.\n"
                        "Каждый impact — уровень (Критический/Высокий/Средний) + последствия."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"ПАРАМЕТРЫ ОБЪЕКТА:\n{data.model_dump_json()}\n\n"
                        f"НОРМАТИВНЫЙ КОНТЕКСТ:\n{rag_context}\n\n"
                        f"ИСХОДНЫЙ ДОКУМЕНТ (начало):\n{text[:5000]}"
                    ),
                },
            ],
            response_format={"type": "json_object"},
        )
        result = json.loads(response.choices[0].message.content)
        return result.get("risks", [])

    # ═══════════════════════════════════════════════
    # Step 4: Expert Summary
    # ═══════════════════════════════════════════════

    async def _generate_professional_summary(
        self,
        data: Any,
        risks: List[Any],
        sections: Dict[str, str],
        rag_context: str,
    ) -> str:
        response = await self.client.chat.completions.create(
            model=AI_MODEL,
            temperature=0.35,  # Slightly higher for natural language summary
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Ты — главный инженер-геотехник, составляющий экспертное заключение "
                        "для B2B клиента. Стиль: строгий, профессиональный, инженерный.\n\n"
                        "Структура заключения (Markdown):\n"
                        "## Анализ объекта\n"
                        "Краткое описание задачи, тип работ, ключевые параметры.\n\n"
                        "## Оценка сложности\n"
                        "Геология, гидрогеология, стесненность, специфические условия.\n\n"
                        "## Рекомендации\n"
                        "Метод работ, оборудование, технологические решения.\n\n"
                        "## Критические риски\n"
                        "Основные угрозы, ссылки на нормативы.\n\n"
                        "Используй ссылки на конкретные ГОСТ и СП из контекста."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"Параметры: {data}\n"
                        f"Риски: {risks}\n"
                        f"Нормативный контекст:\n{rag_context}\n"
                        f"Геология (контекст): {sections.get('geology', 'Нет данных')}"
                    ),
                },
            ],
        )
        return response.choices[0].message.content

    # ═══════════════════════════════════════════════
    # Step 5: Smart Confidence Score
    # ═══════════════════════════════════════════════

    def _compute_confidence(self, data: ParsedSpecSchema, text: str) -> float:
        """
        Compute confidence as weighted sum based on field completeness
        and document quality signals.

        Range: 0.40 (minimum) to 0.98 (full data + rich document)
        """
        score = 0.40  # Base: we always have at least work_type

        # Field completeness (up to +0.40)
        fields = {
            "work_type": (0.05, data.work_type),
            "soil_type": (0.08, data.soil_type),
            "volume": (0.07, data.volume),
            "depth": (0.07, data.depth),
            "required_profile": (0.05, data.required_profile),
            "groundwater_level": (0.05, data.groundwater_level),
            "special_conditions": (0.03, data.special_conditions),
        }
        for weight, value in fields.values():
            if value:
                score += weight

        # Document quality signals (up to +0.18)
        text_len = len(text)
        if text_len > 500:
            score += 0.04
        if text_len > 2000:
            score += 0.04
        if text_len > 5000:
            score += 0.04

        # Keyword density — more geotech terms = more relevant document
        text_lower = text.lower()
        keyword_hits = sum(1 for kw in self.geotech_keywords if kw in text_lower)
        if keyword_hits >= 5:
            score += 0.03
        if keyword_hits >= 10:
            score += 0.03

        return round(min(score, 0.98), 2)

    # ═══════════════════════════════════════════════
    # Pre-validation
    # ═══════════════════════════════════════════════

    async def _pre_validate_document(self, text: str) -> Tuple[bool, str]:
        """Two-phase validation: heuristic keywords + cheap AI check."""
        text_lower = text.lower()
        keyword_hits = sum(1 for kw in self.geotech_keywords if kw in text_lower)

        if keyword_hits >= 3:
            return True, "Heuristic match"

        # Cheap AI validation
        try:
            response = await self.client.chat.completions.create(
                model=AI_MODEL_CHEAP,
                temperature=0.0,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "Определи, является ли текст техническим заданием, "
                            "спецификацией или отчетом в области ГЕОТЕХНИКИ, "
                            "СТРОИТЕЛЬСТВА ФУНДАМЕНТОВ или ШПУНТОВЫХ ОГРАЖДЕНИЙ.\n"
                            "Ответь JSON: {\"is_geotech\": bool, \"reason\": str}"
                        ),
                    },
                    {"role": "user", "content": f"Текст документа (начало):\n{text[:2000]}"},
                ],
                response_format={"type": "json_object"},
            )
            result = json.loads(response.choices[0].message.content)
            return result.get("is_geotech", False), result.get("reason", "No reason provided")
        except Exception:
            return keyword_hits >= 1, "Fallback heuristic"


# Singleton
geotech_analyzer = GeotechAnalyzer()
