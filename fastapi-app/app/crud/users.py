from fastapi import Depends
from sqlalchemy import select, insert, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app import exceptions
from app.schemas.users import UserCreate, UserCreateDetail
from app.models.users import Users as _Users
from app.functions import toArray, toArrayWithKey


class UsersCRUD:
    def __init__(self):
        pass

    async def get_all_users(self, safe: bool = True):
        except_column = []
        if safe:
            except_column.append("hashed_password")

        stmt = select(_Users)
        rs = toArrayWithKey(await self.db.execute(stmt), _Users, except_column)
        return rs

    async def get_user_by_username(
        self, username: str, safe: bool=True, db: AsyncSession = None
    ) -> list[_Users]:
        except_column = []
        if safe:
            except_column.append("hashed_password")

        stmt = select(_Users).where(_Users.username == username).limit(1)
        rs = toArrayWithKey(await db.execute(stmt), _Users, except_column)
        print(safe)
        print("rs",rs)
        if len(rs) == 0:
            raise exceptions.UserNotFound()
        return rs

    async def get_user_by_email(
        self, email: str, safe: bool= True, db: AsyncSession = None
    ) -> list[_Users]:
        except_column = []
        if safe:
            except_column.append("hashed_password")

        stmt = select(_Users).where(_Users.email == email).limit(1)
        rs = toArrayWithKey(await db.execute(stmt), _Users, except_column)
        if len(rs) == 0:
            raise exceptions.EmailNotFound()
        return rs

    async def validate_create_user(self, user: UserCreate, db: AsyncSession) -> None:
        stmt = select(_Users).where(
            or_(_Users.username == user.username, _Users.email == user.email)
        )
        rs = toArrayWithKey(await db.execute(stmt), _Users)
        # d: tuple[str] = ()
        for r in rs:
            if r["username"] == user.username:
                # d += ("Username already registered",)
                raise exceptions.UserAlreadyExists()
            if r["email"] == user.email:
                raise exceptions.EmailAlreadyUsed()
        # if d.__len__() > 0:
        # return exceptionResult(is_valid=False, code=400, detail=list(d))
        # raise exceptions.InvalidPassword(list(d))
        return

    async def create_user(self, user: UserCreateDetail, db: AsyncSession):
        # print(user)
        stmt = insert(_Users).values(user).returning(_Users.username)
        # rs = toArray(await db.execute(stmt))
        rs = (await db.execute(stmt)).first()
        await db.commit()
        return rs
