from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pathlib import Path
from datetime import datetime, timezone, timedelta
import csv
import io

from app.config import get_settings
from app.repos.json_repo import ComplaintRepo, UserRepo, DepartmentRepo
from app.security import get_current_user
from app.services.priority import calculate_priority
from app.models import ComplaintStatus

router = APIRouter()

def get_repos():
    data_dir = Path(get_settings().data_dir)
    return {
        "complaints": ComplaintRepo(data_dir),
        "users": UserRepo(data_dir),
        "departments": DepartmentRepo(data_dir),
    }

@router.get("/queue")
async def officer_queue(
    status: str | None = Query(None),
    type: str | None = Query(None),
    severity: str | None = Query(None),
    overdue: bool | None = Query(None),
    needs_review: bool | None = Query(None),
    sort: str = Query("priority"),
    current: dict = Depends(get_current_user)
):
    if current.get("role") not in ["officer", "admin"]:
        raise HTTPException(403, "Officers and Admins only")
    
    repos = get_repos()
    user = repos["users"].get(current["sub"])
    complaints = repos["complaints"].all()
    
    if current.get("role") == "officer" and user and user.department_id:
        complaints = [c for c in complaints if c.department_id == user.department_id]
    
    if status == "active":
        complaints = [c for c in complaints if c.status not in [ComplaintStatus.Resolved, ComplaintStatus.Rejected]]
    elif status == "all":
        pass
    elif status:
        complaints = [c for c in complaints if c.status == status]
    else:
        complaints = [c for c in complaints if c.status not in [ComplaintStatus.Resolved, ComplaintStatus.Rejected]]
        
    if type and type != "all":
        complaints = [c for c in complaints if c.issue_type == type]
    if severity and severity != "all":
        complaints = [c for c in complaints if c.severity == severity]
    if needs_review is not None:
        complaints = [c for c in complaints if c.verification.needs_review == needs_review]
        
    dept_map = {d.id: d.sla_hours for d in repos["departments"].all()}
    
    result = []
    for c in complaints:
        sla_hours = dept_map.get(c.department_id, 72)
        priority = calculate_priority(c, sla_hours)
        if overdue is not None and priority.is_overdue != overdue:
            continue
        d = c.model_dump()
        d["priority"] = priority.__dict__
        d["priority_score"] = priority.total
        d["sla_hours"] = sla_hours
        d["upvote_count"] = len(c.upvotes)
        d["follower_count"] = len(c.followers)
        result.append(d)
        
    if sort == "priority":
        result.sort(key=lambda x: x["priority"]["total"], reverse=True)
    elif sort == "date":
        result.sort(key=lambda x: x["created_at"], reverse=True)
    elif sort == "supporters" or sort == "upvotes":
        result.sort(key=lambda x: x["upvote_count"], reverse=True)
        
    return {"items": result, "total": len(result)}

@router.get("/analytics")
async def officer_analytics(current: dict = Depends(get_current_user)):
    repos = get_repos()
    user = repos["users"].get(current["sub"])
    complaints = repos["complaints"].all()
    
    if current.get("role") == "officer" and user and user.department_id:
        complaints = [c for c in complaints if c.department_id == user.department_id]
        
    total = len(complaints)
    open_count = sum(1 for c in complaints if c.status not in [ComplaintStatus.Resolved, ComplaintStatus.Rejected])
    resolved_count = sum(1 for c in complaints if c.status == ComplaintStatus.Resolved)
    
    dept_map = {d.id: d.sla_hours for d in repos["departments"].all()}
    overdue_count = 0
    resolved_hours = []
    
    now = datetime.now(timezone.utc)
    one_week_ago = now - timedelta(days=7)
    resolved_this_week = 0
    
    for c in complaints:
        sla = dept_map.get(c.department_id, 72)
        p = calculate_priority(c, sla)
        if p.is_overdue and c.status not in [ComplaintStatus.Resolved, ComplaintStatus.Rejected]:
            overdue_count += 1
            
        if c.status == ComplaintStatus.Resolved and c.resolved_at:
            created = c.created_at if c.created_at.tzinfo else c.created_at.replace(tzinfo=timezone.utc)
            resolved = c.resolved_at if c.resolved_at.tzinfo else c.resolved_at.replace(tzinfo=timezone.utc)
            diff_hours = (resolved - created).total_seconds() / 3600
            resolved_hours.append(diff_hours)
            if resolved >= one_week_ago:
                resolved_this_week += 1
                
    avg_resolution = (sum(resolved_hours) / len(resolved_hours)) if resolved_hours else 24.0
    
    by_type = {}
    for c in complaints:
        by_type[c.issue_type] = by_type.get(c.issue_type, 0) + 1
        
    by_status = {}
    for c in complaints:
        by_status[c.status] = by_status.get(c.status, 0) + 1
        
    by_severity = {}
    for c in complaints:
        by_severity[c.severity] = by_severity.get(c.severity, 0) + 1
        
    return {
        "total": total,
        "open": open_count,
        "overdue": overdue_count,
        "resolved": resolved_count,
        "resolved_this_week": resolved_this_week,
        "avg_resolution_hours": round(avg_resolution, 1),
        "by_type": by_type,
        "by_status": by_status,
        "by_severity": by_severity
    }

@router.get("/heatmap")
async def heatmap_data(current: dict = Depends(get_current_user)):
    repos = get_repos()
    complaints = repos["complaints"].all()
    open_complaints = [c for c in complaints if c.status not in [ComplaintStatus.Resolved, ComplaintStatus.Rejected]]
    
    points = []
    for c in open_complaints:
        weight = 1.0
        if c.severity == "High": weight = 2.0
        elif c.severity == "Medium": weight = 1.5
        weight += len(c.upvotes) * 0.2
        points.append({"lat": c.lat, "lng": c.lng, "weight": round(weight, 2)})
        
    return {"points": points}

@router.get("/export/csv")
async def export_csv(current: dict = Depends(get_current_user)):
    if current.get("role") not in ["officer", "admin"]:
        raise HTTPException(403, "Officers and Admins only")
        
    repos = get_repos()
    user = repos["users"].get(current["sub"])
    complaints = repos["complaints"].all()
    
    if current.get("role") == "officer" and user and user.department_id:
        complaints = [c for c in complaints if c.department_id == user.department_id]
        
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Title", "Issue Type", "Severity", "Status", "Address", "Latitude", "Longitude",
        "Main Road", "Upvotes", "Created At", "Resolved At"
    ])
    
    for c in complaints:
        writer.writerow([
            c.id, c.title, c.issue_type, c.severity, c.status, c.address, c.lat, c.lng,
            c.main_road, len(c.upvotes), c.created_at, c.resolved_at or ""
        ])
        
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=complaints_export_{datetime.now().strftime('%Y%m%d')}.csv"}
    )
