from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, DateTime, Sequence
from sqlalchemy.dialects import postgresql

from ..database import Base


class Operation_record(Base):
    __tablename__ = "listener_list"

    id = Column(Integer, primary_key=True, index=True)
    user = Column(String, nullable=False, unique=True)
    listen_channel = Column(
        postgresql.ARRAY(String, dimensions=1), nullable=False, default="[]"
    )
