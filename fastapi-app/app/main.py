import asyncpg
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import mssql, email, dblistener
from .database import pg_async_engine, Base
from .socketio import SocketManager, createSocket
from .dblistener import TestListen, models

# setup database
# isv.models.Base.metadata.create_all(bind=pg_engine)
async def async_pg_db():
    async with pg_async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


asyncio.gather(async_pg_db())

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(mssql.main.router)
app.include_router(email.main.router)
app.include_router(dblistener.main.router)

# socket io
sio = SocketManager(app=app)
createSocket(sio=sio)

listener = TestListen(sio)
