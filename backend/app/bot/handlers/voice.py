from aiogram import Router, F, Bot
from aiogram.types import Message
from aiogram.fsm.context import FSMContext
from app.bot.services.gemini import gemini_service
from app.bot.handlers.message import _process_parsed

router = Router()


@router.message(F.voice)
async def handle_voice_message(message: Message, state: FSMContext, bot: Bot):
    voice = message.voice
    file = await bot.get_file(voice.file_id)
    file_bytes = await bot.download_file(file.file_path)
    audio_bytes = file_bytes.read() if hasattr(file_bytes, "read") else file_bytes

    parsed = await gemini_service.parse_voice(audio_bytes, mime_type="audio/ogg")
    await _process_parsed(message, state, parsed)
