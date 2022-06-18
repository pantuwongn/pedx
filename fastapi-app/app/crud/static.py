from sqlalchemy.ext.asyncio import AsyncSession
import pandas as pd

from app.functions import toArrayWithKey, toDictByColumnId, toDictArrayByColumnId


class staticdataCRUD:
    def __init__(self):
        pass

    async def get_users(self, db: AsyncSession):
        stmt = "SELECT * FROM users"
        rs = toArrayWithKey(await db.execute(stmt),['user_pass'])
        rs = toDictByColumnId(rs, "user_uuid")
        return rs

    async def get_join_users_roles_positions(self, db: AsyncSession):
        stmt = """
        SELECT * FROM users
        JOIN roles USING (user_uuid)
        JOIN positions USING (position_id)
        """
        rs = toArrayWithKey(await db.execute(stmt),['user_pass'])
        rs = toDictByColumnId(rs, "user_uuid")
        return rs
    
    async def get_roles(self,db:AsyncSession):
        stmt = "SELECT * FROM roles"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs,'user_uuid')
        return rs
    
    async def get_positions(self, db: AsyncSession):
        stmt = "SELECT * FROM positions"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "position_id")
        return rs
    
    async def get_groups(self,db:AsyncSession):
        stmt = "SELECT * FROM groups"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs,"group_id")
        return rs
    
    async def get_group_members(self,db:AsyncSession):
        stmt = "SELECT * FROM group_members"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictArrayByColumnId(rs, "group_id")
        return rs

    async def get_departments(self, db: AsyncSession):
        stmt = "SELECT * FROM departments"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "department_id")
        return rs

    async def get_sections(self, db: AsyncSession):
        stmt = "SELECT * FROM sections"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "section_id")
        return rs

    async def get_lines(self, db: AsyncSession):
        stmt = "SELECT * FROM lines"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "line_id")
        return rs

    async def get_machines(self, db: AsyncSession):
        stmt = "SELECT * FROM machines"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictArrayByColumnId(rs, "machine_no")
        return rs

    async def get_processes(self, db: AsyncSession):
        stmt = "SELECT * FROM processes"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "process_id")
        return rs

    async def get_process_types(self, db: AsyncSession):
        stmt = "SELECT * FROM process_types"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "process_type_id")
        return rs

    async def get_join_processes_types(self, db: AsyncSession):
        stmt = """SELECT * FROM processes
        LEFT JOIN process_types
        USING (process_type_id)
        """
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "process_id")
        return rs

    async def get_processes_symbols(self, db: AsyncSession):
        stmt = "SELECT * FROM processes_symbols"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictArrayByColumnId(rs, "process_id")
        return rs

    async def get_sc_symbols(self, db: AsyncSession):
        stmt = "SELECT * FROM sc_symbols"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "sc_symbol_id")
        return rs

    async def get_customers(self, db: AsyncSession):
        stmt = "SELECT * FROM customers"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "customer_id")
        return rs

    async def get_customer_plants(self, db: AsyncSession):
        stmt = "SELECT * FROM customer_plants"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "customer_plant_id")
        return rs

    async def get_join_customers_plants(self, db: AsyncSession):
        stmt = """SELECT * FROM customers
        LEFT JOIN customer_plants
        USING (customer_id)
        """
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "customer_id")
        return rs

    async def get_products(self, db: AsyncSession):
        stmt = "SELECT * FROM products"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "product_id")
        return rs

    async def get_models(self, db: AsyncSession):
        stmt = "SELECT * FROM models"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "model_id")
        return rs

    async def get_models_customers(self, db: AsyncSession):
        stmt = "SELECT * FROM models_customers"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "id")
        return rs

    async def get_parts(self, db: AsyncSession):
        stmt = "SELECT * FROM parts"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "part_no")
        return rs

    async def get_join_parts_products(self, db: AsyncSession):
        stmt = """SELECT * FROM parts
        LEFT JOIN products
        USING (product_id)
        """
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "part_no")
        return rs

    async def get_sub_parts(self, db: AsyncSession):
        stmt = "SELECT * FROM sub_parts"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "id")
        return rs

    async def get_lines_parts(self, db: AsyncSession):
        stmt = "SELECT * FROM lines_parts"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "id")
        return rs

    async def get_lines_users(self, db: AsyncSession):
        stmt = "SELECT * FROM lines_users"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictArrayByColumnId(rs, "line_id")
        return rs

    async def get_models_parts(self, db: AsyncSession):
        stmt = "SELECT * FROM models_parts"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "id")
        return rs

    async def get_request_processes(self, db: AsyncSession):
        stmt = "SELECT * FROM request_processes"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "request_process_id")
        return rs

    async def get_states(self, process_id: list[int], db: AsyncSession):
        stmt = f"SELECT * FROM states WHERE request_process_id IN {tuple(process_id)}"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "state_id")
        return rs

    async def get_state_types(self, db: AsyncSession):
        stmt = "SELECT * FROM state_types"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "state_type_id")
        return rs

    async def get_join_states_types(self, process_id: list[int], db: AsyncSession):
        stmt = f"""SELECT * FROM states
        JOIN state_types
        USING (state_type_id)
        WHERE request_process_id IN {tuple(process_id)}
        """
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "state_id")
        return rs

    async def get_transitions(self, process_id: list[int], db: AsyncSession):
        stmt = (
            f"SELECT * FROM transitions WHERE request_process_id IN {tuple(process_id)}"
        )
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "transition_id")
        return rs

    async def get_process_admin(self, db: AsyncSession):
        stmt = "SELECT * FROM process_admin"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "id")
        return rs

    async def get_actions(self, process_id: list[int], db: AsyncSession):
        stmt = f"SELECT * FROM actions WHERE request_process_id IN {tuple(process_id)}"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "action_id")
        return rs

    async def get_action_types(self, db: AsyncSession):
        stmt = f"SELECT * FROM action_types"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "action_type_id")
        return rs

    async def get_join_actions_types(self, process_id: list[int], db: AsyncSession):
        stmt = f"""SELECT * FROM actions
        JOIN action_types
        USING (action_type_id)
        WHERE request_process_id IN {tuple(process_id)}
        """
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "action_id")
        return rs

    async def get_transitions_actions(self, db: AsyncSession):
        stmt = "SELECT * FROM transitions_actions"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "transition_id")
        return rs
    
    async def get_join_transitions_transition_actions(self,process_id:list[int],db: AsyncSession):
        stmt = f"""
            SELECT * FROM transitions
            JOIN transitions_actions USING (transition_id)
            WHERE request_process_id IN {tuple(process_id)}
        """
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "transition_id")
        return rs

    async def get_activity_types(self, db: AsyncSession):
        stmt = "SELECT * FROM activity_types"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "activity_type_id")
        return rs

    async def get_activities(self, process_id: list[int], db: AsyncSession):
        stmt = (
            f"SELECT * FROM activities WHERE request_process_id IN {tuple(process_id)}"
        )
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "activity_id")
        return rs

    async def get_states_activities(self, db: AsyncSession):
        stmt = "SELECT * FROM states_activities"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "id")
        return rs

    async def get_transitions_activities(self, db: AsyncSession):
        stmt = "SELECT * FROM transitions_activities"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "id")
        return rs

    async def get_targets(self, db: AsyncSession):
        stmt = "SELECT * FROM targets"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "target_id")
        return rs

    async def get_action_targets(self, db: AsyncSession):
        stmt = "SELECT * FROM action_targets"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "action_target_id")
        return rs

    async def get_activity_targets(self, db: AsyncSession):
        stmt = "SELECT * FROM activity_targets"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "activity_target_id")
        return rs

    async def get_list_items(self, request_process_id: list[int], db: AsyncSession):
        stmt = f"SELECT * FROM list_items WHERE request_process_id IN '{tuple(request_process_id)}'"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictArrayByColumnId(rs, "category")
        return rs

    async def get_item_details(self, db: AsyncSession):
        stmt = "SELECT * FROM item_details"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictArrayByColumnId(rs, "list_item_id")
        return rs

    async def get_processes_machines(self, db: AsyncSession):
        stmt = "SELECT * FROM processes_machines"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "id")
        return rs

    async def get_parts_machines(self, db: AsyncSession):
        stmt = "SELECT * FROM parts_machines"
        rs = toArrayWithKey(await db.execute(stmt))
        rs = toDictByColumnId(rs, "id")
        return rs
