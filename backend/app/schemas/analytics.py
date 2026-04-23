from pydantic import BaseModel
from typing import Optional
from decimal import Decimal


class PeriodSummary(BaseModel):
    total_income: Decimal
    total_expense: Decimal
    net: Decimal
    transaction_count: int


class PeriodComparison(BaseModel):
    current: PeriodSummary
    previous: PeriodSummary
    income_change_pct: Optional[float] = None
    expense_change_pct: Optional[float] = None
    net_change_pct: Optional[float] = None


class CategoryBreakdown(BaseModel):
    category_id: Optional[int]
    category_name: str
    color: str
    type: str
    total: Decimal
    percentage: float
    transaction_count: int


class MonthlyTrend(BaseModel):
    month: str
    income: Decimal
    expense: Decimal
    net: Decimal


class DailyTrend(BaseModel):
    date: str
    income: Decimal
    expense: Decimal


class ForecastMonth(BaseModel):
    month: str
    predicted_income: Decimal
    predicted_expense: Decimal
    predicted_net: Decimal
    confidence: float


class InsightItem(BaseModel):
    type: str
    title: str
    description: str
    value: Optional[str] = None
    trend: Optional[str] = None


class AnalyticsSummary(BaseModel):
    period_comparison: PeriodComparison
    category_breakdown: list[CategoryBreakdown]
    monthly_trends: list[MonthlyTrend]
    daily_trends: list[DailyTrend]
    forecast: list[ForecastMonth]
    insights: list[InsightItem]
