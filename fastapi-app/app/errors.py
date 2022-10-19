from enum import Enum
from typing import Union, Dict

class ErrorModel():
    detail: Union[str,Dict[str,str]]
    
class ErrorReasonModel():
    code: str
    reason: str

class ErrorCode(str,Enum):
    REGISTER_USER_ALREADY_EXISTS = "User is already registered"
    REGISTER_EMAIL_ALREADY_USED = "Email is already used"
    REGISTER_EMAIL_INVALID = "Email format is invalid"
    USER_NOT_FOUND = "User is not found"
    USER_NOT_VERIFIED = "User is not verfied"
    USER_INACTIVE = "User is not active"
    EMAIL_NOT_FOUND = "Email is not found"
    PASSWORD_INCORRECT = "Password is incorrect"
    INVALID_AUTHENTICATION_SCHEME = "Invalid authentication scheme"
    INVALID_TOKEN = "Invalid token or expired token"
    INVALID_AUTHORIZATION_TOKEN = "Invalid authorization code"
    INVALID_TOKEN_ERROR = "Invalid token authentication error"
    INVALID_JWE_DECODE = "Invalid token type"