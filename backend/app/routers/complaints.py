from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from pathlib import Path
from datetime import datetime, timezone
import uuid

from app.config import get_settings
from app.models import Complaint, ComplaintStatus, HistoryEntry, TextContent, Verification, IssueType, Severity
from app.repos.json_repo import ComplaintRepo, UserRepo, DepartmentRepo, NotificationRepo, ActivityRepo
from app.security import get_current_user, get_optional_current_user, require_role
from app.services.duplicates import find_duplicate
from app.services.severity import calculate_severity
from app.services.routing import route_complaint
from app.services.verification import verify_image
from app.services.complaint_gen import translate_to_english
from app.services.priority import calculate_priority
from app.services.points import POINTS_REPORT_ACCEPTED, POINTS_RESOLVED, POINTS_SUPPORT_RECEIVED, POINTS_SUPPORT_RECEIVED_CAP

router = APIRouter()

VALID_TRANSITIONS = {
    ComplaintStatus.Submitted: {ComplaintStatus.Acknowledged, ComplaintStatus.InProgress, ComplaintStatus.Resolved, ComplaintStatus.Rejected},
    ComplaintStatus.Acknowledged: {ComplaintStatus.InProgress, ComplaintStatus.Resolved, ComplaintStatus.Rejected},
    ComplaintStatus.InProgress: {ComplaintStatus.Resolved, ComplaintStatus.Acknowledged, ComplaintStatus.Rejected},
    ComplaintStatus.Resolved: {ComplaintStatus.InProgress, ComplaintStatus.Acknowledged},
    ComplaintStatus.Rejected: {ComplaintStatus.Submitted, ComplaintStatus.Acknowledged, ComplaintStatus.InProgress},
}

def get_repos():
    data_dir = Path(get_settings().data_dir)
    return {
        "complaints": ComplaintRepo(data_dir),
        "users": UserRepo(data_dir),
        "departments": DepartmentRepo(data_dir),
        "notifications": NotificationRepo(data_dir),
        "activity": ActivityRepo(data_dir),
    }

def complaint_to_response(c: Complaint, current_user_id: str | None = None) -> dict:
    d = c.model_dump()
    d["upvote_count"] = len(c.upvotes)
    d["follower_count"] = len(c.followers)
    if current_user_id:
        d["is_upvoted"] = current_user_id in c.upvotes
        d["is_following"] = current_user_id in c.followers
    else:
        d["is_upvoted"] = False
        d["is_following"] = False
    return d

