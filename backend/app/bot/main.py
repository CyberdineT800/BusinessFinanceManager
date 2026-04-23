from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage
from app.core.config import settings
from app.bot.handlers import start, message, voice


def create_bot() -> Bot:
    return Bot(token=settings.TELEGRAM_BOT_TOKEN)


def create_dispatcher() -> Dispatcher:
    dp = Dispatcher(storage=MemoryStorage())
    dp.include_router(start.router)
    dp.include_router(voice.router)
    dp.include_router(message.router)
    return dp


async def start_polling():
    bot = create_bot()
    dp = create_dispatcher()
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)
