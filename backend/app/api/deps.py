from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.auth import decode_access_token
from app.core.config import settings
import jwt

_bearer = HTTPBearer(auto_error=False)

DatabaseDep = Depends(get_db)


async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(_bearer)) -> str:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        username = decode_access_token(credentials.credentials)
        if username != settings.DASHBOARD_USERNAME:
            raise ValueError()
        return username
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, ValueError, KeyError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalid or expired",
            headers={"WWW-Authenticate": "Bearer"},
        )


AuthDep = Depends(verify_token)
