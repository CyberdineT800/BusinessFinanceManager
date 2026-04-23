from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from sqlalchemy.orm import selectinload
from typing import Optional
from datetime import date
from decimal import Decimal
from app.models.transaction import Transaction
from app.models.category import Category
from app.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionOut, TransactionListResponse


async def create_transaction(db: AsyncSession, data: TransactionCreate, user_id: Optional[int] = None) -> Transaction:
    tx = Transaction(
        amount=data.amount,
        type=data.type,
        category_id=data.category_id,
        date=data.date,
        note=data.note,
        source=data.source,
        user_id=user_id,
    )
    db.add(tx)
    await db.commit()
    await db.refresh(tx)
    result = await db.execute(
        select(Transaction)
        .options(selectinload(Transaction.category))
        .where(Transaction.id == tx.id)
    )
    return result.scalar_one()


async def get_transaction_by_id(db: AsyncSession, tx_id: int) -> Optional[Transaction]:
    result = await db.execute(
        select(Transaction)
        .options(selectinload(Transaction.category))
        .where(Transaction.id == tx_id)
    )
    return result.scalar_one_or_none()


async def list_transactions(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
    tx_type: Optional[str] = None,
    category_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    search: Optional[str] = None,
) -> TransactionListResponse:
    filters = []
    if tx_type:
        filters.append(Transaction.type == tx_type)
    if category_id:
        filters.append(Transaction.category_id == category_id)
    if date_from:
        filters.append(Transaction.date >= date_from)
    if date_to:
        filters.append(Transaction.date <= date_to)
    if search:
        filters.append(Transaction.note.ilike(f"%{search}%"))

    count_q = select(func.count(Transaction.id))
    if filters:
        count_q = count_q.where(and_(*filters))
    total = (await db.execute(count_q)).scalar()

    q = (
        select(Transaction)
        .options(selectinload(Transaction.category))
        .order_by(desc(Transaction.date), desc(Transaction.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    if filters:
        q = q.where(and_(*filters))

    rows = (await db.execute(q)).scalars().all()
    total_pages = max(1, (total + page_size - 1) // page_size)

    return TransactionListResponse(
        items=[TransactionOut.model_validate(r) for r in rows],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


async def update_transaction(db: AsyncSession, tx: Transaction, data: TransactionUpdate) -> Transaction:
    if data.amount is not None:
        tx.amount = data.amount
    if data.type is not None:
        tx.type = data.type
    if data.category_id is not None:
        tx.category_id = data.category_id
    if data.date is not None:
        tx.date = data.date
    if data.note is not None:
        tx.note = data.note
    await db.commit()
    await db.refresh(tx)
    result = await db.execute(
        select(Transaction)
        .options(selectinload(Transaction.category))
        .where(Transaction.id == tx.id)
    )
    return result.scalar_one()


async def delete_transaction(db: AsyncSession, tx: Transaction) -> None:
    await db.delete(tx)
    await db.commit()


async def get_last_transaction_by_user(db: AsyncSession, user_id: int) -> Optional[Transaction]:
    result = await db.execute(
        select(Transaction)
        .options(selectinload(Transaction.category))
        .where(Transaction.user_id == user_id)
        .order_by(desc(Transaction.created_at))
        .limit(1)
    )
    return result.scalar_one_or_none()
