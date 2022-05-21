from jwcrypto import jwt, jwk
from typing import Optional, Dict
from datetime import datetime
from fastapi import Request, HTTPException, Depends
from fastapi.security import (
    OAuth2PasswordBearer,
    HTTPBearer,
    HTTPAuthorizationCredentials,
)
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app import exceptions
from app.auth.jwt import generate_jwt, decode_jwt
from app.schemas.users import UserDetail, UserCreateDetail
from app.errors import ErrorCode

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token", auto_error=False)

lifetime_access = 1  # minutes
lifetime_refresh = 7  # days


class BearerResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"


async def write_token(
    username: UserCreateDetail,
    # audience: str = "pedx:auth",
    token_type: str = "refresh",
) -> Dict[str, str]:
    if token_type not in ["access", "refresh"]:
        raise ValueError("token_type must be between 'access' or 'refresh'")

    data = {
        "username": username,
        # "username": str(user_data["username"]),
        # "is_admin": user_data["is_admin"],
        # "aud": [audience],
    }
    if token_type == "access":
        return generate_jwt(data=data, lifetime_minutes=lifetime_access)
    else:
        return generate_jwt(data=data, lifetime_days=lifetime_refresh)


# async def refresh_token(token: str = Depends(oauth2_scheme)):


async def read_token(
    token: Optional[str],
    # audience: str = "pedx:auth",
    token_type: str = "refresh",
    # db: AsyncSession = None
) -> str:
    if token is None:
        return None

    try:
        data = decode_jwt(encoded_jwt=token, token_type=token_type)
        username = data.get("username")
        expired_date = data.get("expired_date")

        if expired_date is not None:
            expired_date = datetime.strptime(expired_date, "%Y-%m-%d %H:%M:%S.%f")
        if username is None:
            return None
        if expired_date is None or expired_date < datetime.now():
            raise exceptions.InvalidToken()

        return username
    except jwk.InvalidJWKValue:
        raise HTTPException(status_code=403, detail=ErrorCode.INVALID_TOKEN_ERROR)
    except exceptions.InvalidToken:
        raise HTTPException(status_code=403, detail=ErrorCode.INVALID_TOKEN)


class BearerDependency(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(BearerDependency, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        try:
            credentials: HTTPAuthorizationCredentials = await super(
                BearerDependency, self
            ).__call__(request)

            if credentials:
                if not credentials.scheme == "Bearer":
                    raise HTTPException(
                        status_code=403, detail=ErrorCode.INVALID_AUTHENTICATION_SCHEME
                    )
                if not decode_jwt(encoded_jwt=credentials.credentials):
                    raise HTTPException(status_code=403, detail=ErrorCode.INVALID_TOKEN)
                return credentials.credentials
            else:
                raise HTTPException(
                    status_code=403, detail=ErrorCode.INVALID_AUTHORIZATION_TOKEN
                )
        except jwk.InvalidJWKValue:
            raise HTTPException(status_code=403, detail=ErrorCode.INVALID_TOKEN_ERROR)
