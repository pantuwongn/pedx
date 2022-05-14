from enum import Enum
from typing import Union, Dict

class ErrorModel():
    detail: Union[str,Dict[str,str]]
    
class ErrorReasonModel():
    code: str
    reason: str

class ErrorCode(str,Enum):
    REGISTER_USER_ALREADY_EXISTS = "Username is already registered"
    REGISTER_EMAIL_ALREADY_USED = "Email is already used"
    USER_NOT_FOUND = "Username is not found"
    PASSWORD_INCORRECT = "Password is incorrect"