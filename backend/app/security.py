import hashlib
import binascii
import os
import jwt
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from typing import List

from app.config import get_settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

def hash_password(password: str) -> str:
    """Hash a password using PBKDF2 with SHA-256."""
    salt = os.urandom(16)
    pwdhash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return f"pbkdf2_sha256$100000${binascii.hexlify(salt).decode('ascii')}${binascii.hexlify(pwdhash).decode('ascii')}"

def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against its hash."""
    try:
        parts = hashed.split('$')
        if len(parts) == 4 and parts[0] == 'pbkdf2_sha256':
            _, iterations, salt_hex, hash_hex = parts
            salt = binascii.unhexlify(salt_hex)
            pwdhash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, int(iterations))
            return binascii.hexlify(pwdhash).decode('ascii') == hash_hex
        elif len(parts) == 3:
            prefix, salt_hex, hash_hex = parts
            iterations = int(prefix.split(':')[-1]) if ':' in prefix else 100000
            salt = binascii.unhexlify(salt_hex)
            pwdhash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, iterations)
            return binascii.hexlify(pwdhash).decode('ascii') == hash_hex
        return False
    except Exception:
        return False

def create_token(user_id: str, role: str) -> str:
    """Create a JWT token for the user."""
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    to_encode = {"sub": user_id, "role": role, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret, algorithm="HS256")
    return encoded_jwt

def decode_token(token: str) -> dict:
    """Decode and validate a JWT token."""
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """FastAPI dependency to get the current user from the token."""
    payload = decode_token(token)
    if "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    return payload

async def get_optional_current_user(token: str | None = Depends(oauth2_scheme_optional)) -> dict | None:
    """FastAPI dependency to get the current user if token is present, else None."""
    if not token:
        return None
    try:
        payload = decode_token(token)
        if "sub" not in payload:
            return None
        return payload
    except Exception:
        return None

def require_role(*roles: str):
    """FastAPI dependency factory to require specific roles."""
    async def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker
