from sqlalchemy import Column, String, Integer, Boolean

from app.database import Base


class Users(Base):
    __tablename__ = "users"

    id = Column(String, nullable=False)
    username = Column(String, primary_key=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    email = Column(String)
    line_id = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False)
