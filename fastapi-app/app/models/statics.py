from email.policy import default
from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    DateTime,
    Sequence,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects import postgresql
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import ARRAY


from app.database import Base


class Groups(Base):
    __tablename__ = "groups"

    group_id = Column(Integer, Sequence("groups_group_id_seq"), primary_key=True)
    group_name = Column(String, nullable=False, unique=True)

    member = relationship("GroupMembers", back_populates="group")
    action = relationship("Actions", secondary="actions_groups", back_populates="group")
    activity = relationship(
        "Activities", secondary="activities_groups", back_populates="group"
    )


class GroupMembers(Base):
    __tablename__ = "group_members"

    id = Column(Integer, Sequence("group_members_id_seq"), primary_key=True)
    group_id = Column(Integer, ForeignKey("groups.group_id"))
    user_uuid = Column(postgresql.UUID(as_uuid=True), ForeignKey("users.user_uuid"))

    group = relationship("Groups", back_populates="member")


class Departments(Base):
    __tablename__ = "departments"

    department_id = Column(
        Integer, Sequence("departments_dartpartment_id_seq"), primary_key=True
    )
    department_name = Column(String, nullable=False, unique=True)

    section = relationship("Sections", back_populates="department")


class Sections(Base):
    __tablename__ = "sections"

    section_id = Column(Integer, Sequence("sections_section_id_seq"), primary_key=True)
    section_code = Column(Integer, nullable=False)
    section_name = Column(String, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.department_id"))

    department = relationship("Departments", back_populates="section")
    user = relationship("Users", back_populates="section")
    line = relationship("Lines", back_populates="section")


class Lines(Base):
    __tablename__ = "lines"

    line_id = Column(Integer, Sequence("lines_line_id_seq"), primary_key=True)
    line_name = Column(String, nullable=False)
    work_center_code = Column(String, nullable=False)
    section_id = Column(Integer, ForeignKey("sections.section_id"))
    breaker_list = Column(ARRAY(Integer))
    valve_list = Column(ARRAY(Integer))

    user = relationship("Users", secondary="lines_users", back_populates="line")
    section = relationship("Sections", back_populates="line")
    part = relationship("Parts", secondary="lines_parts", back_populates="line")
    request = relationship("Requests", back_populates="line")
    product = relationship(
        "Products", secondary="products_lines", back_populates="line"
    )
    database = relationship("LinesDatabases", back_populates="line")


class Machines(Base):
    __tablename__ = "machines"

    machine_no = Column(String, Sequence("machines_machine_id_seq"), primary_key=True)
    machine_name = Column(String, nullable=False)
    machine_type = Column(String, nullable=False)
    machine_maker = Column(String, nullable=False)
    machine_model = Column(String, default="")

    process = relationship(
        "Processes", secondary="processes_machines", back_populates="machine"
    )
    part = relationship("Parts", secondary="parts_machines", back_populates="machine")
    breaker = relationship(
        "BreakerUnits", secondary="machines_breakers", back_populates="machine"
    )
    valve = relationship(
        "ValveUnits", secondary="machines_valves", back_populates="machine"
    )


class ProcessTypes(Base):
    __tablename__ = "process_types"

    process_type_id = Column(
        Integer, Sequence("process_types_process_type_id_seq"), primary_key=True
    )
    process_type_name = Column(String, nullable=False)

    process = relationship("Processes", back_populates="process_type")


class Processes(Base):
    __tablename__ = "processes"

    process_id = Column(Integer, Sequence("processes_process_id"), primary_key=True)
    process_name = Column(String, nullable=False)
    process_type_id = Column(Integer, ForeignKey("process_types.process_type_id"))
    line_id = Column(Integer, ForeignKey("lines.line_id"))

    machine = relationship(
        "Machines", secondary="processes_machines", back_populates="process"
    )
    symbol = relationship(
        "SCSymbols", secondary="processes_symbols", back_populates="process"
    )
    process_type = relationship("ProcessTypes", back_populates="process")


class SCSymbols(Base):
    __tablename__ = "sc_symbols"

    sc_symbol_id = Column(
        Integer, Sequence("sc_symbols_sc_symbol_id_seq"), primary_key=True
    )
    character = Column(String(10), nullable=False)
    shape = Column(
        postgresql.ENUM(
            "circle", "diamond", "triangle", "none", name="sc_symbols_shape_enum"
        ),
        nullable=False,
    )
    remark = Column(String, server_default="")

    process = relationship(
        "Processes", secondary="processes_symbols", back_populates="symbol"
    )


class Products(Base):
    __tablename__ = "products"

    product_id = Column(Integer, Sequence("products_product_id_seq"), primary_key=True)
    full_name = Column(String, nullable=False)
    short_name = Column(String, nullable=False)

    part = relationship("Parts", back_populates="product")
    line = relationship("Lines", secondary="products_lines", back_populates="product")


class Models(Base):
    __tablename__ = "models"

    model_id = Column(Integer, Sequence("model_model_id_seq"), primary_key=True)
    model_code = Column(String, nullable=False)
    model_name = Column(String, default="")
    # customer_id = Column(Integer, ForeignKey("customers.customer_id"))

    part = relationship("Parts", secondary="models_parts", back_populates="model")
    customer = relationship(
        "Customers", secondary="models_customers", back_populates="model"
    )


class Customers(Base):
    __tablename__ = "customers"

    customer_id = Column(
        Integer, Sequence("customers_customer_id_seq"), primary_key=True
    )
    customer_name = Column(String, nullable=False, unique=True)
    customer_short_name = Column(String, default="")

    model = relationship(
        "Models", secondary="models_customers", back_populates="customer"
    )
    customer_plant = relationship("CustomerPlants", back_populates="customer")


class CustomerPlants(Base):
    __tablename__ = "customer_plants"

    customer_plant_id = Column(
        Integer, Sequence("customer_plants_customer_plant_id"), primary_key=True
    )
    customer_plant_name = Column(String, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.customer_id"))

    customer = relationship("Customers", back_populates="customer_plant")


class Parts(Base):
    __tablename__ = "parts"

    part_no = Column(String, primary_key=True)
    part_name = Column(String, nullable=False)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True))

    product = relationship("Products", back_populates="part")
    line = relationship("Lines", secondary="lines_parts", back_populates="part")
    machine = relationship(
        "Machines", secondary="parts_machines", back_populates="part"
    )
    model = relationship("Models", secondary="models_parts", back_populates="part")
    main_part_no = relationship("SubParts", back_populates="part_no_main")
    sub_part_no = relationship("SubParts", back_populates="part_no_sub")


