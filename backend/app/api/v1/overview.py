from fastapi import APIRouter, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from datetime import date, timedelta
from decimal import Decimal
from app.api.deps import DatabaseDep
from app.schemas.overview import OverviewResponse, MetricCard
from app.schemas.transaction import TransactionOut
from app.services.analytics import get_period_comparison
from app.models.transaction import Transaction

router = APIRouter()


@router.get("", response_model=OverviewResponse)
async def get_overview(db: AsyncSession = DatabaseDep):
    today = date.today()
    date_from = date(today.year, today.month, 1)
    date_to = today

    comparison = await get_period_comparison(db, date_from, date_to)
    c = comparison.current

    metrics = MetricCard(
        total_income=c.total_income,
        total_expense=c.total_expense,
        net=c.net,
        income_change_pct=comparison.income_change_pct,
        expense_change_pct=comparison.expense_change_pct,
        net_change_pct=comparison.net_change_pct,
    )

    recent = (await db.execute(
        select(Transaction)
        .options(selectinload(Transaction.category))
        .order_by(desc(Transaction.date), desc(Transaction.created_at))
        .limit(10)
    )).scalars().all()

    return OverviewResponse(
        metrics=metrics,
        recent_transactions=[TransactionOut.model_validate(t) for t in recent],
        period_start=date_from,
        period_end=date_to,
    )
