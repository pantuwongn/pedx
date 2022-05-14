from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

# from ..models import 


async def get_listen_channel(db: AsyncSession, username: str):
    rs = await db.execute(
        text(f"""SELECT listen_channel FROM listener_list WHERE "user" = '{username}'""")
    )
    data = [r for r in rs]
    return data
