import jwt
from typing import Optional
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app import exceptions
from app.users.classes import User, UserManager
from app.auth.jwt import generate_jwt, decode_jwt
from app.users.schemas import UserDetail


async def write_token(user_data: User, audience: str) -> str:
    data = {"username": str(user_data.username), "aud": [audience]}
    return generate_jwt(data=data, lifetime_seconds=60)


async def read_token(
    token: Optional[str], audience: str, user_manager: UserManager, db: AsyncSession
) -> UserDetail:
    if token is None:
        return None

    try:
        data = decode_jwt(encoded_jwt=token, audience=[audience])
        username = data.get("username")
        if username is None:
            return None
    except jwt.PyJWTError:
        return None

    try:
        return await user_manager.get_by_username(username=username, db=db)
    except exceptions.UserNotFound:
        return None
