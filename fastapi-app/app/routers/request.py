from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator
import asyncio

from app.auth.bearer import BearerDependency
from app.schemas.request import RequestCreateSubmit
from app.crud.request import RequestCRUD


def request_routers(db: AsyncGenerator) -> APIRouter:
    router = APIRouter()
    crud = RequestCRUD()

    @router.post("/submit", dependencies=[Depends(BearerDependency(auto_error=False))])
    async def submit_request(
        request_data: RequestCreateSubmit, db: AsyncSession = Depends(db)
    ):
        request_id = await crud.post_submit_request(request_data, db)
        return request_id

    @router.post("/save", dependencies=[Depends(BearerDependency(auto_error=False))])
    async def save_request(request_data: str, db: AsyncSession = Depends(db)):
        return "save"

    @router.get(
        "/get/allrequests", dependencies=[Depends(BearerDependency(auto_error=False))]
    )
    async def get_all_requests_by_type(
        t: str, t_name: str, db: AsyncSession = Depends(db)
    ):
        ids = list(map(int, t.split(",")))
        print("ids = ", ids)
        requests = await crud.get_all_requests_by_type(
            process_id=ids, process_name=t_name, db=db
        )
        return requests

    @router.get(
        "/get/requests", dependencies=[Depends(BearerDependency(auto_error=False))]
    )
    async def get_requests(
        t: str,
        skip: int = 0,
        limit: int = 10,
        db: AsyncSession = Depends(db),
    ):
        ids = list(map(int, t.split(",")))
        requests = await crud.get_requests_by_type(
            process_id=ids, skip=skip, limit=limit, db=db
        )
        return requests

    @router.get(
        "/get/request", dependencies=[Depends(BearerDependency(auto_error=False))]
    )
    async def get_request(id: str, db: AsyncSession = Depends(db)):
        return await crud.get_request(id=id, db=db)

    @router.get(
        "/get/countrequest", dependencies=[Depends(BearerDependency(auto_error=False))]
    )
    async def get_count_all_request(db: AsyncSession = Depends(db)):
        rs = await crud.get_count_all_requests(db)
        return rs[0]["c"]

    @router.get(
        "/get/summaryrequests",
        dependencies=[Depends(BearerDependency(auto_error=False))],
    )
    async def get_summary_requests(
        product_id: int, start_date: str, end_date: str, db: AsyncSession = Depends(db)
    ):
        rs = await crud.get_summary_requests(product_id, start_date, end_date, db)
        return rs

    @router.get(
        "/get/changekpi",
        dependencies=[Depends(BearerDependency(auto_error=False))],
    )
    async def get_change_kpi(
        product_id: int, start_date: str, end_date: str, db: AsyncSession = Depends(db)
    ):
        rs = await crud.get_change_kpi(product_id, start_date, end_date, db)
        return rs

    @router.get(
        "/get/changecategory",
        dependencies=[Depends(BearerDependency(auto_error=False))],
    )
    async def get_change_category(
        product_id: int, start_date: str, end_date: str, db: AsyncSession = Depends(db)
    ):
        rs = await crud.get_change_category(product_id, start_date, end_date, db)
        return rs

    @router.get(
        "/get/changerequestbydateproduct",
        dependencies=[Depends(BearerDependency(auto_error=False))],
    )
    async def get_change_request_by_date_product(
        product_id: int, start_date: str, end_date: str, db: AsyncSession = Depends(db)
    ):
        rs = await crud.get_change_request_by_date_product(
            product_id, start_date, end_date, db
        )
        return rs

    return router