class SubParts(Base):
    __tablename__ = "sub_parts"

    id = Column(Integer, Sequence("sub_parts_id_seq"), primary_key=True)
    main_part_no = Column(String, ForeignKey("parts.part_no"), nullable=False)
    sub_part_no = Column(String, ForeignKey("parts.part_no"), nullable=False)

    part_no_main = relationship("Parts", back_populates="main_part_no")
    part_no_sub = relationship("Parts", back_populates="sub_part_no")


class RequestProcesses(Base):
    __tablename__ = "request_processes"

    request_process_id = Column(
        Integer, Sequence("request_processes_request_process_id_seq"), primary_key=True
    )
    request_process_name = Column(String, nullable=False, unique=True)
    request_process_short_name = Column(String, nullable=False)
    request_process_tag_name = Column(String, nullable=False, default="")

    user = relationship(
        "Users", secondary="process_admin", back_populates="request_process"
    )
    state = relationship("States", back_populates="request_process")
    transition = relationship("Transitions", back_populates="request_process")
    action = relationship("Actions", back_populates="request_process")
    activity = relationship("Activities", back_populates="request_process")
    request = relationship("Requests", back_populates="request_process")


class StateTypes(Base):
    __tablename__ = "state_types"

    state_type_id = Column(
        Integer, Sequence("state_types_state_type_id_seq"), primary_key=True
    )
    state_type_name = Column(String, nullable=False)

    state = relationship("States", back_populates="state_type")


class States(Base):
    __tablename__ = "states"

    state_id = Column(Integer, Sequence("state_state_id_seq"), primary_key=True)
    state_name = Column(String, nullable=False)
    state_description = Column(String, default="")
    state_type_id = Column(Integer, ForeignKey("state_types.state_type_id"))
    request_process_id = Column(
        Integer, ForeignKey("request_processes.request_process_id")
    )

    state_type = relationship("StateTypes", back_populates="state")
    request_process = relationship("RequestProcesses", back_populates="state")
    activity = relationship(
        "Activities", secondary="states_activities", back_populates="state"
    )
    request = relationship("Requests", back_populates="state")
    current_state = relationship("Transitions", back_populates="state_current")
    next_state = relationship("Transitions", back_populates="state_next")


class Transitions(Base):
    __tablename__ = "transitions"

    transition_id = Column(
        Integer, Sequence("transitions_transition_id_seq"), primary_key=True
    )
    current_state_id = Column(Integer, ForeignKey("states.state_id"), nullable=False)
    next_state_id = Column(Integer, ForeignKey("states.state_id"), nullable=False)
    request_process_id = Column(
        Integer, ForeignKey("request_processes.request_process_id"), nullable=False
    )
    description = Column(String, default="")

    state_current = relationship("States", back_populates="current_state")
    state_next = relationship("States", back_populates="next_state")
    request_process = relationship("RequestProcesses", back_populates="transition")
    action = relationship(
        "Actions", secondary="transitions_actions", back_populates="transition"
    )
    activity = relationship(
        "Activities", secondary="transitions_activities", back_populates="transition"
    )
    request_action = relationship("RequestActions", back_populates="transition")


