from .database import ms_session, pg_async_session


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
