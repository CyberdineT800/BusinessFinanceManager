import google.generativeai as genai
import json
import base64
import re
from datetime import date, timedelta
from typing import Optional
from app.core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

PARSE_SYSTEM = """You are a financial assistant for a small business in Uzbekistan.
Parse the user message and extract transaction or query information.
Always respond with ONLY valid JSON — no markdown, no explanation.

Return this exact JSON schema:
{
  "intent": "log_income" | "log_expense" | "query" | "delete_last" | "correct_last" | "help" | "unknown",
  "amount": number | null,
  "currency": "UZS" | "USD" | "EUR" | null,
  "category_hint": string | null,
  "date": "YYYY-MM-DD" | null,
  "note": string | null,
  "query_period": "today" | "week" | "month" | "year" | "custom" | null,
  "query_type": "summary" | "income" | "expense" | "category" | null,
  "query_category": string | null,
  "clarification_needed": boolean,
  "clarification_question": string | null,
  "response_language": "uz" | "ru" | "en",
  "confidence": number
}

Rules:
- Amount parsing: "50 ming"=50000, "1 mln"=1000000, "yarım mln"=500000, "50k"=50000
- "maosh" or "зарплата" → category_hint = "Maosh / Зарплата"
- "ijara" or "аренда" → category_hint = "Ijara / Аренда"
- "logistika" or "логистика" → category_hint = "Logistika / Логистика"
- "savdo" or "продажи" → category_hint = "Savdo / Продажи"
- "xizmat" or "услуги" → category_hint = "Xizmatlar / Услуги"
- If no date: use null (means today)
- "kecha" or "вчера" = yesterday
- "bu hafta" or "на этой неделе" → query_period = "week"
- "bu oy" or "в этом месяце" → query_period = "month"
- Detect language from message: Uzbek=uz, Russian=ru, English=en
- If amount is missing for log intent: clarification_needed=true
- If currency not mentioned: assume UZS
"""

QUERY_SYSTEM = """You are a financial data analyst for a small Uzbek business.
Given financial summary data and a user question, answer concisely and clearly.
Respond in the SAME language as the user question.
Format numbers with spaces as thousands separator (e.g. 1 500 000).
Always include currency: so'm (Uzbek), сум (Russian), UZS (English).
Be conversational and helpful, not robotic.
"""

INSIGHTS_SYSTEM = """You are a business financial advisor for small businesses in Uzbekistan.
Analyze the provided financial data and return 3-5 actionable business insights.
Respond ONLY with a JSON array of insight objects.
Each insight: {"type": string, "title": string, "description": string, "value": string|null, "trend": "up"|"down"|"neutral"|null}
Be specific, practical, and use real numbers from the data.
Respond in {language}.
"""


class GeminiService:
    def __init__(self):
        self._parse_model = genai.GenerativeModel(
            model_name=settings.GEMINI_MODEL,
            system_instruction=PARSE_SYSTEM,
        )
        self._query_model = genai.GenerativeModel(
            model_name=settings.GEMINI_MODEL,
            system_instruction=QUERY_SYSTEM,
        )

    async def parse_text(self, text: str) -> dict:
        today = date.today().isoformat()
        prompt = f"Today is {today}.\nUser message: {text}"
        try:
            response = await self._parse_model.generate_content_async(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    temperature=0.1,
                ),
            )
            raw = response.text.strip()
            raw = re.sub(r"^```json\s*", "", raw)
            raw = re.sub(r"\s*```$", "", raw)
            return json.loads(raw)
        except Exception:
            return {
                "intent": "unknown",
                "amount": None,
                "currency": None,
                "category_hint": None,
                "date": None,
                "note": None,
                "query_period": None,
                "query_type": None,
                "query_category": None,
                "clarification_needed": False,
                "clarification_question": None,
                "response_language": "ru",
                "confidence": 0.0,
            }

    async def parse_voice(self, audio_bytes: bytes, mime_type: str = "audio/ogg") -> dict:
        today = date.today().isoformat()
        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
        prompt = f"Today is {today}.\nTranscribe and parse this audio message as financial transaction data."
        try:
            response = await self._parse_model.generate_content_async(
                [
                    {"mime_type": mime_type, "data": audio_b64},
                    prompt,
                ],
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    temperature=0.1,
                ),
            )
            raw = response.text.strip()
            raw = re.sub(r"^```json\s*", "", raw)
            raw = re.sub(r"\s*```$", "", raw)
            return json.loads(raw)
        except Exception:
            return await self.parse_text("[voice message - transcription failed]")

    async def answer_query(self, question: str, financial_data: dict, language: str = "ru") -> str:
        prompt = f"""Financial data for the requested period:
{json.dumps(financial_data, ensure_ascii=False, default=str)}

User question: {question}
"""
        try:
            response = await self._query_model.generate_content_async(
                prompt,
                generation_config=genai.GenerationConfig(temperature=0.3),
            )
            return response.text.strip()
        except Exception:
            msgs = {
                "ru": "Не удалось получить данные. Попробуйте ещё раз.",
                "uz": "Ma'lumotlarni olishda xatolik. Qayta urinib ko'ring.",
                "en": "Could not retrieve data. Please try again.",
            }
            return msgs.get(language, msgs["ru"])

    async def generate_insights(self, financial_data: dict, language: str = "ru") -> list:
        system = INSIGHTS_SYSTEM.replace("{language}", {"ru": "Russian", "uz": "Uzbek", "en": "English"}.get(language, "Russian"))
        model = genai.GenerativeModel(
            model_name=settings.GEMINI_MODEL,
            system_instruction=system,
        )
        prompt = f"Financial data:\n{json.dumps(financial_data, ensure_ascii=False, default=str)}"
        try:
            response = await model.generate_content_async(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    temperature=0.4,
                ),
            )
            raw = response.text.strip()
            raw = re.sub(r"^```json\s*", "", raw)
            raw = re.sub(r"\s*```$", "", raw)
            return json.loads(raw)
        except Exception:
            return []


gemini_service = GeminiService()
