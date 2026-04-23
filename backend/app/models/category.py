from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import BigInteger, Integer, String, Boolean, DateTime, ForeignKey, CheckConstraint, func
from datetime import datetime
from typing import Optional, List
from app.models.base import Base


class Category(Base):
    __tablename__ = "categories"
    __table_args__ = (
        CheckConstraint("type IN ('income', 'expense')", name="chk_category_type"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(10), nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    color: Mapped[str] = mapped_column(String(7), default="#6366f1")
    icon: Mapped[Optional[str]] = mapped_column(String(50))
    user_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped[Optional["User"]] = relationship(back_populates="categories")
    transactions: Mapped[List["Transaction"]] = relationship(back_populates="category")
    budgets: Mapped[List["Budget"]] = relationship(back_populates="category", cascade="all, delete-orphan")
