from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    username: str

class UserLogin(UserBase):
    password: str

class UserCreate(UserLogin):
    email: EmailStr
    line_id: Optional[str] = ""
    is_admin: Optional[bool] = False

class UserDetail(UserCreate):
    id: str
    username: str
    email: EmailStr
    line_id: str
    is_admin: bool

class UserCreateDetail(UserDetail):
    hashed_password: str