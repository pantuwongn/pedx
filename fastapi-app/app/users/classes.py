import uuid
from typing import Optional, Tuple
from passlib import pwd
from passlib.context import CryptContext

from app import exceptions

class User:
    def __init__(self) -> None:
        self.id = ""
        self.username = ""
        self.hashed_password = ""
        self.email = ""
        self.line_id = ""
        self.is_admin = False
    
    def __getitem__(self,key):
        return getattr(self,key)

    def __setitem__(self,key,value):
        return setattr(self,key,value)

class UserManager:
    def __init__(self) -> None:
        self.a = "a"
        # TODO create user manager 
        # authenticate

class UserHelper:
    def __init__(self, context: Optional[CryptContext] = None) -> None:
        if context is None:
            self.context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)
        else:
            self.context = context

    def generate_uuid(self,email: str) -> str:
        return str(uuid.uuid3(uuid.NAMESPACE_DNS, email))

    def hash_password(self, password: str) -> str:
        return self.context.hash(password)

    def verify_password(self, password: str, hashed_password: str) -> None:
        verified,_ = self.context.verify_and_update(password, hashed_password)
        if not verified:
            raise exceptions.PasswordIncorrect()

    def generate_password(self) -> str:
        return pwd.genword(length=10, charset="ascii_50")
