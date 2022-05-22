import uuid
from typing import Optional
from fastapi import HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from passlib import pwd
from passlib.context import CryptContext

from app import exceptions
from app.crud import UsersCRUD
from app.errors import ErrorCode
from app.models.users import Users
from app.schemas.users import UserCreate, UserLogin, UserCreateDetail
from app.types import DependencyCallable
from app.auth.bearer import oauth2_scheme, read_token


class UserManager:
    def __init__(self) -> None:
        self.password_manager = PasswordManager()
        self.crud = UsersCRUD()
        # set_db(get_pg_async_db)
        # TODO create user manager
        # reset password
        # forget password
        # update detail

    async def get_current(self, token: str = Depends(oauth2_scheme)):
        print(token)
        username = await read_token(token=token,token_type="access")
        return username

    async def get_token(self, token: str=Depends(oauth2_scheme)):
        return token

    async def get_all_users(self, safe: bool = True, db: AsyncSession = None):
        return await self.crud.get_all_users(safe=safe, db=db)

    async def get_by_username(
        self, username: str, safe: bool = True, db: AsyncSession = None
    ):
        try:
            user_data = await self.crud.get_user_by_username(
                username=username, safe=safe, db=db
            )

        except exceptions.UserNotFound:
            raise HTTPException(status_code=400, detail=ErrorCode.USER_NOT_FOUND)
        return user_data[0]

    async def get_by_email(
        self, email: str, safe: bool = True, db: AsyncSession = None
    ):
        try:
            user_data = await self.crud.get_user_by_email(email=email, safe=safe, db=db)

        except exceptions.EmailNotFound:
            raise HTTPException(status_code=400, detail="Email not found")
        return user_data[0]

    async def create(self, user: UserCreate, db: AsyncSession) -> str:
        try:
            helper = PasswordManager()
            user_detail = UserCreateDetail(user).__dict__
            await self.crud.validate_create_user(user=user, db=db)

            user_detail["hashed_password"] = helper.hash_password(
                password=user.password
            )
            user_detail["id"] = helper.generate_uuid(email=user.email)

            # delete password key
            if user_detail.get("password") is not None:
                del user_detail["password"]

            created_user = await self.crud.create_user(user=user_detail, db=db)

        except exceptions.UserAlreadyExists:
            raise HTTPException(
                status_code=400, detail=ErrorCode.REGISTER_USER_ALREADY_EXISTS
            )
        except exceptions.EmailAlreadyUsed:
            raise HTTPException(
                status_code=400, detail=ErrorCode.REGISTER_EMAIL_ALREADY_USED
            )
        return created_user

    async def authenticate(self, user: UserLogin, db: AsyncSession) -> Users:
        try:
            user_data = await self.get_by_username(
                username=user.username, safe=False, db=db
            )
            
            self.password_manager.verify_password(
                user.password, user_data.get("hashed_password")
            )

            # if not user_data.is_verified:
            #     return None
        except exceptions.PasswordIncorrect:
            raise HTTPException(status_code=400, detail=ErrorCode.PASSWORD_INCORRECT)
        return user_data


class PasswordManager:
    def __init__(self, context: Optional[CryptContext] = None) -> None:
        if context is None:
            self.context = CryptContext(
                schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12
            )
        else:
            self.context = context

    def generate_uuid(self, email: str) -> str:
        return str(uuid.uuid5(uuid.NAMESPACE_X500, email))

    def hash_password(self, password: str) -> str:
        return self.context.hash(password)

    def verify_password(self, password: str, hashed_password: str) -> None:
        verified, _ = self.context.verify_and_update(password, hashed_password)
        if not verified:
            raise exceptions.PasswordIncorrect()

    def generate_password(self) -> str:
        return pwd.genword(length=10, charset="ascii_50")


UserManagerDependency = DependencyCallable[UserManager]
