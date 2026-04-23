from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    type: str = Field(pattern="^(income|expense)$")
    color: str = Field(default="#6366f1", pattern="^#[0-9A-Fa-f]{6}$")
    icon: Optional[str] = None


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    color: Optional[str] = Field(default=None, pattern="^#[0-9A-Fa-f]{6}$")
    icon: Optional[str] = None


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    type: str
    is_default: bool
    color: str
    icon: Optional[str] = None
    created_at: datetime


class CategoryWithStats(CategoryOut):
    transaction_count: int = 0
    total_amount: float = 0.0
