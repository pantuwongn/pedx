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
    section_id: int
    concern_line: Optional[List[int]] = []
    is_active: bool = False
    class Config:
        orm_mode = True
        
class UserDetail(UserCreate):
    user_uuid: str
    user_id: str
    created_at: str
    updated_at: str
