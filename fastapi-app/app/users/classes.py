import uuid
from typing import Optional
from fastapi import HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from passlib import pwd
from passlib.context import CryptContext

from app import exceptions
from app.crud import UsersCRUD
from app.errors import ErrorCode
from app.models.common import Users
from app.users.schemas import UserDetail, UserCreate, UserLogin
from app.dependencies import get_pg_async_db
from app.types import DependencyCallable


class User:
    def __init__(self) -> None:
        self.id = ""
        self.username = ""
        self.hashed_password = ""
        self.email = ""
        self.line_id = ""
        self.is_admin = False

    def __getitem__(self, key):
        return getattr(self, key)

    def __setitem__(self, key, value):
        return setattr(self, key, value)


class UserManager:
    def __init__(self) -> None:
        self.password_manager = PasswordManager()
        self.crud = UsersCRUD()
        # set_db(get_pg_async_db)
        # TODO create user manager
        # reset password
        # forget password
        # update detail

    async def get_all_users(self, db: AsyncSession):
        return await self.crud.get_all_users(db=db)

    async def get_by_username(self, username: str, db: AsyncSession):
        try:
            user_data = await self.crud.get_user_by_username(username=username, db=db)

        except exceptions.UserNotFound:
            raise HTTPException(status_code=400, detail=ErrorCode.USER_NOT_FOUND)
        return user_data[0]

    async def get_by_email(self, email: str, db: AsyncSession):
        try:
            user_data = await self.crud.get_user_by_email(email=email, db=db)

        except exceptions.EmailNotFound:
            raise HTTPException(status_code=400, detail="Email not found")
        return user_data[0]

    async def create(self, user: UserCreate, db: AsyncSession) -> str:
        try:
            helper = PasswordManager()
            user_detail = User()

            await self.crud.validate_create_user(user=user, db=db)

            user_detail["hashed_password"] = helper.hash_password(
                password=user.password
            )
            user_detail["id"] = helper.generate_uuid(email=user.email)

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
            user_data = await self.get_by_username(username=user.username,db=db)
            
            self.password_manager.verify_password(
                user.password, user_data.hashed_password
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
