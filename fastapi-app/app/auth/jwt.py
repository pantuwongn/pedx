import jwt
from datetime import datetime, timedelta
from typing import Any, List, Optional, Dict
from dotenv import dotenv_values


config = dotenv_values(".env")

JWT_SECRET = config["JWT_SECRET"]
JWT_ALGOLITHM = config["JWT_ALGORITHM"]


def generate_jwt(
    data: dict,
    secret: str = JWT_SECRET,
    lifetime_hours: Optional[int] = None,
    algorithm: str = JWT_ALGOLITHM,
) -> str:
    payload = data.copy()
    if lifetime_hours:
        expire = datetime.now() + timedelta(hours=lifetime_hours)
        payload["expired_date"] = expire
    return jwt.encode(payload, secret, algorithm)


def decode_jwt(
    encoded_jwt: str,
    secret: str = JWT_SECRET,
    audience: List[str] = ["pedx:auth"],
    algorithms: List[str] = [JWT_ALGOLITHM],
) -> Dict[str, Any]:
    return jwt.decode(encoded_jwt, secret, audience=audience, algorithms=algorithms)
