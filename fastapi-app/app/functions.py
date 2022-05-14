from typing import Any


def toArray(input: Any) -> list:
    # input : result from AsyncSession.execute(stmt)
    rs = input.scalars().all()
    return rs


def toArrayWithKey(input: Any, table: Any) -> list:
    rs = input.scalars().all()
    rs = [
        dict((c, getattr(r, c)) for c in table.__table__.columns.keys()) for r in rs
    ]
    return rs
