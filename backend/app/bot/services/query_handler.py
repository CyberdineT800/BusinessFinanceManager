from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date, timedelta
from decimal import Decimal
from app.services.analytics import get_period_summary, get_category_breakdown
from app.bot.services.gemini import gemini_service
from app.bot.services.formatter import fmt_amount


async def handle_query(
    db: AsyncSession,
    parsed: dict,
    original_text: str,
    lang: str,
) -> str:
    period = parsed.get("query_period", "month")
    today = date.today()

    if period == "today":
        date_from = date_to = today
    elif period == "week":
        date_from = today - timedelta(days=today.weekday())
        date_to = today
    elif period == "year":
        date_from = date(today.year, 1, 1)
        date_to = today
    else:
        date_from = date(today.year, today.month, 1)
        date_to = today

    summary = await get_period_summary(db, date_from, date_to)
    breakdown = await get_category_breakdown(db, date_from, date_to)

    financial_data = {
        "period": {"from": str(date_from), "to": str(date_to)},
        "total_income": float(summary.total_income),
        "total_expense": float(summary.total_expense),
        "net": float(summary.net),
        "transaction_count": summary.transaction_count,
        "top_expense_categories": [
            {
                "name": b.category_name,
                "amount": float(b.total),
                "percentage": b.percentage,
            }
            for b in breakdown if b.type == "expense"
        ][:5],
        "top_income_categories": [
            {
                "name": b.category_name,
                "amount": float(b.total),
                "percentage": b.percentage,
            }
            for b in breakdown if b.type == "income"
        ][:5],
    }

    return await gemini_service.answer_query(original_text, financial_data, lang)
