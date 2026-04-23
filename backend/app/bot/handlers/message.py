from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import Message, ReplyKeyboardMarkup, KeyboardButton, ReplyKeyboardRemove
from aiogram.fsm.context import FSMContext
from datetime import date
from decimal import Decimal
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.category import Category
from app.bot.services.gemini import gemini_service
from app.bot.services.formatter import (
    get_text, format_transaction_saved, fmt_amount
)
from app.bot.services.query_handler import handle_query
from app.bot.handlers.states import TransactionFSM
from app.schemas.transaction import TransactionCreate
from app.services.transaction import create_transaction, get_last_transaction_by_user, delete_transaction
from app.services.category import get_all_categories, find_category_by_hint

router = Router()


async def _get_or_create_db_user(telegram_id: int, username: str | None = None, first_name: str | None = None) -> User:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.telegram_id == telegram_id))
        user = result.scalar_one_or_none()
        if not user:
            user = User(telegram_id=telegram_id, username=username, first_name=first_name)
            db.add(user)
            await db.commit()
            await db.refresh(user)
        return user


async def _get_user_lang(telegram_id: int) -> str:
    user = await _get_or_create_db_user(telegram_id)
    return user.language or "ru"


async def _build_category_keyboard(tx_type: str) -> ReplyKeyboardMarkup:
    async with AsyncSessionLocal() as db:
        cats = await get_all_categories(db)
    filtered = [c for c in cats if c.type == tx_type]
    buttons = [[KeyboardButton(text=c.name)] for c in filtered[:8]]
    return ReplyKeyboardMarkup(keyboard=buttons, resize_keyboard=True, one_time_keyboard=True)


async def _process_parsed(message: Message, state: FSMContext, parsed: dict):
    intent = parsed.get("intent", "unknown")
    lang = parsed.get("response_language", "ru")
    from_user = message.from_user

    db_user = await _get_or_create_db_user(from_user.id, from_user.username, from_user.first_name)
    db_user_id = db_user.id

    if intent in ("log_income", "log_expense"):
        tx_type = "income" if intent == "log_income" else "expense"
        amount = parsed.get("amount")
        category_hint = parsed.get("category_hint")
        note = parsed.get("note")
        tx_date_str = parsed.get("date")
        tx_date = date.fromisoformat(tx_date_str) if tx_date_str else date.today()

        if not amount or amount <= 0:
            await state.set_state(TransactionFSM.awaiting_amount)
            await state.update_data(parsed=parsed, lang=lang, tx_type=tx_type, tx_date=str(tx_date), note=note, db_user_id=db_user_id)
            await message.answer(get_text("ask_amount", lang), reply_markup=ReplyKeyboardRemove())
            return

        category_id = None
        category_name = "Boshqa xarajat / Прочие расходы" if tx_type == "expense" else "Boshqa daromad / Прочие доходы"

        async with AsyncSessionLocal() as db:
            if category_hint:
                cat = await find_category_by_hint(db, category_hint, tx_type)
                if cat:
                    category_id = cat.id
                    category_name = cat.name
                else:
                    await state.set_state(TransactionFSM.awaiting_category)
                    await state.update_data(
                        amount=amount, tx_type=tx_type, tx_date=str(tx_date),
                        note=note, lang=lang, currency=parsed.get("currency", "UZS"), db_user_id=db_user_id,
                    )
                    kb = await _build_category_keyboard(tx_type)
                    await message.answer(get_text("ask_category", lang), reply_markup=kb)
                    return
            else:
                await state.set_state(TransactionFSM.awaiting_category)
                await state.update_data(
                    amount=amount, tx_type=tx_type, tx_date=str(tx_date),
                    note=note, lang=lang, currency=parsed.get("currency", "UZS"), db_user_id=db_user_id,
                )
                kb = await _build_category_keyboard(tx_type)
                await message.answer(get_text("ask_category", lang), reply_markup=kb)
                return

            tx_data = TransactionCreate(
                amount=Decimal(str(amount)),
                type=tx_type,
                category_id=category_id,
                date=tx_date,
                note=note,
                source="bot",
            )
            tx = await create_transaction(db, tx_data, user_id=db_user_id)
            currency = parsed.get("currency", "UZS") or "UZS"
            await message.answer(
                format_transaction_saved(tx_type, tx.amount, currency, category_name, tx_date, note, lang),
                parse_mode="Markdown",
                reply_markup=ReplyKeyboardRemove(),
            )

    elif intent == "query":
        async with AsyncSessionLocal() as db:
            answer = await handle_query(db, parsed, message.text or "", lang)
        await message.answer(answer, parse_mode="Markdown")

    elif intent == "delete_last":
        async with AsyncSessionLocal() as db:
            tx = await get_last_transaction_by_user(db, db_user_id)
            if tx:
                await delete_transaction(db, tx)
                await message.answer(get_text("deleted", lang))
            else:
                await message.answer(get_text("nothing_to_delete", lang))

    elif intent == "help":
        await message.answer(get_text("help", lang), parse_mode="Markdown")

    else:
        if parsed.get("clarification_needed") and parsed.get("clarification_question"):
            await message.answer(parsed["clarification_question"])
        else:
            await message.answer(get_text("help", lang), parse_mode="Markdown")


