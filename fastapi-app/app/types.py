from typing import Callable, TypeVar, TypedDict, Union, Coroutine


class exceptionResult(TypedDict):
    is_valid: bool
    code: int
    detail: list[str]

RETURN_TYPE = TypeVar("RETURN_TYPE")

DependencyCallable = Callable[
    ...,
    Union[
        RETURN_TYPE,
        Coroutine[None,None,RETURN_TYPE]
    ]
]