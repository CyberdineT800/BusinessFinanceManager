from fastapi import APIRouter, Query
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date, timedelta
from app.api.deps import DatabaseDep
from app.schemas.analytics import AnalyticsSummary
from app.services import analytics as svc

router = APIRouter()


@router.get("", response_model=AnalyticsSummary)
async def get_analytics(
    db: AsyncSession = DatabaseDep,
    date_from: date = Query(default=None),
    date_to: date = Query(default=None),
):
    today = date.today()
    if not date_to:
        date_to = today
    if not date_from:
        date_from = date(today.year, today.month, 1)
    return await svc.get_full_analytics(db, date_from, date_to)
