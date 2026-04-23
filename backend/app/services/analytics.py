from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, extract
from typing import Optional
from datetime import date, timedelta
from decimal import Decimal
from calendar import monthrange
from app.models.transaction import Transaction
from app.models.category import Category
from app.schemas.analytics import (
    PeriodSummary, PeriodComparison, CategoryBreakdown,
    MonthlyTrend, DailyTrend, ForecastMonth, InsightItem, AnalyticsSummary
)


def _safe_pct(current: Decimal, previous: Decimal) -> Optional[float]:
    if previous == 0:
        return None
    return float((current - previous) / previous * 100)


async def get_period_summary(db: AsyncSession, date_from: date, date_to: date) -> PeriodSummary:
    result = await db.execute(
        select(
            Transaction.type,
            func.coalesce(func.sum(Transaction.amount), 0).label("total"),
            func.count(Transaction.id).label("cnt"),
        )
        .where(and_(Transaction.date >= date_from, Transaction.date <= date_to))
        .group_by(Transaction.type)
    )
    rows = result.all()
    income = Decimal(0)
    expense = Decimal(0)
    cnt = 0
    for row in rows:
        if row.type == "income":
            income = Decimal(str(row.total))
        else:
            expense = Decimal(str(row.total))
        cnt += row.cnt
    return PeriodSummary(
        total_income=income,
        total_expense=expense,
        net=income - expense,
        transaction_count=cnt,
    )


async def get_period_comparison(db: AsyncSession, date_from: date, date_to: date) -> PeriodComparison:
    delta = (date_to - date_from).days + 1
    prev_to = date_from - timedelta(days=1)
    prev_from = prev_to - timedelta(days=delta - 1)
    current = await get_period_summary(db, date_from, date_to)
    previous = await get_period_summary(db, prev_from, prev_to)
    return PeriodComparison(
        current=current,
        previous=previous,
        income_change_pct=_safe_pct(current.total_income, previous.total_income),
        expense_change_pct=_safe_pct(current.total_expense, previous.total_expense),
        net_change_pct=_safe_pct(current.net, previous.net),
    )


async def get_category_breakdown(db: AsyncSession, date_from: date, date_to: date) -> list[CategoryBreakdown]:
    result = await db.execute(
        select(
            Category.id,
            Category.name,
            Category.color,
            Category.type,
            func.coalesce(func.sum(Transaction.amount), 0).label("total"),
            func.count(Transaction.id).label("cnt"),
        )
        .join(Transaction, Transaction.category_id == Category.id)
        .where(and_(Transaction.date >= date_from, Transaction.date <= date_to))
        .group_by(Category.id, Category.name, Category.color, Category.type)
        .order_by(func.sum(Transaction.amount).desc())
    )
    rows = result.all()

    type_totals: dict[str, Decimal] = {}
    for row in rows:
        t = row.type
        type_totals[t] = type_totals.get(t, Decimal(0)) + Decimal(str(row.total))

    breakdown = []
    for row in rows:
        total = Decimal(str(row.total))
        grand = type_totals.get(row.type, Decimal(0))
        pct = float(total / grand * 100) if grand > 0 else 0.0
        breakdown.append(CategoryBreakdown(
            category_id=row.id,
            category_name=row.name,
            color=row.color,
            type=row.type,
            total=total,
            percentage=round(pct, 1),
            transaction_count=row.cnt,
        ))
    return breakdown


async def get_monthly_trends(db: AsyncSession, months: int = 6) -> list[MonthlyTrend]:
    today = date.today()
    start = date(today.year, today.month, 1)
    for _ in range(months - 1):
        start = (start - timedelta(days=1)).replace(day=1)

    result = await db.execute(
        select(
            extract("year", Transaction.date).label("year"),
            extract("month", Transaction.date).label("month"),
            Transaction.type,
            func.coalesce(func.sum(Transaction.amount), 0).label("total"),
        )
        .where(Transaction.date >= start)
        .group_by("year", "month", Transaction.type)
        .order_by("year", "month")
    )
    rows = result.all()

    monthly: dict[str, dict] = {}
    for row in rows:
        key = f"{int(row.year):04d}-{int(row.month):02d}"
        if key not in monthly:
            monthly[key] = {"income": Decimal(0), "expense": Decimal(0)}
        monthly[key][row.type] = Decimal(str(row.total))

    trends = []
    for key in sorted(monthly.keys()):
        d = monthly[key]
        income = d.get("income", Decimal(0))
        expense = d.get("expense", Decimal(0))
        trends.append(MonthlyTrend(
            month=key,
            income=income,
            expense=expense,
            net=income - expense,
        ))
    return trends


