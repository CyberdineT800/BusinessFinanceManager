from aiogram import Router
from aiogram.filters import CommandStart, Command
from aiogram.types import Message
from aiogram.fsm.context import FSMContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.core.database import AsyncSessionLocal
from app.bot.services.formatter import get_text, TEXTS

router = Router()


async def get_or_create_user(telegram_id: int, username: str | None, first_name: str | None) -> User:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.telegram_id == telegram_id))
        user = result.scalar_one_or_none()
        if not user:
            user = User(telegram_id=telegram_id, username=username, first_name=first_name)
            db.add(user)
            await db.commit()
            await db.refresh(user)
        return user


@router.message(CommandStart())
async def cmd_start(message: Message, state: FSMContext):
    await state.clear()
    user = await get_or_create_user(
        message.from_user.id,
        message.from_user.username,
        message.from_user.first_name,
    )
    name = message.from_user.first_name or message.from_user.username or "there"
    lang = user.language or "ru"
    await message.answer(
        get_text("welcome", lang, name=name),
        parse_mode="Markdown",
    )


@router.message(Command("help"))
async def cmd_help(message: Message):
    lang = "ru"
    await message.answer(get_text("help", lang), parse_mode="Markdown")


@router.message(Command("report"))
async def cmd_report(message: Message):
    from datetime import date
    from app.services.analytics import get_period_summary
    from app.bot.services.formatter import fmt_amount

    today = date.today()
    date_from = date(today.year, today.month, 1)

    async with AsyncSessionLocal() as db:
        summary = await get_period_summary(db, date_from, today)

    lang = "ru"
    lines = {
        "ru": (
            f"📊 *Отчёт за {today.strftime('%B %Y')}*\n\n"
            f"💰 Доходы: *{fmt_amount(summary.total_income)}*\n"
            f"💸 Расходы: *{fmt_amount(summary.total_expense)}*\n"
            f"📈 Чистая прибыль: *{fmt_amount(summary.net)}*\n"
            f"📋 Транзакций: {summary.transaction_count}"
        ),
        "uz": (
            f"📊 *{today.strftime('%B %Y')} hisoboti*\n\n"
            f"💰 Daromad: *{fmt_amount(summary.total_income)}*\n"
            f"💸 Xarajat: *{fmt_amount(summary.total_expense)}*\n"
            f"📈 Sof foyda: *{fmt_amount(summary.net)}*\n"
            f"📋 Tranzaksiyalar: {summary.transaction_count}"
        ),
    }
    await message.answer(lines.get(lang, lines["ru"]), parse_mode="Markdown")
