from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import asyncio
import asyncpg
import json

from . import crud
from ..socketio import SocketManager
from ..dependencies import get_pg_async_db

listener_ch = ["update", "update_table"]

router = APIRouter(prefix="/dblistener")


@router.get("/{username}")
async def get_listen_channel(
    db: AsyncSession = Depends(get_pg_async_db), username: str = ""
):
    return await crud.get_listen_channel(db, username)


class TestListen:
    sio_ = None

    def __init__(self, sio: SocketManager):
        self._sio = sio
        self.q = asyncio.Queue()
        self.loop = asyncio.get_event_loop()
        asyncio.ensure_future(self.db_events(), loop=self.loop)

    # @asyncio.coroutine
    async def listen(self, conn, channel):
        async def listener1(conn, pid, channel, payload):
            print(channel, payload)
            await self.q.put(conn)

        await conn.add_listener("test", listener1)
        for ch in listener_ch:
            await conn.add_listener(ch, self.listen_handler)
        # await conn.add_listener("update", self.listen_handler)
        # await conn.add_listener("update_table", self.listen_handler)
        await conn.execute("NOTIFY test,'open notify test'")

    async def db_events(self):
        conn = await asyncpg.connect(
            dsn="postgresql://postgres:postgres@localhost:5432/testdb"
        )
        print("connected", conn)
        await self.listen(conn, "test")

    async def listen_handler(self, conn, pid, channel, payload):
        print(channel, payload)
        data = json.loads(payload)
        print(data)
        ns = "/" + "/".join(list(data.values())[:4])
        print(ns)
        await self.q.put(conn)
        await self._sio.emit(channel, payload, namespace=ns)
