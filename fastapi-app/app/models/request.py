from sqlalchemy import (
    ARRAY,
    Column,
    String,
    Integer,
    Boolean,
    DateTime,
    Sequence,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects import postgresql
from sqlalchemy.sql import func

from app.database import Base


class Requests(Base):
    __tablename__ = "requests"

    request_id = Column(
        postgresql.UUID(as_uuid=True),
        primary_key=True,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True))
    is_locked = Column(Boolean, default=False)
    request_process_id = Column(
        Integer, ForeignKey("request_processes.request_process_id")
    )
    line_id = Column(Integer, ForeignKey("lines.line_id"))
    user_uuid = Column(postgresql.UUID(as_uuid=True), ForeignKey("users.user_uuid"))
    current_state_id = Column(Integer, ForeignKey("states.state_id"))

    request_process = relationship("RequestProcesses", back_populates="request")
    line = relationship("Lines", back_populates="request")
    user = relationship("Users", back_populates="request")
    user_concern = relationship(
        "Users", secondary="request_concerned", back_populates="request_concern"
    )
    state = relationship("States", back_populates="request")
    request_data = relationship("RequestDatas", back_populates="request")
    request_file = relationship("RequestFiles", back_populates="request")
    request_action = relationship("RequestActions", back_populates="request")
    request_no_5M1E = relationship("RequestNo5M1E",back_populates="request")


class RequestDatas(Base):
    __tablename__ = "request_datas"

    request_data_id = Column(
        Integer, Sequence("request_datas_request_data_id_seq"), primary_key=True
    )
    request_data_value = Column(postgresql.JSON, nullable=False)
    request_id = Column(
        postgresql.UUID(as_uuid=True), ForeignKey("requests.request_id")
    )
    user_uuid = Column(postgresql.UUID(as_uuid=True), ForeignKey("users.user_uuid"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True))

    request = relationship("Requests", back_populates="request_data")
    user = relationship("Users", back_populates="request_data")


class RequestFiles(Base):
    __tablename__ = "request_files"

    request_file_id = Column(
        Integer, Sequence("request_files_request_file_id_seq"), primary_key=True
    )
    request_file_name = Column(String, nullable=False)
    request_file_content = Column(postgresql.BYTEA, nullable=False)
    MIME_type = Column(String, nullable=False)
    request_id = Column(
        postgresql.UUID(as_uuid=True), ForeignKey("requests.request_id")
    )
    user_uuid = Column(postgresql.UUID(as_uuid=True), ForeignKey("users.user_uuid"))

    request = relationship("Requests", back_populates="request_file")
    user = relationship("Users", back_populates="request_file")


class RequestActions(Base):
    __tablename__ = "request_actions"

    request_action_id = Column(
        Integer, Sequence("request_actions_request_action_id_seq"), primary_key=True
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)
    is_complete = Column(Boolean, default=False)
    request_id = Column(
        postgresql.UUID(as_uuid=True), ForeignKey("requests.request_id")
    )
    user_uuid = Column(postgresql.UUID(as_uuid=True), ForeignKey("users.user_uuid"))
    note = Column(String, default="")
    action_id = Column(Integer, ForeignKey("actions.action_id"))
    transition_id = Column(Integer, ForeignKey("transitions.transition_id"))

    request = relationship("Requests", back_populates="request_action")
    action = relationship("Actions", back_populates="request_action")
    transition = relationship("Transitions", back_populates="request_action")


class RequestNo5M1E(Base):
    __tablename__ = "request_no_5M1E"

    id = Column(Integer, Sequence("request_no_5m1e_id_seq"), primary_key=True)
    request_id = Column(
        postgresql.UUID(as_uuid=True), ForeignKey("requests.request_id")
    )
    request_no = Column(String, nullable=True, unique=True)
    
    request = relationship("Request",back_populates="request_no_5M1E")


# many-to-many table
class RequestConcerned(Base):
    __tablename__ = "request_concerned"

    id = Column(Integer, Sequence("request_concerned_id_seq"), primary_key=True)
    request_id = Column(
        postgresql.UUID(as_uuid=True), ForeignKey("requests.request_id")
    )
    user_uuid = Column(postgresql.UUID(as_uuid=True), ForeignKey("users.user_uuid"),nullable=True)
    # group_id = Column(Integer,ForeignKey("groups.group_id"))


class MainSubRequest(Base):
    __tablename__ = "main_sub_requests"

    id = Column(Integer, Sequence("main_sub_requests_id_seq"), primary_key=True)
    main_request_id = Column(
        postgresql.UUID(as_uuid=True), ForeignKey("requests.request_id")
    )
    sub_request_id = Column(
        postgresql.UUID(as_uuid=True), ForeignKey("requests.request_id")
    )
