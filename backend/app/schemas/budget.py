from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import date, datetime
from decimal import Decimal


class BudgetCreate(BaseModel):
    category_id: int
    amount: Decimal = Field(gt=0)
    month: date


class BudgetUpdate(BaseModel):
    amount: Decimal = Field(gt=0)


class BudgetOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    category_id: int
    category_name: str
    category_color: str
    amount: Decimal
    month: date
    spent: Decimal = Decimal("0")
    remaining: Decimal = Decimal("0")
    utilization_pct: float = 0.0
    created_at: datetime
