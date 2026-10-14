from fastapi import APIRouter, Query, HTTPException
from pathlib import Path
from datetime import datetime, timezone, timedelta
from app.config import get_settings
from app.repos.json_repo import UserRepo, ComplaintRepo

router = APIRouter()

def get_repos():
    data_dir = Path(get_settings().data_dir)
    return {
        "users": UserRepo(data_dir),
        "complaints": ComplaintRepo(data_dir),
    }

@router.get("/leaderboard")
async def leaderboard(period: str = Query("month")):
    repos = get_repos()
    users = [u for u in repos["users"].all() if u.role == "citizen" and u.active]
    complaints = repos["complaints"].all()
    
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(days=30) if period == "month" else datetime.min.replace(tzinfo=timezone.utc)
    
    def parse_dt(dt):
        if dt is None: return None
        if isinstance(dt, datetime):
            return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
        return datetime.fromisoformat(str(dt).replace("Z", "+00:00"))
        
    user_scores = []
    for user in users:
        user_complaints = [c for c in complaints if c.user_id == user.id]
        if period == "month":
            user_complaints = [c for c in user_complaints if parse_dt(c.created_at) and parse_dt(c.created_at) >= cutoff]
            
        total_reports = len(user_complaints)
        total_resolved = sum(1 for c in user_complaints if c.status == "Resolved")
        total_supports = sum(len(c.upvotes) for c in user_complaints)
        
        if period == "month":
            points = (total_reports * 10) + (total_resolved * 20) + min(total_supports * 5, 50)
        else:
            points = max(user.points, (total_reports * 10) + (total_resolved * 20) + min(total_supports * 5, 50))
        
        user_scores.append({
            "id": user.id,
            "user_id": user.id,
            "name": user.name,
            "points": points,
            "badges": user.badges,
            "total_reports": total_reports,
            "resolved_count": total_resolved,
            "supports_received": total_supports,
        })
        
    user_scores.sort(key=lambda x: (x["points"], x["resolved_count"], x["total_reports"]), reverse=True)
    return {"period": period, "users": user_scores[:20]}

@router.get("/users/{user_id}/public")
async def public_profile(user_id: str):
    repos = get_repos()
    user = repos["users"].get(user_id)
    if not user:
        raise HTTPException(404, "User not found")
        
    complaints = repos["complaints"].filter(lambda c: c.user_id == user_id)
    first_name = user.name.split()[0] if user.name else "Citizen"
    
    return {
        "id": user.id,
        "name": first_name,
        "points": user.points,
        "badges": user.badges,
        "total_reports": len(complaints),
        "resolved_count": sum(1 for c in complaints if c.status == "Resolved"),
        "created_at": user.created_at,
    }
