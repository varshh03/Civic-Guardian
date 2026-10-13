from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from pathlib import Path
import re
from app.config import get_settings
from app.repos.json_repo import UserRepo, ComplaintRepo, CommentRepo, DepartmentRepo
from app.security import get_current_user
from app.models import UserRole, Department

router = APIRouter()

def get_repos():
    data_dir = Path(get_settings().data_dir)
    return {
        "users": UserRepo(data_dir),
        "complaints": ComplaintRepo(data_dir),
        "comments": CommentRepo(data_dir),
        "departments": DepartmentRepo(data_dir),
    }

class UpdateUserRequest(BaseModel):
    department_id: str | None = None
    active: bool | None = None

class CreateDepartmentRequest(BaseModel):
    id: str | None = None
    name_en: str
    name_ta: str
    issue_types: list[str] = []
    sla_hours: int = 48

@router.get("/users")
async def list_users(current: dict = Depends(get_current_user)):
    if current.get("role") != "admin":
        raise HTTPException(403, "Admins only")
    repos = get_repos()
    users = repos["users"].all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "phone": u.phone,
            "role": u.role,
            "department_id": u.department_id,
            "active": u.active,
            "points": u.points,
            "badges": u.badges,
            "language": u.language,
            "created_at": u.created_at
        }
        for u in users
    ]

@router.patch("/users/{user_id}")
async def update_user(user_id: str, req: UpdateUserRequest, current: dict = Depends(get_current_user)):
    if current.get("role") != "admin":
        raise HTTPException(403, "Admins only")
    repos = get_repos()
    def mutate(u):
        if req.department_id is not None:
            u.department_id = req.department_id if req.department_id != "" else None
        if req.active is not None:
            u.active = req.active
        return u
    user = repos["users"].mutate(user_id, mutate)
    if not user:
        raise HTTPException(404, "User not found")
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "department_id": user.department_id,
        "active": user.active
    }

@router.get("/departments")
async def list_admin_departments(current: dict = Depends(get_current_user)):
    if current.get("role") != "admin":
        raise HTTPException(403, "Admins only")
    repos = get_repos()
    return repos["departments"].all()

@router.post("/departments", status_code=201)
async def create_department(req: CreateDepartmentRequest, current: dict = Depends(get_current_user)):
    if current.get("role") != "admin":
        raise HTTPException(403, "Admins only")
    repos = get_repos()

    dept_id = (req.id or "").strip()
    if not dept_id:
        slug = re.sub(r'[^a-zA-Z0-9]+', '-', req.name_en.lower()).strip('-')
        dept_id = f"dept-{slug}"
    
    if repos["departments"].get(dept_id):
        raise HTTPException(400, f"Department ID '{dept_id}' already exists")
    
    new_dept = Department(
        id=dept_id,
        name_en=req.name_en.strip(),
        name_ta=req.name_ta.strip(),
        issue_types=req.issue_types,
        sla_hours=req.sla_hours
    )
    repos["departments"].create(new_dept)
    return new_dept

@router.delete("/departments/{dept_id}")
async def delete_department(dept_id: str, current: dict = Depends(get_current_user)):
    if current.get("role") != "admin":
        raise HTTPException(403, "Admins only")
    repos = get_repos()
    
    if dept_id in ["dept-roads", "dept-water", "dept-electric"]:
        raise HTTPException(400, "Core municipal departments cannot be deleted")
        
    ok = repos["departments"].delete(dept_id)
    if not ok:
        raise HTTPException(404, "Department not found")
    return {"message": f"Department '{dept_id}' removed successfully"}

@router.get("/analytics")
async def admin_analytics(current: dict = Depends(get_current_user)):
    if current.get("role") != "admin":
        raise HTTPException(403, "Admins only")
    from app.routers.officer import officer_analytics
    return await officer_analytics(current)
