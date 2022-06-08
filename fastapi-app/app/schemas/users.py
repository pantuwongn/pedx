from pydantic import BaseModel, EmailStr
from typing import Optional, List

class UserBase(BaseModel):
    user_id : str

class UserLogin(UserBase):
    user_pass : str

class RoleCreate(BaseModel):
    is_admin: Optional[bool] = False
    is_viewer: Optional[bool] = False
    is_recorder: Optional[bool] = False
    is_checker: Optional[bool] = False
    is_approver: Optional[bool] = False
    qar_recorder: Optional[bool] = False
    qar_editor: Optional[bool] = False

class UserCreate(UserLogin):
    firstname : str
    lastname : str
    email: EmailStr
    app_line_id: Optional[str] = ""
    position_id: int
    section_code: int
    concern_section: Optional[List[int]] = "[]"
    class Config:
        orm_mode = True
        
class UserDetail(UserCreate):
    user_id: str
