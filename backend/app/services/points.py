POINTS_REPORT_ACCEPTED = 10
POINTS_SUPPORT_RECEIVED = 5
POINTS_SUPPORT_RECEIVED_CAP = 50
POINTS_RESOLVED = 20
POINTS_HELPFUL_COMMENT = 2

BADGE_DEFINITIONS = [
    {"id": "first_report", "name": "First Report", "desc": "Filed your first complaint"},
    {"id": "road_warrior", "name": "Road Warrior", "desc": "5 pothole reports"},
    {"id": "water_guardian", "name": "Water Guardian", "desc": "5 water leak reports"},
    {"id": "light_keeper", "name": "Light Keeper", "desc": "5 streetlight reports"},
    {"id": "community_voice", "name": "Community Voice", "desc": "25 supports given"},
    {"id": "fixer", "name": "Fixer", "desc": "3 of your reports resolved"},
]

def compute_badges(user_complaints, upvotes_given_count: int) -> list[str]:
    badges = []
    if len(user_complaints) >= 1:
        badges.append("first_report")
    pothole_count = sum(1 for c in user_complaints if c.issue_type == "pothole")
    water_count = sum(1 for c in user_complaints if c.issue_type == "water_leak")
    light_count = sum(1 for c in user_complaints if c.issue_type == "streetlight")
    resolved_count = sum(1 for c in user_complaints if c.status == "Resolved")
    if pothole_count >= 5: badges.append("road_warrior")
    if water_count >= 5: badges.append("water_guardian")
    if light_count >= 5: badges.append("light_keeper")
    if upvotes_given_count >= 25: badges.append("community_voice")
    if resolved_count >= 3: badges.append("fixer")
    return badges
