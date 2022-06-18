from pydantic import BaseModel, Json
from typing import Optional, List, Dict


class RequestBase(BaseModel):
    pass


class RequestCreateSubmit(RequestBase):
    request_process_name: str
    data_value: Dict[str,str|int|list]
    user_uuid: str
    line_id: int
    request_process_id: int
    current_state_id: int
