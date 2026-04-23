from fastapi import APIRouter, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date
from app.api.deps import DatabaseDep
from app.schemas.budget import BudgetCreate, BudgetOut
from app.services import budget as svc

router = APIRouter()


@router.get("", response_model=list[BudgetOut])
async def get_budgets(
    db: AsyncSession = DatabaseDep,
    month: date = Query(default=None),
):
    if not month:
        today = date.today()
        month = date(today.year, today.month, 1)
    return await svc.get_budgets_with_stats(db, month)


@router.post("", response_model=BudgetOut, status_code=201)
async def create_or_update_budget(data: BudgetCreate, db: AsyncSession = DatabaseDep):
    budget = await svc.upsert_budget(db, data)
    result = await svc.get_budgets_with_stats(db, data.month)
    for b in result:
        if b.id == budget.id:
            return b
    return BudgetOut(
        id=budget.id,
        category_id=budget.category_id,
        category_name="",
        category_color="#6366f1",
        amount=budget.amount,
        month=budget.month,
        created_at=budget.created_at,
    )


@router.delete("/{budget_id}", status_code=204)
async def delete_budget(budget_id: int, db: AsyncSession = DatabaseDep):
    deleted = await svc.delete_budget(db, budget_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Budget not found")
