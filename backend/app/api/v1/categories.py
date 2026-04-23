from fastapi import APIRouter, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import DatabaseDep
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryOut, CategoryWithStats
from app.services import category as svc

router = APIRouter()


@router.get("", response_model=list[CategoryWithStats])
async def list_categories(
    db: AsyncSession = DatabaseDep,
    include_stats: bool = Query(False),
):
    return await svc.get_all_categories(db, include_stats=include_stats)


@router.post("", response_model=CategoryOut, status_code=201)
async def create_category(data: CategoryCreate, db: AsyncSession = DatabaseDep):
    return await svc.create_category(db, data)


@router.patch("/{category_id}", response_model=CategoryOut)
async def update_category(category_id: int, data: CategoryUpdate, db: AsyncSession = DatabaseDep):
    cat = await svc.get_category_by_id(db, category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return await svc.update_category(db, cat, data)


@router.delete("/{category_id}", status_code=204)
async def delete_category(category_id: int, db: AsyncSession = DatabaseDep):
    cat = await svc.get_category_by_id(db, category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    if cat.is_default:
        raise HTTPException(status_code=400, detail="Cannot delete default category")
    await svc.delete_category(db, cat)
