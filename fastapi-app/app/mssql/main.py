from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from . import crud
from ..dependencies import get_ms_db

router = APIRouter(prefix="/mssql")

@router.get("/")
async def get(db: Session = Depends(get_ms_db)):
    return {"message":"test"}