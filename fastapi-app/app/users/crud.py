from sqlalchemy import select, insert, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app import exceptions
from app.users import schemas
from app.users.classes import User, UserHelper
from app.models.common import Users as _Users
from app.functions import toArray, toArrayWithKey
from app.types import exceptionResult


async def get_all_users(db: AsyncSession):
    stmt = select(_Users)
    rs = toArray(await db.execute(stmt))
    return rs


async def get_user_by_username(username: str, db: AsyncSession) -> list[_Users]:
    stmt = select(_Users).where(_Users.username == username).limit(1)
    rs = toArray(await db.execute(stmt))
    return rs


async def get_user_by_email(email: str, db: AsyncSession) -> list[_Users]:
    stmt = select(_Users).where(_Users.email == email).limit(1)
    rs = toArray(await db.execute(stmt))
    return rs


async def validate_create_user(user: schemas.UserCreate, db: AsyncSession) -> None:
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


async def create_user(user: schemas.UserCreate, db: AsyncSession):
    helper = UserHelper()
    user_detail = User()
    user_detail["hashed_password"] = helper.hash_password(password=user.password)
    user_detail["id"] = helper.generate_uuid(email=user.email)

    # delete password key
    dict_user = dict(user)
    if dict_user["password"] is not None:
        del dict_user["password"]
    user_detail = dict(
        user_detail.__dict__, **dict_user
    )  # concatenate user's dict detail

    stmt = insert(_Users).values(user_detail).returning(_Users.username)
    # rs = toArray(await db.execute(stmt))
    rs = (await db.execute(stmt)).first()
    await db.commit()
    return rs
