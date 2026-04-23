from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import BigInteger, Integer, Numeric, Date, DateTime, ForeignKey, UniqueConstraint, func
from datetime import datetime, date
from decimal import Decimal
from typing import Optional
from app.models.base import Base


class Budget(Base):
    __tablename__ = "budgets"
    __table_args__ = (
        UniqueConstraint("category_id", "month", "user_id", name="uq_budget_category_month_user"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    category_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    month: Mapped[date] = mapped_column(Date, nullable=False)
    user_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped[Optional["User"]] = relationship(back_populates="budgets")
    category: Mapped["Category"] = relationship(back_populates="budgets")
