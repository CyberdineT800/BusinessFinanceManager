from fastapi import APIRouter, HTTPException, status
from app.schemas.auth import LoginRequest, TokenResponse
from app.core.auth import verify_password, create_access_token
from app.core.config import settings

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    if data.username != settings.DASHBOARD_USERNAME:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not verify_password(data.password, settings.DASHBOARD_PASSWORD_HASH):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return TokenResponse(access_token=create_access_token(data.username))