class ActionTypes(Base):
    __tablename__ = "action_types"

    action_type_id = Column(
        Integer, Sequence("action_types_action_type_id_seq"), primary_key=True
    )
    action_type_name = Column(String, nullable=False)

    action = relationship("Actions", back_populates="action_type")


class Actions(Base):
    __tablename__ = "actions"

    action_id = Column(Integer, Sequence("actions_action_id_seq"), primary_key=True)
    action_name = Column(String, nullable=False)
    action_description = Column(String, default="")
    action_type_id = Column(Integer, ForeignKey("action_types.action_type_id"))
    request_process_id = Column(
        Integer, ForeignKey("request_processes.request_process_id")
    )

    action_type = relationship("ActionTypes", back_populates="action")
    request_process = relationship("RequestProcesses", back_populates="action")
    transition = relationship(
        "Transitions", secondary="transitions_actions", back_populates="action"
    )
    request_action = relationship("RequestActions", back_populates="action")
    group = relationship("Groups", secondary="actions_groups", back_populates="action")


class ActivityTypes(Base):
    __tablename__ = "activity_types"

    activity_type_id = Column(
        Integer, Sequence("activity_types_activity_type_id"), primary_key=True
    )
    activity_type_name = Column(String, nullable=False)

    activity = relationship("Activities", back_populates="activity_type")


class Activities(Base):
    __tablename__ = "activities"

    activity_id = Column(
        Integer, Sequence("activities_activity_id_seq"), primary_key=True
    )
    activity_name = Column(String, nullable=False)
    activity_description = Column(String, default="")
    activity_type_id = Column(Integer, ForeignKey("activity_types.activity_type_id"))
    request_process_id = Column(
        Integer, ForeignKey("request_processes.request_process_id")
    )

    activity_type = relationship("ActivityTypes", back_populates="activity")
    request_process = relationship("RequestProcesses", back_populates="activity")
    state = relationship(
        "States", secondary="states_activities", back_populates="activity"
    )
    transition = relationship(
        "Transitions", secondary="transitions_activities", back_populates="activity"
    )
    group = relationship(
        "Groups", secondary="activities_groups", back_populates="activity"
    )


class ListItems(Base):
    __tablename__ = "list_items"

    list_item_id = Column(
        Integer, Sequence("list_items_list_item_id_seq"), primary_key=True
    )
    request_process_id = Column(
        Integer, ForeignKey("request_processes.request_process_id")
    )
    category = Column(String, nullable=False)
    list_item_name = Column(String, nullable=False)

    item_detail = relationship("ItemDetails", back_populates="list_item")


class ItemDetails(Base):
    __tablename__ = "item_details"

    item_detail_id = Column(
        Integer, Sequence("item_details_item_detail_id"), primary_key=True
    )
    item_detail = Column(String, default="")
    list_item_id = Column(Integer, ForeignKey("list_items.list_item_id"))

    list_item = relationship("ListItems", back_populates="item_detail")


class LinesDatabases(Base):
    __tablename__ = "lines_databases"

    id = Column(Integer, Sequence("lines_databases_id_seq"), primary_key=True)
    line_id = Column(Integer, ForeignKey("lines.line_id"))
    type = Column(String, nullable=False)
    db_server = Column(String, nullable=False)
    db_port = Column(String, nullable=False)
    db_user = Column(String, nullable=False)
    db_pass = Column(String, nullable=False)
    db_name = Column(String, default="")
    db_provider = Column(String, default="postgresql")
    description = Column(String, default="")

    line = relationship("Lines", back_populates="database")


class BreakerUnits(Base):
    __tablename__ = "breaker_units"
    id = Column(Integer, Sequence("breaker_units_id_seq"), primary_key=True)
    breaker_name = Column(String, nullable=False)
    description = Column(String, default="")

    machine = relationship(
        "Machines", secondary="machines_breakers", back_populates="breaker"
    )


class ValveUnits(Base):
    __tablename__ = "valve_units"

    id = Column(Integer, Sequence("valve_units_id_seq"), primary_key=True)
    valve_name = Column(String, nullable=False)
    description = Column(String, default="")

    valve = relationship(
        "Machines", secondary="machines_valves", back_populates="valve"
    )


# many-to-many table
class LinesParts(Base):
    __tablename__ = "lines_parts"

    id = Column(Integer, Sequence("lines_parts_id_seq"), primary_key=True)
    line_id = Column(Integer, ForeignKey("lines.line_id"))
    part_no = Column(String, ForeignKey("parts.part_no"))


