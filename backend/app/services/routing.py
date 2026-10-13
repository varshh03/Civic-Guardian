def route_complaint(issue_type: str, departments) -> str | None:
    """Return department_id for the given issue type."""
    for dept in departments:
        if issue_type in dept.issue_types:
            return dept.id
    return None
