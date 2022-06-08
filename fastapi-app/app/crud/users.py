from fastapi import Depends
from sqlalchemy import select, insert, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app import exceptions
from app.schemas.users import UserCreate, RoleCreate
from app.models.users import Users as _Users, Roles, Positions
from app.functions import toArray, toArrayWithKey


class UsersCRUD:
    def __init__(self):
        pass

    async def get_all_users(self, safe: bool = True):
        except_column = []
        if safe:
            except_column.append("user_pass")

        stmt = select(_Users)
        rs = toArrayWithKey(await self.db.execute(stmt), _Users, except_column)
        return rs

    async def get_user_by_user_id(
        self, user_id: str, safe: bool = True, db: AsyncSession = None
    ) -> list:
        except_column = ["user_uuid"]
        if safe:
            except_column.append("user_pass")

        stmt = f"""
        SELECT *
        FROM users INNER JOIN roles ON users.uuid = roles.user_uuid
        WHERE users.user_id = '{user_id}'
        """
        rs = toArrayWithKey(
            input=await db.execute(stmt), except_column=except_column, raw=True
        )
        if len(rs) == 0:
            raise exceptions.UserNotFound()
        return rs

    async def get_user_by_email(
        self, email: str, safe: bool = True, db: AsyncSession = None
    ) -> list:
        except_column = []
        if safe:
            except_column.append("user_pass")

        stmt = select(_Users).where(_Users.email == email).limit(1)
        rs = toArrayWithKey(await db.execute(stmt), _Users, except_column)
        if len(rs) == 0:
            raise exceptions.EmailNotFound()
        return rs

    async def validate_create_user(self, user: UserCreate, db: AsyncSession) -> None:
        stmt = select(_Users.user_id, _Users.email).where(
            or_(_Users.user_id == user.user_id, _Users.email == user.email)
        )
        rs = toArrayWithKey(await db.execute(stmt), _Users)
        # d: tuple[str] = ()
        for r in rs:
            if r["user_id"] == user.user_id:
                raise exceptions.UserAlreadyExists()
            if r["email"] == user.email:
                raise exceptions.EmailAlreadyUsed()
        # if d.__len__() > 0:
        # return exceptionResult(is_valid=False, code=400, detail=list(d))
        # raise exceptions.InvalidPassword(list(d))
        return

    async def create_user(self, user: UserCreate, role: RoleCreate, db: AsyncSession):
        # insert in Users table
        stmt = insert(_Users).values(user).returning(_Users.uuid, _Users.user_id)
        # rs = toArray(await db.execute(stmt))
        rs = (await db.execute(stmt)).first()
        # await db.commit()

        # insert in Roles table
        role_add = {**role.__dict__, **{"user_uuid": rs.uuid}}
        stmt = insert(Roles).values(role_add)
        await db.execute(stmt)
        await db.commit()

        return rs
