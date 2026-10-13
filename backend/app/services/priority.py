from dataclasses import dataclass
from datetime import datetime, timezone
from app.models import Complaint, Severity

@dataclass
class PriorityBreakdown:
    total: int
    severity_score: int
    upvote_score: int
    sla_pressure: int
    overdue_bonus: int
    location_bonus: int
    is_overdue: bool

def calculate_priority(complaint: Complaint, sla_hours: int) -> PriorityBreakdown:
    severity_map = {Severity.High: 40, Severity.Medium: 20, Severity.Low: 5}
    severity_score = severity_map[complaint.severity]
    
    upvote_score = min(len(complaint.upvotes) * 2, 20)
    
    now = datetime.now(timezone.utc)
    created = complaint.created_at
    if created.tzinfo is None:
        created = created.replace(tzinfo=timezone.utc)
    elapsed_hours = (now - created).total_seconds() / 3600
    sla_ratio = min(elapsed_hours / sla_hours, 1.0)
    sla_pressure = int(sla_ratio * 30)
    
    is_overdue = elapsed_hours > sla_hours
    overdue_bonus = 15 if is_overdue else 0
    location_bonus = 5 if complaint.main_road else 0
    
    total = severity_score + upvote_score + sla_pressure + overdue_bonus + location_bonus
    return PriorityBreakdown(
        total=total,
        severity_score=severity_score,
        upvote_score=upvote_score,
        sla_pressure=sla_pressure,
        overdue_bonus=overdue_bonus,
        location_bonus=location_bonus,
        is_overdue=is_overdue
    )
