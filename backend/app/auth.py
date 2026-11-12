"""Compatible with src/lib/auth.ts + password.ts (Node scrypt + HMAC session)."""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import time
from typing import Optional

from fastapi import Cookie, Depends, HTTPException, Response

from .config import settings

COOKIE = "admin_session"
MAX_AGE_SEC = 60 * 60 * 24 * 7


def hash_password(password: str) -> str:
    salt = os.urandom(16).hex()
    digest = hashlib.scrypt(
        password.encode("utf-8"),
        salt=salt.encode("utf-8"),
        n=16384,
        r=8,
        p=1,
        dklen=64,
    )
    return f"{salt}:{digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt, hashed = stored.split(":", 1)
    except ValueError:
        return False
    actual = hashlib.scrypt(
        password.encode("utf-8"),
        salt=salt.encode("utf-8"),
        n=16384,
        r=8,
        p=1,
        dklen=64,
    )
    expected = bytes.fromhex(hashed)
    return hmac.compare_digest(actual, expected)


def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("ascii").rstrip("=")


def _b64url_decode(data: str) -> bytes:
    pad = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + pad)


def _sign(payload: str) -> str:
    digest = hmac.new(
        settings.admin_secret.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    return _b64url(digest)


def create_session_token(username: str) -> str:
    body_obj = {"u": username, "exp": int(time.time() * 1000) + MAX_AGE_SEC * 1000}
    body = _b64url(json.dumps(body_obj, separators=(",", ":")).encode("utf-8"))
    return f"{body}.{_sign(body)}"


def read_session_token(token: Optional[str]) -> Optional[str]:
    if not token or "." not in token:
        return None
    body, sig = token.split(".", 1)
    expected = _sign(body)
    if not hmac.compare_digest(sig, expected):
        return None
    try:
        data = json.loads(_b64url_decode(body).decode("utf-8"))
        if not data.get("u") or not data.get("exp"):
            return None
        if int(time.time() * 1000) > int(data["exp"]):
            return None
        return str(data["u"])
    except Exception:
        return None


def set_admin_cookie(response: Response, username: str) -> None:
    response.set_cookie(
        key=COOKIE,
        value=create_session_token(username),
        httponly=True,
        samesite="lax",
        secure=settings.cookie_secure,
        path="/",
        max_age=MAX_AGE_SEC,
    )


def clear_admin_cookie(response: Response) -> None:
    response.set_cookie(
        key=COOKIE,
        value="",
        httponly=True,
        samesite="lax",
        secure=settings.cookie_secure,
        path="/",
        max_age=0,
    )


def require_admin(admin_session: Optional[str] = Cookie(default=None, alias=COOKIE)) -> str:
    user = read_session_token(admin_session)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return user