@router.post("", status_code=201)
async def create_complaint(
    image: str = Form(...),
    issue_type: str = Form(...),
    severity: str = Form(...),
    severity_reason: str = Form(""),
    title: str = Form(...),
    description: str = Form(...),
    language: str = Form("ta"),
    lat: float = Form(...),
    lng: float = Form(...),
    address: str = Form(""),
    location_source: str = Form("gps"),
    main_road: bool = Form(False),
    ai_issue_type: str = Form(""),
    ai_confidence: float = Form(0.0),
    detector_mode: str = Form("stub"),
    force: bool = Form(False),
    current: dict = Depends(get_current_user)
):
    settings = get_settings()
    repos = get_repos()
    
    if issue_type in ["invalid", "unrelated", "unknown"] or issue_type not in ["pothole", "water_leak", "streetlight"]:
        raise HTTPException(
            400,
            "This issue cannot be acknowledged because Civic Guardian is currently designed specifically for Roads, Water Supply, and Streetlight issues."
        )

    try:
        issue_type_enum = IssueType(issue_type)
        severity_enum = Severity(severity)
    except ValueError:
        raise HTTPException(422, "Invalid issue_type or severity")
    
    all_complaints = repos["complaints"].all()
    dup = find_duplicate(all_complaints, issue_type, lat, lng)
    if dup and not force:
        dup_complaint, dist = dup
        raise HTTPException(409, {
            "message": "Duplicate complaint detected",
            "existing": complaint_to_response(dup_complaint, current["sub"]),
            "distance_m": round(dist, 1)
        })
    
    departments = repos["departments"].all()
    department_id = route_complaint(issue_type, departments)
    if not department_id:
        raise HTTPException(400, "No department found for this issue type")
    
    image_path = Path(settings.upload_dir) / image
    image_bytes = b""
    if image_path.exists():
        image_bytes = image_path.read_bytes()
    
    verification = verify_image(image_bytes, lat, lng, ai_confidence)
    text_en = await translate_to_english(title, description, language)
    
    year = datetime.now(timezone.utc).year
    complaint_id = repos["complaints"].next_id(year)
    
    now = datetime.now(timezone.utc)
    complaint = Complaint(
        id=complaint_id,
        user_id=current["sub"],
        issue_type=issue_type_enum,
        severity=severity_enum,
        severity_reason=severity_reason or f"severity.reason.{issue_type}",
        title=title,
        description=description,
        language=language,
        text_original=TextContent(title=title, description=description),
        text_en=TextContent(title=text_en["title"], description=text_en["description"]),
        image=image,
        lat=lat,
        lng=lng,
        address=address,
        location_source=location_source,
        main_road=main_road,
        department_id=department_id,
        status=ComplaintStatus.Submitted,
        history=[HistoryEntry(status=ComplaintStatus.Submitted, at=now, by=current["sub"], note="")],
        ai_issue_type=ai_issue_type or None,
        ai_confidence=ai_confidence,
        detector_mode=detector_mode,
        verification=verification,
        duplicate_of=dup[0].id if (dup and force) else None,
        created_at=now,
        updated_at=now,
    )
    repos["complaints"].create(complaint)
    
    repos["users"].mutate(current["sub"], lambda u: (setattr(u, 'points', u.points + POINTS_REPORT_ACCEPTED), u)[1])
    repos["activity"].create(__import__('app.models', fromlist=['Activity']).Activity(
        id=str(uuid.uuid4()), user_id=current["sub"], type="report", complaint_id=complaint_id, created_at=now
    ))
    
    return complaint_to_response(complaint, current["sub"])

