from sqlalchemy.ext.asyncio import AsyncSession
import uuid
import json

from app.schemas.request import RequestCreateSubmit
from app.functions import toArrayWithKey, toDictByColumnId, toDictArrayByColumnId
from app.crud.statements import request as st


class RequestCRUD:
    def __init__(self):
        pass

    async def post_submit_request(
        self, submit_data: RequestCreateSubmit, db: AsyncSession
    ) -> dict:
        request_id = uuid.uuid4()
        stmt = st.post_submit_request_stmt(request_id, submit_data)
        rs = toArrayWithKey(await db.execute(stmt))
        await db.commit()
        return {"request_no": rs[0]['request_no']}

    async def get_all_requests_by_type(
        self, process_id: list[int], process_name: str, db: AsyncSession
    ) -> dict:

        stmt = st.get_all_requests_stmt(process_id, process_name)
        rs = toArrayWithKey(await db.execute(stmt))
        rs = rearrangeRequestActionData(rs, "request_no")
        return rs

    async def get_request(self, id: str, db: AsyncSession) -> dict:
        stmt = st.get_request_stmt(id)
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "request_id")
        return rs

    async def get_requests_by_type(
        self, process_id: list[int], skip: int, limit: int, db: AsyncSession
    ) -> dict:
        stmt = st.get_requests_by_type_stmt(process_id, skip, limit)
        rs = toArrayWithKey(await db.execute(stmt))
        rs = rearrangeRequestActionData(rs, "request_id")
        return rs

    async def get_count_all_requests(self, db: AsyncSession) -> int:
        stmt = "SELECT COUNT(*) c FROM requests"
        rs = toArrayWithKey(await db.execute(stmt))
        return rs


def rearrangeRequestActionData(input: list, id_column: str):
    actionColumns = [
        "request_action_id",
        "action_created_at",
        "action_updated_at",
        "is_active",
        "is_complete",
        "action_id",
        "transition_id",
    ]
    fileColumns = [
        "request_file_id",
        "request_file_name",
        "request_file_content",
        "MIME_type",
        "file_user_uuid",
    ]
    concernedColumns = ["concerned_user_uuid", "group_id"]
    output = {}
    for e in input:
        if id_column not in e:
            return
        e_output = {}
        action_data = {}
        file_data = {}
        concerned_data = {}
        for k, v in e.items():
            if k != id_column:
                if k in actionColumns:
                    if v is not None:
                        action_data = {**action_data, k: v}
                if k in fileColumns:
                    if v is not None:
                        file_data = {**file_data, k: v}
                if k in concernedColumns:
                    if v is not None:
                        concerned_data = {**concerned_data, k: v}
                else:
                    e_output = {**e_output, k: v}

        if e[id_column] in output:
            output = {
                **output,
                e[id_column]: {
                    **output[e[id_column]],
                    "actions": [*output[e[id_column]]["actions"], action_data]
                    if action_data != {}
                    else output[e[id_column]]["actions"],
                    "files": [*output[e[id_column]]["files"], file_data]
                    if file_data != {}
                    else output[e[id_column]]["files"],
                    "concerneds": [*output[e[id_column]]["concerneds"], concerned_data]
                    if concerned_data != {}
                    else output[e[id_column]]["concerneds"],
                },
            }
        else:
            action_data_final = []
            file_data_final = []
            concerned_data_final = []

            if action_data != {}:
                action_data_final = [action_data]
            if file_data != {}:
                file_data_final = [file_data]
            if concerned_data != {}:
                concerned_data_final = [concerned_data]

            output = {
                **output,
                e[id_column]: {
                    **e_output,
                    "actions": action_data_final,
                    "files": file_data_final,
                    "concerneds": concerned_data_final,
                },
            }
    return output
