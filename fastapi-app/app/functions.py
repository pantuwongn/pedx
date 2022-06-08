from typing import Any, List
import asyncpg.pgproto.pgproto as pgproto


def toArray(input: Any) -> list:
    # input : result from AsyncSession.execute(stmt)
    rs = input.scalars().all()
    return rs


def toArrayWithKey(
    input: Any,
    table: List[Any] | Any = [],
    except_column: list[str] = [],
    raw: bool = False,
) -> list:
    # query with raw statement
    if raw:
        rs = [
            {
                c: str(getattr(r, c))
                if isinstance(getattr(r, c), pgproto.UUID)
                else getattr(r, c)
                for c in r.keys()
                if c not in except_column
            }
            for r in input
        ]
        return rs

    # query with select
    rs = input.scalars().all()
    if isinstance(table, list):
        columns = [c for t in table for c in t.__table__.columns.keys()]
    else:
        columns = table.__table__.columns.keys()
    rs = [
        dict(
            (c, str(getattr(r, c)))
            if isinstance(getattr(r, c), pgproto.UUID)
            else (c, getattr(r, c))
            for c in columns
            if c not in except_column
        )
        for r in rs
    ]
    return rs
