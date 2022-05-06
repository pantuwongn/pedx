from fastapi import APIRouter
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import BaseModel, EmailStr
from starlette.responses import JSONResponse
from typing import List
from dotenv import dotenv_values

from .template import html

config = dotenv_values(".env")
# print(config_credentials["EMAIL"])

router = APIRouter(prefix="/email")


class EmailSchema(BaseModel):
    email: List[EmailStr]


conf = ConnectionConfig(
    MAIL_USERNAME=config["EMAIL"],
    MAIL_PASSWORD=config["PASS"],
    MAIL_FROM=config["EMAIL"],
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_TLS=True,
    MAIL_SSL=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)

fm = FastMail(conf)

@router.post("/")
async def simple_send(email: EmailSchema) -> JSONResponse:
    msg = MessageSchema(
        subject="Fastapi-mail-module",
        recipients=email.dict().get("email"),
        body=html,
        subtype="html",
    )
    await fm.send_message(msg)
    return JSONResponse(status_code=200, content={"message": "email has been sent"})
