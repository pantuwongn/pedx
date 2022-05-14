from sqlalchemy import Column, String, Integer
from sqlalchemy.dialects import postgresql

from app.database import Base

class Listener_list(Base):
    __tablename__ = "listener_list"

    id = Column(Integer, primary_key=True, index=True)
    user = Column(String, nullable=False, unique=True)
    listen_channel = Column(
        postgresql.ARRAY(String, dimensions=1), nullable=False, default="[]"
    )