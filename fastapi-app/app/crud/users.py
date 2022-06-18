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

        stmt = """SELECT * FROM users"""
        rs = toArrayWithKey(await self.db.execute(stmt), except_column)
        return rs

    async def get_user_by_user_id(
        self, user_id: str, safe: bool = True, db: AsyncSession = None
    ) -> list:
        except_column = []
        if safe:
            except_column.append("user_pass")

        stmt = f"""
        SELECT *
        FROM users INNER JOIN roles ON users.user_uuid = roles.user_uuid
        WHERE users.user_id = '{user_id}'
        """
        rs = toArrayWithKey(
            input=await db.execute(stmt), except_column=except_column
        )
        print(rs)
        if len(rs) == 0:
            raise exceptions.UserNotFound()
        return rs

    async def get_user_by_email(
        self, email: str, safe: bool = True, db: AsyncSession = None
    ) -> list:
        except_column = []
        if safe:
            except_column.append("user_pass")

        stmt = f"""
            SELECT * FROM users
            WHERE email = '{email}'
            LIMIT 1
        """
        rs = toArrayWithKey(await db.execute(stmt), except_column)
        if len(rs) == 0:
            raise exceptions.EmailNotFound()
        return rs

    async def validate_create_user(self, user: UserCreate, db: AsyncSession) -> None:
        stmt = f"""
            SELECT user_id, email FROM users
            WHERE user_id = '{user.user_id}' OR 
            email = '{user.email}'
        """
        rs = toArrayWithKey(await db.execute(stmt))
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
        stmt = insert(_Users).values(user).returning(_Users.user_uuid, _Users.user_id)
        # rs = toArray(await db.execute(stmt))
        rs = (await db.execute(stmt)).first()
        # await db.commit()

        # insert in Roles table
        role_add = {**role.__dict__, **{"user_uuid": rs.user_uuid}}
        stmt = insert(Roles).values(role_add)
        await db.execute(stmt)
        await db.commit()

        return rs
