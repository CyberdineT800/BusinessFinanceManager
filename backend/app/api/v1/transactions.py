from fastapi import APIRouter, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import date
from app.api.deps import DatabaseDep
from app.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionOut, TransactionListResponse
from app.services import transaction as svc

router = APIRouter()


@router.get("", response_model=TransactionListResponse)
async def list_transactions(
    db: AsyncSession = DatabaseDep,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    type: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    search: Optional[str] = Query(None),
):
    return await svc.list_transactions(
        db, page=page, page_size=page_size,
        tx_type=type, category_id=category_id,
        date_from=date_from, date_to=date_to, search=search,
    )


@router.post("", response_model=TransactionOut, status_code=201)
async def create_transaction(data: TransactionCreate, db: AsyncSession = DatabaseDep):
    return await svc.create_transaction(db, data)


@router.get("/{tx_id}", response_model=TransactionOut)
async def get_transaction(tx_id: int, db: AsyncSession = DatabaseDep):
    tx = await svc.get_transaction_by_id(db, tx_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx


@router.patch("/{tx_id}", response_model=TransactionOut)
async def update_transaction(tx_id: int, data: TransactionUpdate, db: AsyncSession = DatabaseDep):
    tx = await svc.get_transaction_by_id(db, tx_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return await svc.update_transaction(db, tx, data)


@router.delete("/{tx_id}", status_code=204)
async def delete_transaction(tx_id: int, db: AsyncSession = DatabaseDep):
    tx = await svc.get_transaction_by_id(db, tx_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    await svc.delete_transaction(db, tx)
