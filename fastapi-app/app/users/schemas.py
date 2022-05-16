from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    username: str

class UserLogin(UserBase):
    password: str

class UserCreate(UserLogin):
    email: EmailStr

class UserDetail(UserCreate):
    id: str
    line_id: str
    is_admin: bool

class UserCreateDetail(UserDetail):
    hashed_password: str