import json
from jwcrypto import jwt, jwk, jwe
from datetime import datetime, timedelta
from typing import Any, List, Optional, Dict
from dotenv import dotenv_values

from app import exceptions

config = dotenv_values(".env")

JWT_SECRET = config["JWT_SECRET"]
JWT_ALGOLITHM = config["JWT_ALGORITHM"]

JWK_ACCESS_KEY = config["JWK_KEY"]
JWK_REFRESH_KEY = config["JWK_REFRESH_KEY"]
# TODO store JWK as environment variable (use oct,256)
# TODO change to JWE


def generate_jwe(
    data: dict,
    # secret: str = JWT_SECRET,
    secret: str = JWK_REFRESH_KEY,
    token_type: str = "refresh",
    lifetime_days: Optional[int] = 0,
    lifetime_minutes: Optional[int] = 0,
    # algorithm: str = JWT_ALGOLITHM,
) -> str:
    if token_type == "access":
        secret = JWK_ACCESS_KEY

    payload = data.copy()
    if lifetime_days + lifetime_minutes > 0:
        expire = datetime.now() + timedelta(
            days=lifetime_days, minutes=lifetime_minutes
        )
        payload["expired_date"] = str(expire)
    # return jwt.encode(payload, secret, algorithm)
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
    # secret: str = JWT_SECRET,
    secret: str = JWK_REFRESH_KEY,
    # audience: List[str] = ["pedx:auth"],
    # algorithms: List[str] = [JWT_ALGOLITHM],
    token_type: str = "refresh",
) -> Dict[str, Any]:
    try:
        # return jwt.decode(encoded_jwt, secret, audience=audience, algorithms=algorithms)
        if token_type == "access":
            secret = JWK_ACCESS_KEY

        key = jwk.JWK(**json.loads(secret))
        ET = jwt.JWT(key=key, jwt=encoded_jwt)
        ST = jwt.JWT(key=key, jwt=ET.claims)
        return json.loads(ST.claims)
    except jwe.InvalidJWEData:
        raise exceptions.InvalidJWEDecode()
