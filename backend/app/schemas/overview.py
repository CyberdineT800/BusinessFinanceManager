from pydantic import BaseModel
from decimal import Decimal
from datetime import date
from typing import Optional
from app.schemas.transaction import TransactionOut


class MetricCard(BaseModel):
    total_income: Decimal
    total_expense: Decimal
    net: Decimal
    income_change_pct: Optional[float] = None
    expense_change_pct: Optional[float] = None
    net_change_pct: Optional[float] = None


class OverviewResponse(BaseModel):
    metrics: MetricCard
    recent_transactions: list[TransactionOut]
    period_start: date
    period_end: date
