def route_complaint(issue_type: str, departments) -> str | None:
    for dept in departments:
        if issue_type in dept.issue_types:
            return dept.id
    return None