@router.get("")
async def list_complaints(
    status: str | None = Query(None),
    type: str | None = Query(None),
    severity: str | None = Query(None),
    department: str | None = Query(None),
    q: str | None = Query(None),
    sort: str = Query("latest"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    repos = get_repos()
    complaints = repos["complaints"].all()
    
    if status: complaints = [c for c in complaints if c.status == status]
    if type: complaints = [c for c in complaints if c.issue_type == type]
    if severity: complaints = [c for c in complaints if c.severity == severity]
    if department: complaints = [c for c in complaints if c.department_id == department]
    if q: complaints = [c for c in complaints if q.lower() in c.title.lower() or q.lower() in c.description.lower() or q.lower() in c.id.lower()]
    
    if sort == "latest":
        complaints.sort(key=lambda c: c.created_at, reverse=True)
    elif sort == "upvotes":
        complaints.sort(key=lambda c: len(c.upvotes), reverse=True)
    elif sort == "priority":
        dept_map = {d.id: d.sla_hours for d in repos["departments"].all()}
        complaints.sort(key=lambda c: calculate_priority(c, dept_map.get(c.department_id, 72)).total, reverse=True)
    
    total = len(complaints)
    start = (page - 1) * limit
    complaints = complaints[start:start+limit]
    
    return {"total": total, "page": page, "limit": limit, "items": [complaint_to_response(c) for c in complaints]}

@router.get("/feed")
async def get_feed(
    tab: str = Query("latest"),
    lat: float | None = Query(None),
    lng: float | None = Query(None),
    type: str | None = Query(None),
    status: str | None = Query(None),
    department: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    current: dict | None = Depends(get_optional_current_user)
):
    from app.services.duplicates import haversine_m
    from datetime import timedelta
    repos = get_repos()
    complaints = repos["complaints"].all()
    
    officer_dept_id = None
    if current and "sub" in current:
        user = repos["users"].get(current["sub"])
        if user and user.role == "officer" and user.department_id:
            officer_dept_id = user.department_id

    if officer_dept_id:
        complaints = [c for c in complaints if c.department_id == officer_dept_id]
    elif department:
        complaints = [c for c in complaints if c.department_id == department]
    
    if type: complaints = [c for c in complaints if c.issue_type == type]
    if status: complaints = [c for c in complaints if c.status == status]
    
    now = datetime.now(timezone.utc)
    
    if tab == "nearby" and lat and lng:
        complaints = [c for c in complaints if haversine_m(lat, lng, c.lat, c.lng) <= 5000]
        complaints.sort(key=lambda c: haversine_m(lat, lng, c.lat, c.lng))
    elif tab == "trending":
        week_ago = now - timedelta(days=7)
        complaints = [c for c in complaints if c.created_at >= week_ago or (c.created_at.tzinfo and c.created_at >= week_ago)]
        complaints.sort(key=lambda c: len(c.upvotes), reverse=True)
    elif tab == "following" and current and "sub" in current:
        complaints = [c for c in complaints if current["sub"] in c.followers]
        complaints.sort(key=lambda c: c.updated_at, reverse=True)
    else:
        complaints.sort(key=lambda c: c.created_at, reverse=True)
        
    start = (page - 1) * limit
    complaints = complaints[start:start+limit]
    
    user_id = current["sub"] if current and "sub" in current else None
    return {"page": page, "limit": limit, "items": [complaint_to_response(c, user_id) for c in complaints]}

@router.get("/mine")
async def my_complaints(current: dict = Depends(get_current_user)):
    repos = get_repos()
    complaints = repos["complaints"].filter(lambda c: c.user_id == current["sub"])
    complaints.sort(key=lambda c: c.created_at, reverse=True)
    return [complaint_to_response(c, current["sub"]) for c in complaints]

@router.get("/{complaint_id}")
async def get_complaint(complaint_id: str, current: dict | None = Depends(get_optional_current_user)):
    repos = get_repos()
    c = repos["complaints"].get(complaint_id)
    if not c:
        raise HTTPException(404, "Complaint not found")
    user_id = current["sub"] if current and "sub" in current else None
    return complaint_to_response(c, user_id)

@router.post("/{complaint_id}/upvote")
async def toggle_upvote(complaint_id: str, current: dict = Depends(get_current_user)):
    repos = get_repos()
    user_id = current["sub"]
    
    def mutate(c: Complaint) -> Complaint:
        if user_id in c.upvotes:
            c.upvotes.remove(user_id)
        else:
            c.upvotes.append(user_id)
        c.updated_at = datetime.now(timezone.utc)
        return c
    
    complaint = repos["complaints"].mutate(complaint_id, mutate)
    if not complaint:
        raise HTTPException(404, "Complaint not found")
    
    is_upvoted = user_id in complaint.upvotes
    if is_upvoted and complaint.user_id != user_id:
        from app.models import Notification
        repos["notifications"].create(Notification(
            id=str(uuid.uuid4()),
            user_id=complaint.user_id,
            type="support",
            complaint_id=complaint_id,
            actor_id=user_id,
            message_key="notification.new_support",
            params={"id": complaint_id},
            created_at=datetime.now(timezone.utc)
        ))
    return {"upvotes": len(complaint.upvotes), "is_upvoted": is_upvoted}

@router.post("/{complaint_id}/follow")
async def toggle_follow(complaint_id: str, current: dict = Depends(get_current_user)):
    repos = get_repos()
    user_id = current["sub"]
    
    def mutate(c: Complaint) -> Complaint:
        if user_id in c.followers:
            c.followers.remove(user_id)
        else:
            c.followers.append(user_id)
        c.updated_at = datetime.now(timezone.utc)
        return c
    
    complaint = repos["complaints"].mutate(complaint_id, mutate)
    if not complaint:
        raise HTTPException(404, "Complaint not found")
    return {"followers": len(complaint.followers), "is_following": user_id in complaint.followers}

@router.post("/{complaint_id}/confirm")
async def confirm_fixed(complaint_id: str, current: dict = Depends(get_current_user)):
    repos = get_repos()
    c = repos["complaints"].get(complaint_id)
    if not c: raise HTTPException(404, "Complaint not found")
    if c.user_id != current["sub"]: raise HTTPException(403, "Only the complaint owner can confirm")
    if c.status != ComplaintStatus.Resolved: raise HTTPException(400, "Complaint is not resolved yet")
    return {"message": "Fix confirmed. Thank you!"}

@router.post("/{complaint_id}/reopen")
async def reopen_complaint(complaint_id: str, note: str = Form(""), current: dict = Depends(get_current_user)):
    repos = get_repos()
    c = repos["complaints"].get(complaint_id)
    if not c: raise HTTPException(404, "Complaint not found")
    if c.user_id != current["sub"]: raise HTTPException(403, "Only the complaint owner can reopen")
    if c.status != ComplaintStatus.Resolved: raise HTTPException(400, "Can only reopen resolved complaints")
    
    now = datetime.now(timezone.utc)
    def mutate(c: Complaint) -> Complaint:
        c.status = ComplaintStatus.InProgress
        c.history.append(HistoryEntry(status=ComplaintStatus.InProgress, at=now, by=current["sub"], note=note or "Reopened by citizen - issue persists"))
        c.updated_at = now
        c.resolved_at = None
        return c
    
    complaint = repos["complaints"].mutate(complaint_id, mutate)
    return complaint_to_response(complaint, current["sub"])

@router.patch("/{complaint_id}/status")
async def update_status(
    complaint_id: str,
    status: str = Form(...),
    note: str = Form(""),
    resolution_image: UploadFile | None = File(None),
    current: dict = Depends(get_current_user)
):
    if current["role"] not in ["officer", "admin"]:
        raise HTTPException(403, "Officers only")
    
    repos = get_repos()
    c = repos["complaints"].get(complaint_id)
    if not c: raise HTTPException(404, "Complaint not found")
    
    if current["role"] == "officer":
        user = repos["users"].get(current["sub"])
        if user and user.department_id and user.department_id != c.department_id:
            raise HTTPException(403, "You can only update complaints in your department")
    
    status_str = status.strip()
    if status_str == "InProgress":
        status_str = "In Progress"

    try:
        new_status = ComplaintStatus(status_str)
    except ValueError:
        raise HTTPException(422, f"Invalid status: {status}")
    
    if new_status != c.status and new_status not in VALID_TRANSITIONS.get(c.status, set()):
        raise HTTPException(400, f"Invalid transition: {c.status} -> {new_status}")
    
    settings = get_settings()
    resolution_filename = None
    if new_status == ComplaintStatus.Resolved and resolution_image and resolution_image.filename:
        try:
            res_bytes = await resolution_image.read()
            if len(res_bytes) > 0:
                res_filename = f"res_{uuid.uuid4()}.jpg"
                (Path(settings.upload_dir) / res_filename).write_bytes(res_bytes)
                resolution_filename = res_filename
        except Exception:
            pass
    
    now = datetime.now(timezone.utc)
    def mutate(c: Complaint) -> Complaint:
        prev_status = c.status
        c.status = new_status
        c.history.append(HistoryEntry(status=new_status, at=now, by=current["sub"], note=note))
        c.updated_at = now
        if new_status == ComplaintStatus.Resolved:
            c.resolved_at = now
            if resolution_filename:
                c.resolution_image = resolution_filename
        elif prev_status == ComplaintStatus.Resolved and new_status != ComplaintStatus.Resolved:
            c.resolved_at = None
        return c
    
    complaint = repos["complaints"].mutate(complaint_id, mutate)
    
    from app.models import Notification
    notify_users = list(set(complaint.followers + [complaint.user_id]))
    for uid in notify_users:
        if uid != current["sub"]:
            repos["notifications"].create(Notification(
                id=str(uuid.uuid4()),
                user_id=uid,
                type="status_changed",
                complaint_id=complaint_id,
                actor_id=current["sub"],
                message_key="notification.status_changed",
                params={"status": new_status, "id": complaint_id},
                created_at=now
            ))
    
    if new_status == ComplaintStatus.Resolved:
        repos["users"].mutate(complaint.user_id, lambda u: (setattr(u, 'points', u.points + 20), u)[1])
    
    return complaint_to_response(complaint, current["sub"])
