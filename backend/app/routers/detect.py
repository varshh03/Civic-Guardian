from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from pathlib import Path
import uuid, io
from PIL import Image

from app.config import get_settings
from app.security import get_current_user
from app.services.detector import detector
from app.services.severity import calculate_severity
from app.services.routing import route_complaint
from app.services.complaint_gen import generate_draft
from app.repos.json_repo import DepartmentRepo
from app.services.ratelimit import report_limiter

router = APIRouter()

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE = 8 * 1024 * 1024

@router.post("/detect")
async def detect_issue(
    file: UploadFile = File(...),
    main_road: bool = Form(False),
    address: str = Form(""),
    lang: str = Form("ta"),
    current: dict = Depends(get_current_user)
):
    if not report_limiter.is_allowed(current["sub"]):
        raise HTTPException(429, "Too many reports. Try again later.")
    
    content_type = file.content_type or ""
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Only JPG, PNG, and WEBP images are allowed")
    
    image_bytes = await file.read()
    
    if len(image_bytes) > MAX_SIZE:
        raise HTTPException(413, "Image too large. Maximum 8MB allowed.")
    
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()
        img = Image.open(io.BytesIO(image_bytes))
        content_type_actual = img.format
        if content_type_actual not in ["JPEG", "PNG", "WEBP"]:
            raise HTTPException(400, "Invalid image format")
    except Exception as e:
        if isinstance(e, HTTPException): raise
        raise HTTPException(400, "Invalid or corrupted image file")
    
    settings = get_settings()
    ext = {"JPEG": "jpg", "PNG": "png", "WEBP": "webp"}.get(img.format, "jpg")
    filename = f"{uuid.uuid4()}.{ext}"
    upload_path = Path(settings.upload_dir) / filename
    with open(upload_path, 'wb') as f:
        f.write(image_bytes)
    
    det = detector()
    result = await det.detect_async(image_bytes)
    
    if not result.is_valid or result.issue_type not in ["pothole", "water_leak", "streetlight"]:
        return {
            "image": filename,
            "is_valid": False,
            "ai_issue_type": "invalid",
            "issue_type": "invalid",
            "confidence": result.confidence,
            "area_ratio": 0.0,
            "count": 0,
            "detector_mode": result.mode,
            "severity": "Low",
            "severity_reason": "severity.reason.invalid",
            "department_id": None,
            "department": None,
            "title": "",
            "description": "",
            "draft_source": "ai",
            "needs_manual_category": True,
            "reason": result.reason or "This issue cannot be acknowledged because Civic Guardian is currently designed specifically for Roads, Water Supply, and Streetlight issues.",
            "message": "This issue cannot be acknowledged because Civic Guardian is currently designed specifically for Roads, Water Supply, and Streetlight issues.",
            "message_ta": "இந்த புகாரை ஏற்க முடியாது, ஏனெனில் சிவிக் கார்டியன் தற்போது சாலைகள், குடிநீர் வழங்கல் மற்றும் தெருவிளக்கு பிரச்சினைகளுக்காக மட்டுமே வடிவமைக்கப்பட்டுள்ளது."
        }

    issue_type = result.issue_type
    severity_result = calculate_severity(issue_type, result.area_ratio, result.count, main_road)
    
    dept_repo = DepartmentRepo(Path(settings.data_dir))
    departments = dept_repo.all()
    department_id = route_complaint(issue_type, departments)
    department = next((d for d in departments if d.id == department_id), None)
    
    draft = await generate_draft(issue_type, severity_result.severity, address, lang)
    
    needs_manual_category = result.confidence < 0.4
    
    return {
        "image": filename,
        "is_valid": True,
        "ai_issue_type": result.issue_type,
        "issue_type": issue_type,
        "confidence": result.confidence,
        "area_ratio": result.area_ratio,
        "count": result.count,
        "detector_mode": result.mode,
        "severity": severity_result.severity,
        "severity_reason": severity_result.reason,
        "department_id": department_id,
        "department": {"id": department.id, "name_en": department.name_en, "name_ta": department.name_ta} if department else None,
        "title": draft["title"],
        "description": draft["description"],
        "draft_source": draft["source"],
        "needs_manual_category": needs_manual_category,
    }

@router.post("/draft")
async def regenerate_draft(
    issue_type: str = Form(...),
    severity: str = Form(...),
    address: str = Form(""),
    lang: str = Form("ta"),
    current: dict = Depends(get_current_user)
):
    if issue_type not in ["pothole", "water_leak", "streetlight"]:
        raise HTTPException(400, "Invalid issue type for draft generation")
    draft = await generate_draft(issue_type, severity, address, lang)
    
    severity_result = calculate_severity(issue_type, 0.1, 1, False)
    
    settings = get_settings()
    dept_repo = DepartmentRepo(Path(settings.data_dir))
    departments = dept_repo.all()
    department_id = route_complaint(issue_type, departments)
    department = next((d for d in departments if d.id == department_id), None)
    
    return {
        "is_valid": True,
        "issue_type": issue_type,
        "severity": severity or severity_result.severity,
        "severity_reason": severity_result.reason,
        "department_id": department_id,
        "department": {"id": department.id, "name_en": department.name_en, "name_ta": department.name_ta} if department else None,
        "title": draft["title"],
        "description": draft["description"],
        "draft_source": draft["source"],
    }
