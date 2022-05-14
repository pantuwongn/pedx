from array import array
from typing import TypedDict


class exceptionResult(TypedDict):
    is_valid: bool
    code: int
    detail: list[str]
