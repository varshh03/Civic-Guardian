from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, EmailStr
from pathlib import Path
from datetime import datetime, timezone
import uuid

from app.config import get_settings
from app.models import User, UserRole
from app.repos.json_repo import UserRepo
from app.security import hash_password, verify_password, create_token, get_current_user
from app.services.ratelimit import auth_limiter

router = APIRouter()

def get_user_repo() -> UserRepo:
    return UserRepo(Path(get_settings().data_dir))

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    language: str = "ta"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    role: str
    department_id: str | None
    language: str
    avatar: str | None
    points: int
    badges: list[str]
    active: bool
    created_at: datetime

def user_to_response(user: User) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "department_id": user.department_id,
        "language": user.language,
        "avatar": user.avatar,
        "points": user.points,
        "badges": user.badges,
        "active": user.active,
        "created_at": user.created_at,
    }

@router.post("/register", status_code=201)
async def register(req: RegisterRequest, request: Request):
    client_ip = request.client.host
    if not auth_limiter.is_allowed(f"register:{client_ip}"):
        raise HTTPException(429, "Too many registration attempts. Try again later.")
    
    repo = get_user_repo()
    if repo.get_by_email(req.email):
        raise HTTPException(400, "Email already registered")
    
    if len(req.password) < 8:
        raise HTTPException(400, "Password must be at least 8 characters")
    
    user = User(
        id=str(uuid.uuid4()),
        name=req.name.strip(),
        email=req.email.lower(),
        phone=req.phone.strip(),
        password=hash_password(req.password),
        role=UserRole.citizen,
        language=req.language if req.language in ["en", "ta"] else "ta",
        created_at=datetime.now(timezone.utc)
    )
    repo.create(user)
    token = create_token(user.id, user.role)
    return {"token": token, "user": user_to_response(user)}

@router.post("/login")
async def login(req: LoginRequest, request: Request):
    client_ip = request.client.host
    if not auth_limiter.is_allowed(f"login:{client_ip}"):
        raise HTTPException(429, "Too many login attempts. Try again later.")
    
    repo = get_user_repo()
    user = repo.get_by_email(req.email.lower())
    if not user or not verify_password(req.password, user.password):
        raise HTTPException(401, "Invalid email or password")
    if not user.active:
        raise HTTPException(403, "Account deactivated")
    
    token = create_token(user.id, user.role)
    return {"token": token, "user": user_to_response(user)}

@router.get("/me")
async def me(current: dict = Depends(get_current_user)):
    repo = get_user_repo()
    user = repo.get(current["sub"])
    if not user:
        raise HTTPException(404, "User not found")
    return user_to_response(user)

class UpdateProfileRequest(BaseModel):
    name: str | None = None
    phone: str | None = None
    language: str | None = None
    avatar: str | None = None

@router.patch("/me")
async def update_me(req: UpdateProfileRequest, current: dict = Depends(get_current_user)):
    repo = get_user_repo()
    def mutate(user: User) -> User:
        if req.name is not None: user.name = req.name.strip()
        if req.phone is not None: user.phone = req.phone.strip()
        if req.language is not None and req.language in ["en", "ta"]: user.language = req.language
        if req.avatar is not None: user.avatar = req.avatar
        return user
    user = repo.mutate(current["sub"], mutate)
    if not user:
        raise HTTPException(404, "User not found")
    return user_to_response(user)
