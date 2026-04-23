from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import date, datetime
from decimal import Decimal


class CategoryBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    color: str
    icon: Optional[str] = None
    type: str


class TransactionCreate(BaseModel):
    amount: Decimal = Field(gt=0)
    type: str = Field(pattern="^(income|expense)$")
    category_id: Optional[int] = None
    date: date
    note: Optional[str] = None
    source: str = "dashboard"


class TransactionUpdate(BaseModel):
    amount: Optional[Decimal] = Field(default=None, gt=0)
    type: Optional[str] = Field(default=None, pattern="^(income|expense)$")
    category_id: Optional[int] = None
    date: Optional[date] = None
    note: Optional[str] = None


class TransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    amount: Decimal
    type: str
    category_id: Optional[int] = None
    category: Optional[CategoryBrief] = None
    date: date
    note: Optional[str] = None
    source: str
    created_at: datetime
    updated_at: datetime


class TransactionListResponse(BaseModel):
    items: list[TransactionOut]
    total: int
    page: int
    page_size: int
    total_pages: int
