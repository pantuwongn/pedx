from typing import TypeVar
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Sequence, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects import postgresql
from sqlalchemy.sql import func

from app.database import Base


class Users(Base):
    __tablename__ = "users"

    user_uuid = Column(
        postgresql.UUID(as_uuid=True),
        primary_key=True,
    )
    user_id = Column(String, nullable=False, unique=True)
    user_pass = Column(String, nullable=False)
    firstname = Column(String)
    lastname = Column(String)
    email = Column(String, unique=True)
    app_line_id = Column(String)
    position_id = Column(Integer, ForeignKey("positions.position_id"))
    section_id = Column(Integer, ForeignKey("sections.section_id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True))
    is_active = Column(Boolean,default=False)

    role = relationship("Roles", back_populates="user")
    position = relationship("Positions", back_populates="user")
    section = relationship("Sections", back_populates="user")
    line = relationship("Lines",secondary="lines_users",back_populates="user")
    request_process = relationship(
        "RequestProcesses", secondary="process_admin", back_populates="user"
    )
    request = relationship("Requests", back_populates="user")
    request_data = relationship("RequestDatas", back_populates="user")
    request_file = relationship("RequestFiles", back_populates="user")
    request_concern = relationship(
        "Requests", secondary="request_concerned", back_populates="user_concern"
    )
    request_process = relationship("RequestProcesses", secondary="process_admin", back_populates="user")


class Roles(Base):
    __tablename__ = "roles"

    user_uuid = Column(
        postgresql.UUID(as_uuid=True), ForeignKey("users.user_uuid"), primary_key=True
    )
    is_admin = Column(Boolean, default=False)
    is_viewer = Column(Boolean, default=False)
    is_recorder = Column(Boolean, default=False)
    is_checker = Column(Boolean, default=False)
    is_approver = Column(Boolean, default=False)
    qar_recorder = Column(Boolean, default=False)
    qar_editor = Column(Boolean, default=False)

    user = relationship("Users", back_populates="role")


class Positions(Base):
    __tablename__ = "positions"

    position_id = Column(
        Integer, Sequence("positions_position_id_seq"), primary_key=True
    )
    position_level = Column(Integer, nullable=False)
    position_name = Column(String, nullable=False)
    position_full_name = Column(String, nullable=False)

    user = relationship("Users", back_populates="position")


U = TypeVar("U", bound=Users)
R = TypeVar("R", bound=Roles)
P = TypeVar("P", bound=Positions)
