from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator

from app.users import schemas
from app.users.classes import UserManager
from app.dependencies import get_pg_async_db, get_db
from app.errors import ErrorCode
from app.auth.bearer import BearerResponse,BearerDependency, write_token, read_token


# TODO create router folder to centralize all router separate by module file name
# TODO create crud folder to centralize all crud separate module by file name


def users_routers(db: AsyncGenerator) -> APIRouter:
    router = APIRouter()
    user_manager = UserManager()

    @router.get("/me",dependencies=[Depends(BearerDependency())])
    async def get_current_user(db:AsyncSession = Depends(db)):
        return {"detail":"authorized route"}

    @router.get("/all")
    async def get_all_users(db: AsyncSession = Depends(db)):
        return await user_manager.get_all_users(db=db)

    @router.get("/username")
    async def get_use_by_username(v: str, db: AsyncSession = Depends(db)):
        user = await user_manager.get_by_username(username=v,db=db)
        return user

    @router.get("/email")
    async def get_use_by_email(v: str, db: AsyncSession = Depends(get_pg_async_db)):
        user = await user_manager.get_by_email(email=v,db=db)
        return user

    @router.post("/register")
    async def create_user(user: schemas.UserCreate, db: AsyncSession = Depends(db)):
        created_user = await user_manager.create(user=user,db=db)

        return created_user

    @router.post("/login")
    async def login(user: schemas.UserLogin, db: AsyncSession = Depends(db)):
        user_data = await user_manager.authenticate(user=user,db=db)

        if user_data is None:
            raise HTTPException(status_code=400, detail=ErrorCode.USER_NOT_VERIFIED)

        # write token
        token = await write_token(user_data, "pedx:auth")
        
        return BearerResponse(access_token=token)

    @router.post("/login-verify-token")
    async def verify_token(token: str, db: AsyncSession = Depends(db)):
        user_data = await read_token(
            token=token, audience="pedx:auth", user_manager=user_manager,db=db
        )

        return user_data

    return router
