import math
from app.models import Complaint, ComplaintStatus

def haversine_m(lat1, lng1, lat2, lng2) -> float:
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

OPEN_STATUSES = {ComplaintStatus.Submitted, ComplaintStatus.Acknowledged, ComplaintStatus.InProgress}

def find_duplicate(complaints: list[Complaint], issue_type: str, lat: float, lng: float, threshold_m: float = 30) -> tuple[Complaint, float] | None:
    candidates = [
        c for c in complaints
        if c.issue_type == issue_type and c.status in OPEN_STATUSES
    ]
    best = None
    best_dist = float('inf')
    for c in candidates:
        dist = haversine_m(lat, lng, c.lat, c.lng)
        if dist <= threshold_m and dist < best_dist:
            best = c
            best_dist = dist
    return (best, best_dist) if best else None
