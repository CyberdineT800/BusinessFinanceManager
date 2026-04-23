import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine
from app.api.v1.router import router as api_router
from app.models.base import Base


async def _init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    from app.core.database import AsyncSessionLocal
    from app.services.category import seed_default_categories
    async with AsyncSessionLocal() as db:
        await seed_default_categories(db)


async def _run_bot():
    from app.bot.main import start_polling
    await start_polling()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await _init_db()
    bot_task = asyncio.create_task(_run_bot())
    yield
    bot_task.cancel()
    try:
        await bot_task
    except asyncio.CancelledError:
        pass
    await engine.dispose()


app = FastAPI(
    title="Business Finance Manager API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok"}
