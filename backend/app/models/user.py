from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import BigInteger, String, DateTime, func
from datetime import datetime
from typing import Optional, List
from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    telegram_id: Mapped[int] = mapped_column(BigInteger, unique=True, nullable=False)
    username: Mapped[Optional[str]] = mapped_column(String(255))
    first_name: Mapped[Optional[str]] = mapped_column(String(255))
    language: Mapped[str] = mapped_column(String(5), default="ru")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    transactions: Mapped[List["Transaction"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    categories: Mapped[List["Category"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    budgets: Mapped[List["Budget"]] = relationship(back_populates="user", cascade="all, delete-orphan")
