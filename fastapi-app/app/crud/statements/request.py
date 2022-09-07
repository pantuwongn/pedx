import json
from uuid import UUID

from app.schemas.request import RequestCreateSubmit

def post_submit_request_stmt(request_id:UUID,submit_data: RequestCreateSubmit) -> str:
    return f"""
        WITH insert_request AS (
            INSERT INTO requests(
                request_id,
                is_locked, 
                request_process_id, 
                line_id, user_uuid, 
                current_state_id
            ) VALUES (
                '{request_id}',
                false,
                '{submit_data.request_process_id}',
                '{submit_data.line_id}',
                '{submit_data.user_uuid}',
                '{submit_data.current_state_id}'
            )
        ), insert_request_data AS (
            INSERT INTO request_datas(
                request_data_value,
                request_id,
                user_uuid
            ) VALUES (
                '{json.dumps(submit_data.data_value)}',
                '{request_id}',
                '{submit_data.user_uuid}'
            )
        )
        
        INSERT INTO "request_no_{submit_data.request_process_name}"(request_id) VALUES (
            '{request_id}'
        ) RETURNING request_no
        """
# TODO check statement of get_all_requests_stmt
def get_all_requests_stmt(process_id: list[int],process_name:str) -> str:

    return f"""
        SELECT *,
            f.user_uuid as file_user_uuid,
            c.user_uuid as concerned_user_uuid
            FROM (
                SELECT *,
                    a.created_at as action_created_at,
                    a.updated_at as action_updated_at
                FROM (
                    SELECT *,
                    to_char(r.created_at, 'DD-Mon-YYYY') as req_created_at,
                    to_char(r.updated_at, 'DD-Mon-YYYY') as req_updated_at,
                    r.user_uuid as req_user_uuid,
                    to_char(d.created_at, 'DD-Mon-YYYY') as data_created_at,
                    to_char(d.updated_at, 'DD-Mon-YYYY') as data_updated_at
                    FROM requests r
                    JOIN request_datas d USING (request_id)
                    WHERE request_process_id IN (1,2)
                ) t 
                LEFT JOIN request_actions a USING (request_id)
            ) s
            LEFT JOIN request_files f USING (request_id)
            LEFT JOIN request_concerned c USING (request_id)
            LEFT JOIN "request_no_5M1E" n USING (request_id)
			LEFT JOIN actions_groups g USING (action_id)
--             LEFT JOIN groups g USING (group_id)
        """
        

def get_request_stmt(id:str) -> str:
    return f"""
        SELECT t.request_id,
            t.req_created_at,
            t.req_updated_at,
            t.is_locked,
            t.request_process_id,
            t.line_id,
            t.user_uuid,
            t.current_state_id,
            t.request_data_id,
            t.data_created_at,
            t.data_updated_at,
            t.request_data_value,
            a.request_action_id,
			a.created_at as action_created_at,
			a.updated_at as action_updated_at,
			a.is_active,
			a.is_complete,
			a.action_id,
			a.transition_id
        FROM (
            SELECT r.request_id,
            r.created_at as req_created_at,
            r.updated_at as req_updated_at,
            r.is_locked,
            r.request_process_id,
            r.line_id,
            r.user_uuid,
            r.current_state_id,
            d.request_data_id,
            d.created_at as data_created_at,
            d.updated_at as data_updated_at,
            d.request_data_value
            FROM requests r
            JOIN request_datas d USING (request_id)
            WHERE r.request_id = {id}
        ) t 
        LEFT JOIN request_actions a USING (request_id)
        """

def get_requests_by_type_stmt(process_id: list[int], skip: int, limit: int) -> str:
    return f"""
        SELECT t.request_id,
            t.req_created_at,
            t.req_updated_at,
            t.is_locked,
            t.request_process_id,
            t.line_id,
            t.user_uuid,
            t.current_state_id,
            t.request_data_id,
            t.data_created_at,
            t.data_updated_at,
            t.request_data_value,
            a.request_action_id,
            a.created_at as action_created_at,
            a.updated_at as action_updated_at,
            a.is_active,
            a.is_complete,
            a.action_id,
            a.transition_id
        FROM (
            SELECT r.request_id,
            r.created_at as req_created_at,
            r.updated_at as req_updated_at,
            r.is_locked,
            r.request_process_id,
            r.line_id,
            r.user_uuid,
            r.current_state_id,
            d.request_data_id,
            d.created_at as data_created_at,
            d.updated_at as data_updated_at,
            d.request_data_value
            FROM requests r
            JOIN request_datas d USING (request_id)
            WHERE request_process_id IN {tuple(process_id)}
            OFFSET {skip} LIMIT {limit}
        ) t 
        LEFT JOIN request_actions a USING (request_id)
        """
