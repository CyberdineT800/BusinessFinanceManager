from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from typing import Optional
from app.models.category import Category
from app.models.transaction import Transaction
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryWithStats

DEFAULT_CATEGORIES = [
    {"name": "Savdo / Продажи", "type": "income", "color": "#10b981", "icon": "shopping-cart", "is_default": True},
    {"name": "Xizmatlar / Услуги", "type": "income", "color": "#06b6d4", "icon": "briefcase", "is_default": True},
    {"name": "Investitsiya / Инвестиции", "type": "income", "color": "#8b5cf6", "icon": "trending-up", "is_default": True},
    {"name": "Boshqa daromad / Прочие доходы", "type": "income", "color": "#f59e0b", "icon": "plus-circle", "is_default": True},
    {"name": "Maosh / Зарплата", "type": "expense", "color": "#f43f5e", "icon": "users", "is_default": True},
    {"name": "Ijara / Аренда", "type": "expense", "color": "#ef4444", "icon": "home", "is_default": True},
    {"name": "Logistika / Логистика", "type": "expense", "color": "#f97316", "icon": "truck", "is_default": True},
    {"name": "Marketing", "type": "expense", "color": "#ec4899", "icon": "megaphone", "is_default": True},
    {"name": "Materiallar / Материалы", "type": "expense", "color": "#84cc16", "icon": "package", "is_default": True},
    {"name": "Soliq / Налоги", "type": "expense", "color": "#6366f1", "icon": "file-text", "is_default": True},
    {"name": "Kommunal / Коммунальные", "type": "expense", "color": "#14b8a6", "icon": "zap", "is_default": True},
    {"name": "Boshqa xarajat / Прочие расходы", "type": "expense", "color": "#64748b", "icon": "more-horizontal", "is_default": True},
]


async def seed_default_categories(db: AsyncSession) -> None:
    result = await db.execute(select(func.count()).where(Category.is_default == True))
    count = result.scalar()
    if count == 0:
        for cat in DEFAULT_CATEGORIES:
            db.add(Category(**cat))
        await db.commit()


async def get_all_categories(db: AsyncSession, include_stats: bool = False) -> list[CategoryWithStats]:
    if not include_stats:
        result = await db.execute(
            select(Category).order_by(Category.type, Category.name)
        )
        cats = result.scalars().all()
        return [CategoryWithStats.model_validate(c) for c in cats]

    result = await db.execute(
        select(
            Category,
            func.count(Transaction.id).label("transaction_count"),
            func.coalesce(func.sum(Transaction.amount), 0).label("total_amount"),
        )
        .outerjoin(Transaction, Transaction.category_id == Category.id)
        .group_by(Category.id)
        .order_by(Category.type, Category.name)
    )
    rows = result.all()
    items = []
    for row in rows:
        cat, tx_count, total = row
        item = CategoryWithStats.model_validate(cat)
        item.transaction_count = tx_count or 0
        item.total_amount = float(total or 0)
        items.append(item)
    return items


async def get_category_by_id(db: AsyncSession, category_id: int) -> Optional[Category]:
    result = await db.execute(select(Category).where(Category.id == category_id))
    return result.scalar_one_or_none()


async def find_category_by_hint(db: AsyncSession, hint: str, tx_type: str) -> Optional[Category]:
    hint_lower = hint.lower()
    result = await db.execute(
        select(Category).where(
            and_(
                Category.type == tx_type,
                Category.name.ilike(f"%{hint_lower}%"),
            )
        ).limit(1)
    )
    return result.scalar_one_or_none()


async def create_category(db: AsyncSession, data: CategoryCreate, user_id: Optional[int] = None) -> Category:
    cat = Category(
        name=data.name,
        type=data.type,
        color=data.color,
        icon=data.icon,
        is_default=False,
        user_id=user_id,
    )
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return cat


async def update_category(db: AsyncSession, category: Category, data: CategoryUpdate) -> Category:
    if data.name is not None:
        category.name = data.name
    if data.color is not None:
        category.color = data.color
    if data.icon is not None:
        category.icon = data.icon
    await db.commit()
    await db.refresh(category)
    return category


async def delete_category(db: AsyncSession, category: Category) -> None:
    await db.delete(category)
    await db.commit()
