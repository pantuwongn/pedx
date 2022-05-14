from pydantic import BaseModel, EmailStr


class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(UserLogin):
    email: EmailStr

class User(UserCreate):
    pass

    class Config:
        orm_mode = True