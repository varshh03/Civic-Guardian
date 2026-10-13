from pydantic import BaseModel
from enum import Enum
from datetime import datetime

class UserRole(str, Enum): 
    citizen = "citizen"
    officer = "officer"
    admin = "admin"

class User(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    password: str
    role: UserRole = UserRole.citizen
    department_id: str | None = None
    language: str = "ta"
    avatar: str | None = None
    points: int = 0
    badges: list[str] = []
    active: bool = True
    created_at: datetime

class IssueType(str, Enum): 
    pothole = "pothole"
    water_leak = "water_leak"
    streetlight = "streetlight"

class Severity(str, Enum): 
    Low = "Low"
    Medium = "Medium"
    High = "High"

class ComplaintStatus(str, Enum): 
    Submitted = "Submitted"
    Acknowledged = "Acknowledged"
    InProgress = "In Progress"
    Resolved = "Resolved"
    Rejected = "Rejected"

class HistoryEntry(BaseModel): 
    status: ComplaintStatus
    at: datetime
    by: str
    note: str = ""

class Verification(BaseModel): 
    ai_confidence: float
    exif_gps_match: bool | None = None
    duplicate_checked: bool = False
    needs_review: bool = False

class TextContent(BaseModel): 
    title: str
    description: str

class Complaint(BaseModel):
    id: str
    user_id: str
    issue_type: IssueType
    severity: Severity
    severity_reason: str
    title: str
    description: str
    language: str
    text_original: TextContent
    text_en: TextContent
    image: str
    resolution_image: str | None = None
    lat: float
    lng: float
    address: str
    location_source: str = "gps"
    main_road: bool = False
    department_id: str
    status: ComplaintStatus = ComplaintStatus.Submitted
    history: list[HistoryEntry] = []
    upvotes: list[str] = []
    followers: list[str] = []
    ai_issue_type: str | None = None
    ai_confidence: float = 0.0
    detector_mode: str = "stub"
    verification: Verification
    duplicate_of: str | None = None
    created_at: datetime
    updated_at: datetime
    resolved_at: datetime | None = None

class Comment(BaseModel):
    id: str
    complaint_id: str
    user_id: str
    parent_id: str | None = None
    text: str
    is_official: bool = False
    helpful: list[str] = []
    created_at: datetime
    edited_at: datetime | None = None

class Notification(BaseModel):
    id: str
    user_id: str
    type: str
    complaint_id: str | None = None
    actor_id: str | None = None
    message_key: str
    params: dict = {}
    read: bool = False
    created_at: datetime

class Activity(BaseModel):
    id: str
    user_id: str
    type: str
    complaint_id: str | None = None
    created_at: datetime

class Department(BaseModel):
    id: str
    name_en: str
    name_ta: str
    issue_types: list[str]
    sla_hours: int
