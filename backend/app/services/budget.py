from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import Optional
from datetime import date, timedelta
from decimal import Decimal
from app.models.budget import Budget
from app.models.transaction import Transaction
from app.models.category import Category
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetOut


async def upsert_budget(db: AsyncSession, data: BudgetCreate, user_id: Optional[int] = None) -> Budget:
    first_of_month = data.month.replace(day=1)
    result = await db.execute(
        select(Budget).where(
            and_(
                Budget.category_id == data.category_id,
                Budget.month == first_of_month,
            )
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        existing.amount = data.amount
        await db.commit()
        await db.refresh(existing)
        return existing

    budget = Budget(
        category_id=data.category_id,
        amount=data.amount,
        month=first_of_month,
        user_id=user_id,
    )
    db.add(budget)
    await db.commit()
    await db.refresh(budget)
    return budget


async def get_budgets_with_stats(db: AsyncSession, month: date) -> list[BudgetOut]:
    first_of_month = month.replace(day=1)
    if first_of_month.month == 12:
        last_of_month = date(first_of_month.year + 1, 1, 1) - timedelta(days=1)
    else:
        last_of_month = date(first_of_month.year, first_of_month.month + 1, 1) - timedelta(days=1)

    result = await db.execute(
        select(Budget).where(Budget.month == first_of_month)
    )
    budgets = result.scalars().all()

    cat_ids = [b.category_id for b in budgets]
    if not cat_ids:
        return []

    spent_result = await db.execute(
        select(
            Transaction.category_id,
            func.coalesce(func.sum(Transaction.amount), 0).label("spent"),
        )
        .where(
            and_(
                Transaction.category_id.in_(cat_ids),
                Transaction.date >= first_of_month,
                Transaction.date <= last_of_month,
                Transaction.type == "expense",
            )
        )
        .group_by(Transaction.category_id)
    )
    spent_map = {row.category_id: Decimal(str(row.spent)) for row in spent_result.all()}

    cat_result = await db.execute(
        select(Category).where(Category.id.in_(cat_ids))
    )
    cat_map = {c.id: c for c in cat_result.scalars().all()}

    items = []
    for b in budgets:
        cat = cat_map.get(b.category_id)
        spent = spent_map.get(b.category_id, Decimal(0))
        remaining = b.amount - spent
        utilization = float(spent / b.amount * 100) if b.amount > 0 else 0.0
        items.append(BudgetOut(
            id=b.id,
            category_id=b.category_id,
            category_name=cat.name if cat else "Unknown",
            category_color=cat.color if cat else "#6366f1",
            amount=b.amount,
            month=b.month,
            spent=spent,
            remaining=remaining,
            utilization_pct=round(utilization, 1),
            created_at=b.created_at,
        ))
    return items


async def delete_budget(db: AsyncSession, budget_id: int) -> bool:
    result = await db.execute(select(Budget).where(Budget.id == budget_id))
    budget = result.scalar_one_or_none()
    if not budget:
        return False
    await db.delete(budget)
    await db.commit()
    return True
