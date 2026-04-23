from decimal import Decimal
from datetime import date
from typing import Optional


def fmt_amount(amount: Decimal | float | int, currency: str = "UZS") -> str:
    n = int(amount)
    formatted = f"{n:,}".replace(",", " ")
    symbol = {"UZS": "so'm", "USD": "$", "EUR": "€"}.get(currency, currency)
    if currency == "USD":
        return f"{symbol}{formatted}"
    return f"{formatted} {symbol}"


def fmt_date(d: date, lang: str = "ru") -> str:
    months = {
        "ru": ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"],
        "uz": ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"],
        "en": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    }
    m = months.get(lang, months["ru"])
    return f"{d.day} {m[d.month - 1]} {d.year}"


TEXTS = {
    "saved": {
        "ru": "✅ *Записано!*\n{emoji} {type_label} *{amount}*\nКатегория: {category}\nДата: {date}\n{note_line}",
        "uz": "✅ *Saqlandi!*\n{emoji} {type_label} *{amount}*\nKategoriya: {category}\nSana: {date}\n{note_line}",
        "en": "✅ *Saved!*\n{emoji} {type_label} *{amount}*\nCategory: {category}\nDate: {date}\n{note_line}",
    },
    "ask_category": {
        "ru": "Не понял категорию. Выберите из списка или напишите свою:",
        "uz": "Kategoriyani tushunmadim. Ro'yxatdan tanlang yoki o'zingiz yozing:",
        "en": "I didn't catch the category. Choose from the list or type your own:",
    },
    "ask_amount": {
        "ru": "Сколько? Укажите сумму:",
        "uz": "Qancha? Miqdorni kiriting:",
        "en": "How much? Please enter the amount:",
    },
    "deleted": {
        "ru": "🗑 Последняя транзакция удалена.",
        "uz": "🗑 Oxirgi tranzaksiya o'chirildi.",
        "en": "🗑 Last transaction deleted.",
    },
    "nothing_to_delete": {
        "ru": "Нет транзакций для удаления.",
        "uz": "O'chirish uchun tranzaksiya yo'q.",
        "en": "No transactions to delete.",
    },
    "corrected": {
        "ru": "✏️ Последняя транзакция обновлена.",
        "uz": "✏️ Oxirgi tranzaksiya yangilandi.",
        "en": "✏️ Last transaction updated.",
    },
    "error": {
        "ru": "Что-то пошло не так. Попробуйте ещё раз.",
        "uz": "Nimadir noto'g'ri ketdi. Qayta urinib ko'ring.",
        "en": "Something went wrong. Please try again.",
    },
    "help": {
        "ru": (
            "💼 *Business Finance Bot*\n\n"
            "Я помогу вести финансы вашего бизнеса.\n\n"
            "*Как пользоваться:*\n"
            "• Напишите или надиктуйте транзакцию:\n"
            "  _«50 000 расход на логистику»_\n"
            "  _«Получили 2 млн от клиента»_\n\n"
            "• Задайте вопрос:\n"
            "  _«Сколько потратили в этом месяце?»_\n"
            "  _«Доходы за эту неделю»_\n\n"
            "• Управление:\n"
            "  /delete — удалить последнюю запись\n"
            "  /report — отчёт за месяц\n"
            "  /start — главное меню\n"
        ),
        "uz": (
            "💼 *Business Finance Bot*\n\n"
            "Biznesingiz moliyasini boshqarishga yordam beraman.\n\n"
            "*Qanday foydalanish:*\n"
            "• Tranzaksiyani yozing yoki aytib bering:\n"
            "  _«50 000 logistikaga xarajat»_\n"
            "  _«Mijozdan 2 mln tushumdi»_\n\n"
            "• Savol bering:\n"
            "  _«Bu oyda qancha sarfladik?»_\n"
            "  _«Bu haftaning daromadi»_\n\n"
            "• Boshqaruv:\n"
            "  /delete — oxirgi yozuvni o'chirish\n"
            "  /report — oylik hisobot\n"
            "  /start — asosiy menyu\n"
        ),
        "en": (
            "💼 *Business Finance Bot*\n\n"
            "I help manage your business finances.\n\n"
            "*How to use:*\n"
            "• Write or voice a transaction:\n"
            "  _'50,000 expense for logistics'_\n"
            "  _'Received 2M from client'_\n\n"
            "• Ask questions:\n"
            "  _'How much did we spend this month?'_\n"
            "  _'Income this week'_\n\n"
            "• Commands:\n"
            "  /delete — delete last entry\n"
            "  /report — monthly report\n"
            "  /start — main menu\n"
        ),
    },
    "welcome": {
        "ru": "👋 Привет, *{name}*! Я ваш финансовый ассистент.\n\nНапишите /help чтобы узнать, что я умею.",
        "uz": "👋 Salom, *{name}*! Men sizning moliyaviy yordamchingizman.\n\nImkoniyatlar bilan tanishish uchun /help yozing.",
        "en": "👋 Hello, *{name}*! I'm your business finance assistant.\n\nType /help to see what I can do.",
    },
}


def get_text(key: str, lang: str, **kwargs) -> str:
    texts = TEXTS.get(key, {})
    template = texts.get(lang, texts.get("ru", ""))
    if kwargs:
        try:
            return template.format(**kwargs)
        except KeyError:
            return template
    return template


def format_transaction_saved(
    tx_type: str,
    amount: Decimal,
    currency: str,
    category: str,
    tx_date: date,
    note: Optional[str],
    lang: str,
) -> str:
    emoji = "💰" if tx_type == "income" else "💸"
    type_labels = {
        "income": {"ru": "Доход", "uz": "Daromad", "en": "Income"},
        "expense": {"ru": "Расход", "uz": "Xarajat", "en": "Expense"},
    }
    type_label = type_labels[tx_type].get(lang, type_labels[tx_type]["ru"])
    note_labels = {"ru": f"Заметка: {note}", "uz": f"Izoh: {note}", "en": f"Note: {note}"}
    note_line = note_labels.get(lang, "") if note else ""

    return get_text(
        "saved", lang,
        emoji=emoji,
        type_label=type_label,
        amount=fmt_amount(amount, currency),
        category=category,
        date=fmt_date(tx_date, lang),
        note_line=note_line,
    )