async def get_daily_trends(db: AsyncSession, date_from: date, date_to: date) -> list[DailyTrend]:
    result = await db.execute(
        select(
            Transaction.date,
            Transaction.type,
            func.coalesce(func.sum(Transaction.amount), 0).label("total"),
        )
        .where(and_(Transaction.date >= date_from, Transaction.date <= date_to))
        .group_by(Transaction.date, Transaction.type)
        .order_by(Transaction.date)
    )
    rows = result.all()

    daily: dict[str, dict] = {}
    for row in rows:
        key = str(row.date)
        if key not in daily:
            daily[key] = {"income": Decimal(0), "expense": Decimal(0)}
        daily[key][row.type] = Decimal(str(row.total))

    return [
        DailyTrend(
            date=key,
            income=daily[key].get("income", Decimal(0)),
            expense=daily[key].get("expense", Decimal(0)),
        )
        for key in sorted(daily.keys())
    ]


async def get_forecast(db: AsyncSession, forecast_months: int = 3) -> list[ForecastMonth]:
    trends = await get_monthly_trends(db, months=6)
    if len(trends) < 2:
        return []

    def moving_avg(values: list[Decimal], n: int = 3) -> Decimal:
        if not values:
            return Decimal(0)
        window = values[-min(n, len(values)):]
        return sum(window) / len(window)

    incomes = [t.income for t in trends]
    expenses = [t.expense for t in trends]

    last_month_str = trends[-1].month
    y, m = int(last_month_str[:4]), int(last_month_str[5:7])

    forecast = []
    for _ in range(forecast_months):
        m += 1
        if m > 12:
            m = 1
            y += 1
        pred_income = moving_avg(incomes)
        pred_expense = moving_avg(expenses)
        forecast.append(ForecastMonth(
            month=f"{y:04d}-{m:02d}",
            predicted_income=pred_income,
            predicted_expense=pred_expense,
            predicted_net=pred_income - pred_expense,
            confidence=0.75 if len(trends) >= 4 else 0.5,
        ))
        incomes.append(pred_income)
        expenses.append(pred_expense)

    return forecast


async def generate_insights(db: AsyncSession, date_from: date, date_to: date) -> list[InsightItem]:
    comparison = await get_period_comparison(db, date_from, date_to)
    breakdown = await get_category_breakdown(db, date_from, date_to)
    insights = []

    if comparison.expense_change_pct is not None:
        pct = comparison.expense_change_pct
        if abs(pct) > 15:
            trend = "up" if pct > 0 else "down"
            insights.append(InsightItem(
                type="expense_trend",
                title="Xarajatlar o'zgarishi" if pct > 0 else "Xarajatlar kamaidi",
                description=f"Xarajatlar {'oshdi' if pct > 0 else 'kamaydi'} {abs(pct):.1f}% oldingi davr bilan solishtirganda",
                value=f"{pct:+.1f}%",
                trend=trend,
            ))

    expense_cats = [b for b in breakdown if b.type == "expense"]
    if expense_cats:
        top = expense_cats[0]
        if top.percentage > 40:
            insights.append(InsightItem(
                type="top_expense",
                title="Asosiy xarajat kategoriyasi",
                description=f"'{top.category_name}' barcha xarajatlarning {top.percentage:.1f}% ni tashkil etmoqda",
                value=f"{top.percentage:.1f}%",
                trend="neutral",
            ))

    c = comparison.current
    if c.total_income > 0:
        expense_ratio = float(c.total_expense / c.total_income * 100)
        if expense_ratio > 90:
            insights.append(InsightItem(
                type="cash_flow_warning",
                title="Pul oqimi ogohlantirishi",
                description=f"Xarajatlar daromadning {expense_ratio:.0f}% ni tashkil etmoqda — bu juda yuqori",
                value=f"{expense_ratio:.0f}%",
                trend="up",
            ))
        elif expense_ratio < 50:
            insights.append(InsightItem(
                type="healthy_margin",
                title="Sog'lom moliyaviy holat",
                description=f"Daromadning {100 - expense_ratio:.0f}% sof foyda — bu yaxshi ko'rsatkich",
                value=f"{100 - expense_ratio:.0f}%",
                trend="down",
            ))

    if comparison.income_change_pct is not None and comparison.income_change_pct > 10:
        insights.append(InsightItem(
            type="income_growth",
            title="Daromad o'sishi",
            description=f"Daromad {comparison.income_change_pct:.1f}% oshdi — ajoyib natija!",
            value=f"+{comparison.income_change_pct:.1f}%",
            trend="up",
        ))

    return insights[:5]


async def get_full_analytics(db: AsyncSession, date_from: date, date_to: date) -> AnalyticsSummary:
    comparison = await get_period_comparison(db, date_from, date_to)
    breakdown = await get_category_breakdown(db, date_from, date_to)
    monthly = await get_monthly_trends(db, months=6)
    daily = await get_daily_trends(db, date_from, date_to)
    forecast = await get_forecast(db, forecast_months=3)
    insights = await generate_insights(db, date_from, date_to)

    return AnalyticsSummary(
        period_comparison=comparison,
        category_breakdown=breakdown,
        monthly_trends=monthly,
        daily_trends=daily,
        forecast=forecast,
        insights=insights,
    )
