import jwt
from typing import Optional
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app import exceptions
from app.users.classes import User, UserManager
from app.auth.jwt import generate_jwt, decode_jwt
from app.users.schemas import UserDetail

class BearerResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"

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
        print(data)
        username = data.get("username")
        if username is None:
            return None
    except jwt.PyJWTError:
        return None

    try:
        return await user_manager.get_by_username(username=username, db=db)
    except exceptions.UserNotFound:
        return None

class BearerDependency(HTTPBearer):
    def __init__(self,auto_error: bool = True):
        super(BearerDependency,self).__init__(auto_error=auto_error)

    async def __call__(self,request: Request):
        credentials: HTTPAuthorizationCredentials = await super(BearerDependency,self).__call__(request)
        
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(status_code=403,detail="Invalid authentication scheme")
            if not decode_jwt(encoded_jwt=credentials.credentials):
                raise HTTPException(status_code=403,detail="Invalid token or expired token")
            return credentials.credentials
        else:
            raise HTTPException(status_code=403, detail="Invalid authorization code.")