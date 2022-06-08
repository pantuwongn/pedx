from pyexpat import model
from sqlalchemy import (
    ARRAY,
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

from app.database import Base


class Sections(Base):
    __tablename__ = "sections"

    section_code = Column(Integer, primary_key=True)
    section_name = Column(String, nullable=False, unique=True)
    department_id = Column(Integer, ForeignKey("departments.department_id"))

    department = relationship("Departments", back_populates="section")
    user = relationship("Users", back_populates="section")
    line = relationship("Lines", back_populates="section")


class Departments(Base):
    __tablename__ = "departments"

    department_id = Column(
        Integer, Sequence("departments_dartpartment_id_seq"), primary_key=True
    )
    department_name = Column(String, nullable=False, unique=True)

    section = relationship("Sections", back_populates="department")


class Lines(Base):
    __tablename__ = "lines"

    line_id = Column(Integer, Sequence("lines_line_id_seq"), primary_key=True)
    line_name = Column(String, nullable=False)
    work_center_code = Column(String, nullable=False)
    section_code = Column(Integer, ForeignKey("sections.section_code"))

    section = relationship("Sections", back_populates="line")
    part = relationship("Parts", secondary="lines_parts", back_populates="line")
    request = relationship("Requests", back_populates="line")


class Processes(Base):
    __tablename__ = "processes"

    process_id = Column(Integer, Sequence("processes_process_id"), primary_key=True)
    process_name = Column(String, nullable=False)
    process_type_id = Column(Integer, ForeignKey("process_types.process_type_id"))
    line_id = Column(Integer, ForeignKey("lines.line_id"))

    symbol = relationship(
        "SCSymbols", secondary="process_symbol", back_populates="process"
    )


class ProcessTypes(Base):
    __tablename__ = "process_types"

    process_type_id = Column(
        Integer, Sequence("process_types_process_type_id_seq"), primary_key=True
    )
    process_type_name = Column(String, nullable=False)


class SCSymbols(Base):
    __tablename__ = "sc_symbols"

    sc_symbol_id = Column(
        Integer, Sequence("sc_symbols_sc_symbol_id_seq"), primary_key=True
    )
    character = Column(String(2), nullable=False)
    shape = Column(postgresql.ENUM("circle", "square", "triangle",name="shape_enum"), nullable=False)

    process = relationship(
        "Processes", secondary="process_symbol", back_populates="symbol"
    )


class Products(Base):
    __tablename__ = "products"

    product_id = Column(Integer, Sequence("products_product_id_seq"), primary_key=True)
    full_name = Column(String, nullable=False)
    short_name = Column(String, nullable=False)

    part = relationship("Parts", back_populates="product")


class Models(Base):
    __tablename__ = "models"

    model_code = Column(String, primary_key=True)
    model_name = Column(String, default="")
    customer_id = Column(Integer, ForeignKey("customers.customer_id"))

    part = relationship("Parts", secondary="models_parts", back_populates="model")
    customer = relationship("Customers", back_populates="model")


class Customers(Base):
    __tablename__ = "customers"

    customer_id = Column(
        Integer, Sequence("customers_customer_id_seq"), primary_key=True
    )
    customer_name = Column(String, nullable=False, unique=True)
    customer_short_name = Column(String, default="")

    model = relationship("Models", back_populates="customer")
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
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    product = relationship("Products", back_populates="part")
    line = relationship("Lines", secondary="lines_parts", back_populates="part")
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
    state_name = Column(String, nullable=False)

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
    set_active = Column(Boolean, default=False)
    set_complete = Column(Boolean, default=True)
    action_type_id = Column(Integer, ForeignKey("action_types.action_type_id"))
    request_process_id = Column(
        Integer, ForeignKey("request_processes.request_process_id")
    )

    action_type = relationship("ActionTypes", back_populates="action")
    request_process = relationship("RequestProcesses", back_populates="action")
    transition = relationship(
        "Transitions", secondary="transitions_actions", back_populates="action"
    )
    action_target = relationship("ActionTargets", back_populates="action")
    request_action = relationship("RequestActions", back_populates="action")


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
    activity_target = relationship("ActivityTargets", back_populates="activity")


class Targets(Base):
    __tablename__ = "targets"

    target_id = Column(Integer, Sequence("targets_target_id_seq"), primary_key=True)
    target_name = Column(String, nullable=False)
    target_description = Column(String, default="")

    action_target = relationship("ActionTargets", back_populates="target")
    activity_target = relationship("ActivityTargets", back_populates="target")


class ListItems(Base):
    __tablename__ = "list_items"

    list_item_id = Column(
        Integer, Sequence("list_items_list_item_id_seq"), primary_key=True
    )
    list_item_name = Column(String, nullable=False)

    item_detail = relationship("ItemDetails", back_populates="list_item")


class ItemDetails(Base):
    __tablename__ = "item_details"

    item_detail_id = Column(
        Integer, Sequence("item_details_item_detail_id"), primary_key=True
    )
    item_detail = Column(postgresql.ARRAY(String), default="")
    list_item_id = Column(Integer, ForeignKey("list_items.list_item_id"))

    list_item = relationship("ListItems", back_populates="item_detail")


# many-to-many table
class LinesParts(Base):
    __tablename__ = "lines_parts"

    id = Column(Integer, Sequence("lines_parts_id_seq"), primary_key=True)
    line_id = Column(Integer, ForeignKey("lines.line_id"))
    part_no = Column(String, ForeignKey("parts.part_no"))


class ModelsParts(Base):
    __tablename__ = "models_parts"

    id = Column(Integer, Sequence("models_parts_id_seq"), primary_key=True)
    model = Column(String, ForeignKey("models.model_code"))
    part_no = Column(String, ForeignKey("parts.part_no"))


class ProcessSymbol(Base):
    __tablename__ = "process_symbol"

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


class StatesActivities(Base):
    __tablename__ = "states_activities"

    id = Column(Integer, Sequence("states_activities_id_seq"), primary_key=True)
    state_id = Column(Integer, ForeignKey("states.state_id"))
    activity_id = Column(Integer, ForeignKey("activities.activity_id"))


class TransitionsActivities(Base):
    __tablename__ = "transitions_activities"

    id = Column(Integer, Sequence("transitions_activities_id_seq"), primary_key=True)
    transition_id = Column(Integer, ForeignKey("transitions.transition_id"))
    activity_id = Column(Integer, ForeignKey("activities.activity_id"))
