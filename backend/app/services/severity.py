from app.models import IssueType, Severity
from dataclasses import dataclass

@dataclass
class SeverityResult:
    severity: Severity
    reason: str

def calculate_severity(issue_type: str, area_ratio: float, count: int, main_road: bool) -> SeverityResult:
    if issue_type == "pothole":
        if area_ratio > 0.15 or count >= 3:
            return SeverityResult(Severity.High, "severity.reason.large_pothole_area")
        elif area_ratio > 0.05:
            return SeverityResult(Severity.Medium, "severity.reason.moderate_pothole")
        return SeverityResult(Severity.Low, "severity.reason.small_pothole")
    elif issue_type == "water_leak":
        if area_ratio > 0.25:
            return SeverityResult(Severity.High, "severity.reason.major_water_leak")
        elif area_ratio > 0.08:
            return SeverityResult(Severity.Medium, "severity.reason.moderate_water_leak")
        return SeverityResult(Severity.Low, "severity.reason.minor_water_leak")
    elif issue_type == "streetlight":
        if main_road or count >= 3:
            return SeverityResult(Severity.High, "severity.reason.main_road_streetlight")
        return SeverityResult(Severity.Medium, "severity.reason.streetlight_faulty")
    return SeverityResult(Severity.Low, "severity.reason.unknown")