class LinesUsers(Base):
    __tablename__ = "lines_users"

    id = Column(Integer, Sequence("lines_users_iq_seq"), primary_key=True)
    line_id = Column(Integer, ForeignKey("lines.line_id"))
    user_uuid = Column(postgresql.UUID(as_uuid=True), ForeignKey("users.user_uuid"))


class ModelsParts(Base):
    __tablename__ = "models_parts"

    id = Column(Integer, Sequence("models_parts_id_seq"), primary_key=True)
    model_id = Column(Integer, ForeignKey("models.model_id"))
    part_no = Column(String, ForeignKey("parts.part_no"))


class ModelsCustomers(Base):
    __tablename__ = "models_customers"

    id = Column(Integer, Sequence("models_customers_id_seq"), primary_key=True)
    model_id = Column(Integer, ForeignKey("models.model_id"))
    customer_id = Column(Integer, ForeignKey("customers.customer_id"))


class PartsMachines(Base):
    __tablename__ = "parts_machines"

    id = Column(Integer, Sequence("parts_machines_id_seq"), primary_key=True)
    part_no = Column(String, ForeignKey("parts.part_no"))
    machine_no = Column(String, ForeignKey("machines.machine_no"))


class ProcessesMachines(Base):
    __tablename__ = "processes_machines"

    id = Column(Integer, Sequence("processes_machines_id_seq"), primary_key=True)
    process_id = Column(Integer, ForeignKey("processes.process_id"))
    machine_no = Column(String, ForeignKey("machines.machine_no"))


class ProcessSymbol(Base):
    __tablename__ = "processes_symbols"

    id = Column(Integer, Sequence("process_symbol_id_seq"), primary_key=True)
    process_id = Column(Integer, ForeignKey("processes.process_id"))
    sc_symbol_id = Column(Integer, ForeignKey("sc_symbols.sc_symbol_id"))


class ProcessAdmin(Base):
    __tablename__ = "process_admin"

    id = Column(Integer, Sequence("process_admin_id_seq"), primary_key=True)
    request_process_id = Column(
        Integer, ForeignKey("request_processes.request_process_id")
    )
    user_uuid = Column(postgresql.UUID(as_uuid=True), ForeignKey("users.user_uuid"))


class TransitionsActions(Base):
    __tablename__ = "transitions_actions"

    id = Column(Integer, Sequence("transitions_actions_id_seq"), primary_key=True)
    transition_id = Column(Integer, ForeignKey("transitions.transition_id"))
    action_id = Column(Integer, ForeignKey("actions.action_id"))
    description = Column(String, default="")


class StatesActivities(Base):
    __tablename__ = "states_activities"

    id = Column(Integer, Sequence("states_activities_id_seq"), primary_key=True)
    state_id = Column(Integer, ForeignKey("states.state_id"))
    activity_id = Column(Integer, ForeignKey("activities.activity_id"))
    description = Column(String, default="")


class TransitionsActivities(Base):
    __tablename__ = "transitions_activities"

    id = Column(Integer, Sequence("transitions_activities_id_seq"), primary_key=True)
    transition_id = Column(Integer, ForeignKey("transitions.transition_id"))
    activity_id = Column(Integer, ForeignKey("activities.activity_id"))
    description = Column(String, default="")


class ActionsGroups(Base):
    __tablename__ = "actions_groups"

    id = Column(Integer, Sequence("actions_groups_id_seq"), primary_key=True)
    action_id = Column(Integer, ForeignKey("actions.action_id"), nullable=False)
    group_id = Column(Integer, ForeignKey("groups.group_id"), nullable=False)


class ActivitiesGroups(Base):
    __tablename__ = "activities_groups"

    id = Column(Integer, Sequence("activites_groups_id_seq"), primary_key=True)
    activity_id = Column(Integer, ForeignKey("activities.activity_id"), nullable=False)
    group_id = Column(Integer, ForeignKey("groups.group_id"), nullable=False)


class ProductsLines(Base):
    __tablename__ = "products_lines"

    id = Column(Integer, Sequence("products_lines_id_seq"), primary_key=True)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False)
    line_id = Column(Integer, ForeignKey("lines.line_id"), nullable=False)


class MachinesBreakers(Base):
    __tablename__ = "machines_breakers"

    id = Column(Integer, Sequence("machines_breakers_id_seq"), primary_key=True)
    machine_no = Column(String, ForeignKey("machines.machine_no"), nullable=False)
    breaker_id = Column(Integer, ForeignKey("breaker_units.id"), nullable=False)


class MachinesValves(Base):
    __tablename__ = "machines_valves"

    id = Column(Integer, Sequence("machines_valves_id_seq"), primary_key=True)
    machine_no = Column(String, ForeignKey("machines.machine_no"), nullable=False)
    valve_id = Column(Integer, ForeignKey("valve_units.id"), nullable=False)
