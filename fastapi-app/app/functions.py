from typing import Any, List
import asyncpg.pgproto.pgproto as pgproto
from datetime import datetime, tzinfo
import pytz


def toArray(input: Any) -> list:
    # input : result from AsyncSession.execute(stmt)
    rs = input.scalars().all()
    return rs


def toArrayWithKey(input: Any, except_column: list[str] = []) -> list:
    tz = pytz.timezone("Asia/Bangkok")
    # query with raw statement
    rs = [
        {
            c: str(getattr(r, c))
            if isinstance(getattr(r, c), pgproto.UUID)
            else getattr(r, c)
            .replace(tzinfo=pytz.utc)
            .astimezone(tz)
            .strftime("%Y-%m-%d %H:%M:%S.%f")
            if isinstance(getattr(r, c), datetime)
            else getattr(r, c)
            for c in r.keys()
            if c not in except_column
        }
        for r in input
    ]
    return rs


def toDictByColumnId(input: list, id_column: str) -> dict:
    output = {}
    for e in input:  # each element in input list
        if id_column not in e:
            return
        e_output = {}
        for k, v in e.items():  # each key, value in element.items()
            if k != id_column:
                e_output = {**e_output, k: v}
        output = {**output, e[id_column]: e_output}
    return output


def toDictArrayByColumnId(input: list, id_column: str) -> dict:
    output = {}
    for e in input:
        if id_column not in e:
            return
        e_output = {}
        for k, v in e.items():
            if k != id_column:
                e_output = {**e_output, k: v}
        if e[id_column] in output:
            output = {**output, e[id_column]: [*output[e[id_column]], e_output]}
        else:
            output = {**output, e[id_column]: [e_output]}
    return output
