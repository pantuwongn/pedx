from typing import AsyncGenerator
from .database import ms_session, pg_async_session
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

def get_ms_db():
    db = ms_session()
    try:
        yield db
    finally:
        db.close()


async def get_pg_async_db():
    db = pg_async_session()
    try:
        yield db
    finally:
        await db.close()

async def get_async_session() -> AsyncGenerator[AsyncSession,None]:
    async with pg_async_session() as session:
        yield session

async def get_db(session: AsyncSession = Depends(get_async_session)):
    yield session