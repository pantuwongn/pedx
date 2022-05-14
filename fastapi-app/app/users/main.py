import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.users import crud, schemas, classes
from app.dependencies import get_pg_async_db
from app.models.common import Users as _Users
from app.errors import ErrorCode
from app import exceptions

router = APIRouter(prefix="/users")

# TODO create router folder to centralize all router separate by module file name
# TODO creat crud folder to centralize all crud separate module by file name


@router.get("/all")
async def get_all_users(db: AsyncSession = Depends(get_pg_async_db)):
    return await crud.get_all_users(db)


@router.get("/username")
async def get_user_by_email(v: str, db: AsyncSession = Depends(get_pg_async_db)):
    rs = await crud.get_user_by_username(username=v, db=db)
    if len(rs) == 0:
        raise HTTPException(status_code=400, detail="Username not found")
    return rs


@router.get("/email")
async def get_user_by_email(v: str, db: AsyncSession = Depends(get_pg_async_db)):
    rs = await crud.get_user_by_email(email=v, db=db)
    if len(rs) == 0:
        raise HTTPException(status_code=400, detail="Email not found")
    return rs


@router.post("/register")
async def create_user(
    user: schemas.UserCreate, db: AsyncSession = Depends(get_pg_async_db)
):
    try:
        await crud.validate_create_user(user=user, db=db)
        # if not check["is_valid"]:
        #     raise HTTPException(status_code=check["code"], detail=check["detail"])

        created_user = await crud.create_user(user=user, db=db)
    except exceptions.UserAlreadyExists:
        raise HTTPException(
            status_code=400, detail=ErrorCode.REGISTER_USER_ALREADY_EXISTS
        )
    except exceptions.EmailAlreadyUsed:
        raise HTTPException(
            status_code=400, detail=ErrorCode.REGISTER_EMAIL_ALREADY_USED
        )
    return created_user


@router.post("/login")
async def login(user: schemas.UserLogin, db: AsyncSession = Depends(get_pg_async_db)):
    try:
        us: list[_Users] = await crud.get_user_by_username(
            username=user.username, db=db
        )
        if len(us) == 0:
            raise exceptions.UserNotFound()
        helper = classes.UserHelper()
        helper.verify_password(user.password, us[0].hashed_password)
    except exceptions.UserNotFound:
        raise HTTPException(status_code=400, detail=ErrorCode.USER_NOT_FOUND)
    except exceptions.PasswordIncorrect:
        raise HTTPException(status_code=400, detail=ErrorCode.PASSWORD_INCORRECT)
    return
