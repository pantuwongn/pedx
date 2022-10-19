import json
from jwcrypto import jwt, jwk, jwe
from datetime import datetime, timedelta
from typing import Any, Optional, Dict
from dotenv import dotenv_values

from app import exceptions

config = dotenv_values(".env")

JWK_ACCESS_KEY = config["JWK_ACCESS_KEY"]
JWK_REFRESH_KEY = config["JWK_REFRESH_KEY"]


def generate_jwe(
    data: dict,
    secret: str = JWK_ACCESS_KEY,
    token_type: str = "access",
    lifetime_days: Optional[int] = 0,
    lifetime_minutes: Optional[int] = 0,
) -> str:
    if token_type == "refresh":
        secret = JWK_REFRESH_KEY

    payload = data.copy()
    if lifetime_days + lifetime_minutes > 0:
        expire = datetime.now() + timedelta(
            days=lifetime_days, minutes=lifetime_minutes
        )
        payload["expired_date"] = str(expire)
    key = jwk.JWK(**json.loads(secret))

    token = jwt.JWT(header={"alg": "HS256"}, claims=payload)
    token.make_signed_token(key)

    e_token = jwt.JWT(
        header={"alg": "A256KW", "enc": "A256CBC-HS512"}, claims=token.serialize()
    )
    e_token.make_encrypted_token(key)

    return e_token.serialize()


def decode_jwe(
    encoded_jwt: str,
    secret: str = JWK_ACCESS_KEY,
    token_type: str = "access",
) -> Dict[str, Any]:
    try:
        if token_type == "refresh":
            secret = JWK_REFRESH_KEY

        key = jwk.JWK(**json.loads(secret))
        ET = jwt.JWT(key=key, jwt=encoded_jwt)
        ST = jwt.JWT(key=key, jwt=ET.claims)
        return json.loads(ST.claims)
    except jwe.InvalidJWEData:
        raise exceptions.InvalidJWEDecode()
