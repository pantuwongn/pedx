from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator

from app.schemas.users import UserCreate, UserLogin, UserDetail, RoleCreate
from app.manager.users import UserManager
from app.dependencies import get_pg_async_db
from app.errors import ErrorCode
from app.auth.bearer import BearerResponse, BearerDependency, write_token, read_token


def users_routers(db: AsyncGenerator) -> APIRouter:
    router = APIRouter()
    user_manager = UserManager()

    @router.get("/me", dependencies=[Depends(BearerDependency(auto_error=False))])
    async def get_current_user(
        current_user: str = Depends(user_manager.get_current),
        db: AsyncSession = Depends(db),
    ):
        return await user_manager.get_by_user_id(user_id=current_user, db=db)

    @router.get("/all", dependencies=[Depends(BearerDependency(auto_error=False))])
    async def get_all_users(db: AsyncSession = Depends(db)):
        return await user_manager.get_all_users(db=db)

    @router.get("/user_id", dependencies=[Depends(BearerDependency(auto_error=False))])
    async def get_user_by_user_id(v: str, db: AsyncSession = Depends(db)):
        user = await user_manager.get_by_user_id(user_id=v, db=db)
        return user

    @router.get("/email", dependencies=[Depends(BearerDependency(auto_error=False))])
    async def get_user_by_email(v: str, db: AsyncSession = Depends(get_pg_async_db)):
        user = await user_manager.get_by_email(email=v, db=db)
        return user

    @router.post("/register")
    async def create_user(
        user: UserCreate, role: RoleCreate, db: AsyncSession = Depends(db)
    ):
        created_user = await user_manager.create(user=user, role=role, db=db)

        return created_user

    @router.post("/login")
    async def login(user: UserLogin, db: AsyncSession = Depends(db)):
        user_data = await user_manager.authenticate(user=user, db=db)

        if user_data is None:
            raise HTTPException(status_code=400, detail=ErrorCode.USER_NOT_VERIFIED)
        # write token
        access_token = await write_token(user=user_data, token_type="access")
        refresh_token = await write_token(user=user_data, token_type="refresh")
        
        return BearerResponse(
            user_uuid=user_data["user_uuid"],
            user_id=user_data["user_id"],
            firstname=user_data["firstname"],
            lastname=user_data["lastname"],
            email=user_data["email"],
            position_id=user_data["position_id"],
            section_id=user_data["section_id"],
            concern_line=user_data["concern_line"],
            created_at=user_data["created_at"],
            updated_at=user_data["updated_at"],
            is_active=user_data["is_active"],
            is_admin=user_data["is_admin"],
            is_viewer=user_data["is_viewer"],
            is_recorder=user_data["is_recorder"],
            is_checker=user_data["is_checker"],
            is_approver=user_data["is_approver"],
            qar_recorder=user_data["is_recorder"],
            qar_editor=user_data["qar_editor"],
            access_token=access_token,
            refresh_token=refresh_token,
        )

    @router.post(
        "/refresh",
        dependencies=[
            Depends(BearerDependency(token_type="refresh", auto_error=False))
        ],
    )
    async def refresh(token: str = Depends(user_manager.get_token)):
        # token = refresh token
        # refresh_token = token.get("refresh_token")
        user = await read_token(token=token, token_type="refresh")
        new_access_token = await write_token(user=user, token_type="access")
        return BearerResponse(
            user_id=user, access_token=new_access_token, refresh_token=token
        )

    @router.post("/decode")
    async def decode(token: str, type: str):
        return await read_token(token=token, token_type=type)

    # @router.post("/login-verify-token")
    # async def verify_token(token: str, db: AsyncSession = Depends(db)):
    #     username = await read_token(token=token, audience="pedx:auth", db=db)

    #     return await user_manager.get_by_username(username=username, db=db)

    return router
