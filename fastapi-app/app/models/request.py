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
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
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
    request_note = relationship("RequestNotes", back_populates="request")
    request_file = relationship("RequestFiles", back_populates="request")
    request_action = relationship("RequestActions", back_populates="request")


class RequestDatas(Base):
    __tablename__ = "request_datas"

    request_data_id = Column(
        Integer, Sequence("request_datas_request_data_id_seq"), primary_key=True
    )
    request_data_value = Column(postgresql.ARRAY(postgresql.JSON), default="[]")
    request_id = Column(
        postgresql.UUID(as_uuid=True), ForeignKey("requests.request_id")
    )
    user_uuid = Column(postgresql.UUID(as_uuid=True), ForeignKey("users.user_uuid"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    request = relationship("Requests", back_populates="request_data")
    user = relationship("Users", back_populates="request_data")


class RequestNotes(Base):
    __tablename__ = "request_notes"

    request_note_id = Column(
        Integer, Sequence("request_notes_request_note_id_seq"), primary_key=True
    )
    request_note = Column(String, nullable=False)
    request_id = Column(
        postgresql.UUID(as_uuid=True), ForeignKey("requests.request_id")
    )
    user_uuid = Column(postgresql.UUID(as_uuid=True), ForeignKey("users.user_uuid"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    request = relationship("Requests", back_populates="request_note")
    user = relationship("Users", back_populates="request_note")


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


class ActionTargets(Base):
    __tablename__ = "action_targets"

    action_target_id = Column(
        Integer, Sequence("action_targets_action_target_id_seq"), primary_key=True
    )
    action_id = Column(Integer, ForeignKey("actions.action_id"))
    target_id = Column(Integer, ForeignKey("targets.target_id"))
    section_code = Column(Integer, postgresql.ARRAY(Integer), default="[]")
    position_id = Column(Integer, postgresql.ARRAY(Integer), default="[]")

    action = relationship("Actions", back_populates="action_target")
    target = relationship("Targets", back_populates="action_target")


class ActivityTargets(Base):
    __tablename__ = "activity_targets"

    activity_target_id = Column(
        Integer, Sequence("activity_targets_activity_target_id_seq"), primary_key=True
    )
    activity_id = Column(Integer, ForeignKey("activities.activity_id"))
    target_id = Column(Integer, ForeignKey("targets.target_id"))
    section_code = Column(Integer, postgresql.ARRAY(Integer), default="[]")
    position_id = Column(Integer, postgresql.ARRAY(Integer), default="[]")

    activity = relationship("Activities", back_populates="activity_target")
    target = relationship("Targets", back_populates="activity_target")


class RequestActions(Base):
    __tablename__ = "request_actions"

    request_action_id = Column(
        Integer, Sequence("request_actions_request_action_id_seq"), primary_key=True
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    is_complete = Column(Boolean, default=False)
    request_id = Column(
        postgresql.UUID(as_uuid=True), ForeignKey("requests.request_id")
    )
    action_id = Column(Integer, ForeignKey("actions.action_id"))
    transition_id = Column(Integer, ForeignKey("transitions.transition_id"))

    request = relationship("Requests", back_populates="request_action")
    action = relationship("Actions", back_populates="request_action")
    transition = relationship("Transitions", back_populates="request_action")
    request_action_note = relationship(
        "RequestActionNotes", back_populates="request_action"
    )


class RequestActionNotes(Base):
    __tablename__ = "request_action_notes"

    request_action_note_id = Column(
        Integer,
        Sequence("request_action_notes_request_action_note_id_seq"),
        primary_key=True,
    )
    action_note = Column(String, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    request_action_id = Column(Integer, ForeignKey("request_actions.request_action_id"))
    user_uuid = Column(
        postgresql.UUID(as_uuid=True), ForeignKey("users.user_uuid"), nullable=False
    )

    request_action = relationship(
        "RequestActions", back_populates="request_action_note"
    )
    user = relationship("Users", back_populates="request_action_note")


# many-to-many table
class RequestConcerned(Base):
    __tablename__ = "request_concerned"

    id = Column(Integer, Sequence("request_concerned_id_seq"), primary_key=True)
    request_id = Column(
        postgresql.UUID(as_uuid=True), ForeignKey("requests.request_id")
    )
    user_uuid = Column(postgresql.UUID(as_uuid=True), ForeignKey("users.user_uuid"))
