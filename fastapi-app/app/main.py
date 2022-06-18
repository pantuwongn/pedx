import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# need import models for auto create
from app import mssql, email, dblistener
from app.routers import users_routers,request_routers,static_routers
from app.database import pg_async_engine, Base
from app.socketio import SocketManager, createSocket
from app.dblistener import TestListen
from app.dependencies import get_pg_async_db

# setup database
# isv.models.Base.metadata.create_all(bind=pg_engine)
# async def async_pg_db():
#     async with pg_async_engine.begin() as conn:
#         await conn.run_sync(Base.metadata.create_all)
# asyncio.gather(async_pg_db())

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(static_routers(get_pg_async_db), prefix="/static")
app.include_router(users_routers(get_pg_async_db), prefix="/users")
app.include_router(request_routers(get_pg_async_db), prefix="/request")
app.include_router(mssql.main.router)
app.include_router(email.main.router)
app.include_router(dblistener.main.router)

# socket io
sio = SocketManager(app=app)
createSocket(sio=sio)

listener = TestListen(sio)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
