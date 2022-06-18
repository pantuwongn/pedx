from timeit import timeit
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator
import asyncio

from app.crud.static import staticdataCRUD


def static_routers(db: AsyncGenerator) -> APIRouter:
    router = APIRouter()
    crud = staticdataCRUD()

    @router.get("/5m1e/report", name="Static data for 5M1E report")
    async def _5m1e_report(db: AsyncSession = Depends(db)):
        (
            request_processes,
            list_items_problem,
            list_items_changepoint,
            item_details,
            products,
            lines,
            lines_parts,
            processes,
            processes_machines,
            machines,
            parts,
            parts_machines,
        ) = await asyncio.gather(
            crud.get_request_processes(db),
            crud.get_list_items(1, db),  # problem
            crud.get_list_items(2, db),  # changepoint
            crud.get_item_details(db),
            crud.get_products(db),
            crud.get_lines(db),
            crud.get_lines_parts(db),
            crud.get_processes(db),
            crud.get_processes_machines(db),
            crud.get_machines(db),
            crud.get_parts(db),
            crud.get_parts_machines(db),
        )

        data = {
            "request_processes": request_processes,
            "list_items_problem": list_items_problem,
            "list_items_changepoint": list_items_changepoint,
            "item_details": item_details,
            "products": products,
            "lines": lines,
            "lines_parts": lines_parts,
            "processes": processes,
            "processes_machines": processes_machines,
            "machines": machines,
            "parts": parts,
            "parts_machines": parts_machines,
        }
        return data

    @router.get("/5m1e/dashboard", name="Static data for 5M1E Dashboard")
    async def _5m1e_dashboard(db: AsyncSession = Depends(db)):
        (
            users_join_roles_positions,
            groups,
            group_members,
            department,
            sections,
            lines,
            lines_users,
            machines,
            processes_join_types,
            sc_symbols,
            processes_symbols,
            products,
            parts,
            models,
            models_parts,
            customers_join_plants,
            request_processes,
            states_join_types,
            actions_join_types,
            transitions_join_transitions_actions,
        ) = await asyncio.gather(
            crud.get_join_users_roles_positions(db),
            crud.get_groups(db),
            crud.get_group_members(db),
            crud.get_departments(db),
            crud.get_sections(db),
            crud.get_lines(db),
            crud.get_lines_users(db),
            crud.get_machines(db),
            crud.get_join_processes_types(db),
            crud.get_sc_symbols(db),
            crud.get_processes_symbols(db),
            crud.get_products(db),
            crud.get_parts(db),
            crud.get_models(db),
            crud.get_models_parts(db),
            crud.get_join_customers_plants(db),
            crud.get_request_processes(db),
            crud.get_join_states_types([1, 2], db),
            crud.get_join_actions_types([1, 2], db),
            crud.get_join_transitions_transition_actions([1,2],db),
        )

        data = {
            "users_join_roles": users_join_roles_positions,
            "groups": groups,
            "group_members": group_members,
            "departments": department,
            "sections": sections,
            "lines": lines,
            "lines_users": lines_users,
            "machines": machines,
            "processes_join_types": processes_join_types,
            "sc_symbols": sc_symbols,
            "processes_symbols": processes_symbols,
            "products": products,
            "parts": parts,
            "models": models,
            "models_parts": models_parts,
            "customers_join_plants": customers_join_plants,
            "request_processes": request_processes,
            "states_join_types": states_join_types,
            "actions_join_types": actions_join_types,
            "transitions_join_transitions_actions": transitions_join_transitions_actions,
        }
        return data

    return router
