"""initial schema

Revision ID: 001
Revises:
Create Date: 2025-01-01 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("telegram_id", sa.BigInteger(), unique=True, nullable=False),
        sa.Column("username", sa.String(255)),
        sa.Column("first_name", sa.String(255)),
        sa.Column("language", sa.String(5), default="ru"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "categories",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("type", sa.String(10), nullable=False),
        sa.Column("is_default", sa.Boolean(), default=False),
        sa.Column("color", sa.String(7), default="#6366f1"),
        sa.Column("icon", sa.String(50)),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.CheckConstraint("type IN ('income', 'expense')", name="chk_category_type"),
    )

    op.create_table(
        "transactions",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("amount", sa.Numeric(15, 2), nullable=False),
        sa.Column("type", sa.String(10), nullable=False),
        sa.Column("category_id", sa.Integer(), sa.ForeignKey("categories.id", ondelete="SET NULL"), nullable=True),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("note", sa.Text()),
        sa.Column("source", sa.String(20), default="dashboard"),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.CheckConstraint("type IN ('income', 'expense')", name="chk_transaction_type"),
    )

    op.create_table(
        "budgets",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("category_id", sa.Integer(), sa.ForeignKey("categories.id", ondelete="CASCADE"), nullable=False),
        sa.Column("amount", sa.Numeric(15, 2), nullable=False),
        sa.Column("month", sa.Date(), nullable=False),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("category_id", "month", "user_id", name="uq_budget_category_month_user"),
    )

    op.create_index("ix_transactions_date", "transactions", ["date"])
    op.create_index("ix_transactions_type", "transactions", ["type"])
    op.create_index("ix_transactions_category_id", "transactions", ["category_id"])


def downgrade() -> None:
    op.drop_table("budgets")
    op.drop_table("transactions")
    op.drop_table("categories")
    op.drop_table("users")