@router.message(Command("delete"))
async def cmd_delete_last(message: Message):
    from_user = message.from_user
    db_user = await _get_or_create_db_user(from_user.id, from_user.username, from_user.first_name)
    lang = db_user.language or "ru"
    async with AsyncSessionLocal() as db:
        tx = await get_last_transaction_by_user(db, db_user.id)
        if tx:
            await delete_transaction(db, tx)
            await message.answer(get_text("deleted", lang))
        else:
            await message.answer(get_text("nothing_to_delete", lang))


@router.message(TransactionFSM.awaiting_category)
async def handle_category_response(message: Message, state: FSMContext):
    data = await state.get_data()
    lang = data.get("lang", "ru")
    tx_type = data.get("tx_type", "expense")
    amount = Decimal(str(data.get("amount", 0)))
    tx_date = date.fromisoformat(data.get("tx_date", str(date.today())))
    note = data.get("note")
    currency = data.get("currency", "UZS")
    category_name_input = message.text or ""

    async with AsyncSessionLocal() as db:
        cat = await find_category_by_hint(db, category_name_input, tx_type)
        if not cat:
            cats = await get_all_categories(db)
            exact = [c for c in cats if c.name.lower() == category_name_input.lower() and c.type == tx_type]
            cat = exact[0] if exact else None

        category_id = cat.id if cat else None
        category_name = cat.name if cat else category_name_input

        db_user_id = data.get("db_user_id")
        tx_data = TransactionCreate(
            amount=amount,
            type=tx_type,
            category_id=category_id,
            date=tx_date,
            note=note,
            source="bot",
        )
        tx = await create_transaction(db, tx_data, user_id=db_user_id)

    await state.clear()
    await message.answer(
        format_transaction_saved(tx_type, amount, currency, category_name, tx_date, note, lang),
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardRemove(),
    )


@router.message(TransactionFSM.awaiting_amount)
async def handle_amount_response(message: Message, state: FSMContext):
    data = await state.get_data()
    lang = data.get("lang", "ru")
    text = message.text or ""
    re_parsed = await gemini_service.parse_text(text)
    amount = re_parsed.get("amount")
    if not amount or amount <= 0:
        await message.answer(get_text("ask_amount", lang))
        return
    await state.update_data(amount=amount, currency=re_parsed.get("currency", "UZS"))
    new_data = await state.get_data()
    tx_type = new_data.get("tx_type", "expense")
    await state.set_state(TransactionFSM.awaiting_category)
    kb = await _build_category_keyboard(tx_type)
    await message.answer(get_text("ask_category", lang), reply_markup=kb)


@router.message(F.text & ~F.text.startswith("/"))
async def handle_text_message(message: Message, state: FSMContext):
    text = message.text or ""
    parsed = await gemini_service.parse_text(text)
    await _process_parsed(message, state, parsed)
