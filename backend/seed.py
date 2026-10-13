"""Demo data seeder for AI Civic Guardian - Karur Municipality."""
import json, uuid, random, sys
from pathlib import Path
from datetime import datetime, timezone, timedelta
from PIL import Image, ImageDraw
import hashlib

DATA_DIR = Path("data")
UPLOAD_DIR = Path("uploads")
DATA_DIR.mkdir(exist_ok=True)
UPLOAD_DIR.mkdir(exist_ok=True)

sys.path.insert(0, str(Path(__file__).parent))

def gen_id(): return str(uuid.uuid4())

def now_minus(days=0, hours=0):
    return (datetime.now(timezone.utc) - timedelta(days=days, hours=hours)).isoformat()

random.seed(42)

from app.security import hash_password

def write_json(filename, data):
    path = DATA_DIR / filename
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2, default=str)
    print(f"  Written {len(data) if isinstance(data, list) else '1 record'} -> {path}")

def create_placeholder_image(issue_type: str, index: int) -> str:
    colors = {"pothole": (139, 90, 43), "water_leak": (30, 100, 200), "streetlight": (220, 180, 40)}
    bg = colors.get(issue_type, (100, 100, 100))
    img = Image.new('RGB', (640, 480), color=(200, 200, 200))
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 200, 640, 480], fill=(160, 160, 160))
    if issue_type == "pothole":
        for i in range(3):
            x = 200 + i*80
            draw.ellipse([x, 280, x+80, 360], fill=bg)
    elif issue_type == "water_leak":
        for i in range(5):
            draw.ellipse([280+i*5, 200+i*30, 320+i*5, 240+i*30], fill=bg)
    elif issue_type == "streetlight":
        draw.rectangle([295, 50, 345, 300], fill=(80, 80, 80))
        draw.ellipse([270, 30, 370, 100], fill=bg)
    draw.rectangle([0, 430, 640, 480], fill=(0, 0, 0))
    draw.text((10, 440), f"[DEMO] {issue_type.upper()} #{index:02d}", fill=(255, 255, 255))
    filename = f"demo_{issue_type}_{index:02d}.jpg"
    img.save(UPLOAD_DIR / filename, "JPEG", quality=85)
    return filename

departments = [
    {"id": "dept-roads", "name_en": "Highways & Roads", "name_ta": "\u0ba8\u0bc6\u0b9f\u0bc1\u0b9e\u0bcd\u0b9a\u0bbe\u0bb2\u0bc8 \u0bae\u0bb1\u0bcd\u0bb1\u0bc1\u0bae\u0bcd \u0b9a\u0bbe\u0bb2\u0bc8\u0b95\u0bb3\u0bcd", "issue_types": ["pothole"], "sla_hours": 72},
    {"id": "dept-water", "name_en": "Water Supply & Drainage", "name_ta": "\u0ba8\u0bc0\u0bb0\u0bcd \u0bb5\u0bb4\u0b99\u0bcd\u0b95\u0bb2\u0bcd \u0bae\u0bb1\u0bcd\u0bb1\u0bc1\u0bae\u0bcd \u0bb5\u0b9f\u0bbf\u0b95\u0bbe\u0bb2\u0bcd", "issue_types": ["water_leak"], "sla_hours": 24},
    {"id": "dept-electric", "name_en": "Electrical (Street Lighting)", "name_ta": "\u0bae\u0bbf\u0ba9\u0bcd\u0b9a\u0bbe\u0bb0 (\u0ba4\u0bc6\u0bb0\u0bc1 \u0bb5\u0bbf\u0bb3\u0b95\u0bcd\u0b95\u0bc1)", "issue_types": ["streetlight"], "sla_hours": 48},
]

print("\n Generating placeholder images...")
images = {it: [create_placeholder_image(it, i) for i in range(1, 16)] for it in ["pothole", "water_leak", "streetlight"]}

admin_id = "usr-admin-001"
officer_roads_id = "usr-off-roads"
officer_water_id = "usr-off-water"
officer_elec_id = "usr-off-elec"
citizen_ids = [f"usr-cit-{i:03d}" for i in range(1, 9)]

users = [
    {"id": admin_id, "name": "Admin Karur", "email": "admin@karurmc.gov.in", "phone": "9876543210",
     "password": hash_password("Admin@1234"), "role": "admin", "department_id": None, "language": "en",
     "avatar": None, "points": 0, "badges": [], "active": True, "created_at": now_minus(90)},
    {"id": officer_roads_id, "name": "Rajan Kumar", "email": "officer.roads@karurmc.gov.in", "phone": "9876543211",
     "password": hash_password("Officer@1234"), "role": "officer", "department_id": "dept-roads", "language": "en",
     "avatar": None, "points": 0, "badges": [], "active": True, "created_at": now_minus(90)},
    {"id": officer_water_id, "name": "Meena Devi", "email": "officer.water@karurmc.gov.in", "phone": "9876543212",
     "password": hash_password("Officer@1234"), "role": "officer", "department_id": "dept-water", "language": "en",
     "avatar": None, "points": 0, "badges": [], "active": True, "created_at": now_minus(90)},
    {"id": officer_elec_id, "name": "Suresh Babu", "email": "officer.electric@karurmc.gov.in", "phone": "9876543213",
     "password": hash_password("Officer@1234"), "role": "officer", "department_id": "dept-electric", "language": "en",
     "avatar": None, "points": 0, "badges": [], "active": True, "created_at": now_minus(90)},
    {"id": citizen_ids[0], "name": "\u0bae\u0bc1\u0bb0\u0bc1\u0b95\u0ba9\u0bcd \u0b9a\u0bc6\u0bb2\u0bcd\u0bb5\u0bae\u0bcd", "email": "murugan@example.com", "phone": "9500000001",
     "password": hash_password("Citizen@1234"), "role": "citizen", "department_id": None, "language": "ta",
     "avatar": None, "points": 85, "badges": ["first_report", "road_warrior"], "active": True, "created_at": now_minus(60)},
    {"id": citizen_ids[1], "name": "\u0baa\u0bbf\u0bb0\u0bbf\u0baf\u0bbe \u0bb2\u0b9f\u0bcd\u0b9a\u0bc1\u0bae\u0bbf", "email": "priya@example.com", "phone": "9500000002",
     "password": hash_password("Citizen@1234"), "role": "citizen", "department_id": None, "language": "ta",
     "avatar": None, "points": 65, "badges": ["first_report", "water_guardian"], "active": True, "created_at": now_minus(55)},
    {"id": citizen_ids[2], "name": "Arjun Sharma", "email": "arjun@example.com", "phone": "9500000003",
     "password": hash_password("Citizen@1234"), "role": "citizen", "department_id": None, "language": "en",
     "avatar": None, "points": 45, "badges": ["first_report"], "active": True, "created_at": now_minus(45)},
    {"id": citizen_ids[3], "name": "\u0b95\u0bb5\u0bbf\u0ba4\u0bbe \u0b9a\u0bc1\u0ba8\u0bcd\u0ba4\u0bb0\u0bae\u0bcd", "email": "kavitha@example.com", "phone": "9500000004",
     "password": hash_password("Citizen@1234"), "role": "citizen", "department_id": None, "language": "ta",
     "avatar": None, "points": 30, "badges": ["first_report"], "active": True, "created_at": now_minus(40)},
    {"id": citizen_ids[4], "name": "Vijay Anand", "email": "vijay@example.com", "phone": "9500000005",
     "password": hash_password("Citizen@1234"), "role": "citizen", "department_id": None, "language": "en",
     "avatar": None, "points": 25, "badges": ["first_report"], "active": True, "created_at": now_minus(35)},
    {"id": citizen_ids[5], "name": "\u0ba4\u0bae\u0bbf\u0bb4\u0bcd \u0b9a\u0bc6\u0bb2\u0bcd\u0bb5\u0bbf", "email": "tamizh@example.com", "phone": "9500000006",
     "password": hash_password("Citizen@1234"), "role": "citizen", "department_id": None, "language": "ta",
     "avatar": None, "points": 20, "badges": ["first_report"], "active": True, "created_at": now_minus(30)},
    {"id": citizen_ids[6], "name": "Ravi Kumar", "email": "ravi@example.com", "phone": "9500000007",
     "password": hash_password("Citizen@1234"), "role": "citizen", "department_id": None, "language": "en",
     "avatar": None, "points": 15, "badges": ["first_report"], "active": True, "created_at": now_minus(25)},
    {"id": citizen_ids[7], "name": "\u0b85\u0ba9\u0bbf\u0ba4\u0bbe \u0bb0\u0bbe\u0b9c\u0bcd", "email": "anita@example.com", "phone": "9500000008",
     "password": hash_password("Citizen@1234"), "role": "citizen", "department_id": None, "language": "ta",
     "avatar": None, "points": 10, "badges": [], "active": True, "created_at": now_minus(20)},
]

LOCATIONS = [
    (10.9574, 78.0809, "Karur Main Road"),
    (10.9612, 78.0745, "Jawahar Bazaar"),
    (10.9534, 78.0876, "K.B. Colony"),
    (10.9489, 78.0934, "Raja Mill Road"),
    (10.9623, 78.0901, "Kovai Road Junction"),
    (10.9701, 78.0756, "Thanthoni"),
    (10.9445, 78.0712, "Kadavur Road"),
    (10.9567, 78.0823, "Bus Stand Area"),
    (10.9568, 78.0824, "Bus Stand Area - Near Gate"),
    (10.9566, 78.0822, "Bus Stand Area - South"),
    (10.9590, 78.0850, "Collectorate Road"),
    (10.9510, 78.0780, "Erode Road"),
    (10.9660, 78.0820, "Trichy Road"),
    (10.9520, 78.0860, "TVS Colony"),
    (10.9540, 78.0900, "Railway Station Road"),
]

ISSUE_TYPES = ["pothole", "water_leak", "streetlight"]
DEPT_MAP = {"pothole": "dept-roads", "water_leak": "dept-water", "streetlight": "dept-electric"}
OFFICER_MAP = {"dept-roads": officer_roads_id, "dept-water": officer_water_id, "dept-electric": officer_elec_id}

TITLES = {
    "en": {
        "pothole": ["Large Pothole on Main Road", "Road Damage Near Junction", "Multiple Potholes Reported", "Damaged Road Surface", "Deep Pothole Causing Hazard"],
        "water_leak": ["Water Pipe Burst", "Major Water Leak Reported", "Overflowing Drainage", "Water Wastage on Road", "Damaged Water Main"],
        "streetlight": ["Faulty Streetlight", "Dark Street Safety Concern", "Multiple Lights Not Working", "Streetlight Pole Damaged", "Night Safety Issue"],
    },
    "ta": {
        "pothole": ["\u0b9a\u0bbe\u0bb2\u0bc8\u0baf\u0bbf\u0bb2\u0bcd \u0baa\u0bc6\u0bb0\u0bbf\u0baf \u0b95\u0bc1\u0bb4\u0bbf", "\u0b9a\u0ba8\u0bcd\u0ba4\u0bbf\u0baa\u0bcd\u0baa\u0bbf\u0bb2\u0bcd \u0b9a\u0bbe\u0bb2\u0bc8 \u0b9a\u0bc7\u0ba4\u0bae\u0bcd", "\u0baa\u0bb2 \u0b95\u0bc1\u0bb4\u0bbf\u0b95\u0bb3\u0bcd \u0baa\u0bc1\u0b95\u0bbe\u0bb0\u0bb3\u0bbf\u0b95\u0bcd\u0b95\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f\u0ba9", "\u0b9a\u0bc7\u0ba4\u0bae\u0b9f\u0bc8\u0ba8\u0bcd\u0ba4 \u0b9a\u0bbe\u0bb2\u0bc8", "\u0b86\u0baa\u0ba4\u0bcd\u0ba4\u0bbe\u0ba9 \u0b95\u0bc1\u0bb4\u0bbf"],
        "water_leak": ["\u0ba8\u0bc0\u0bb0\u0bcd\u0b95\u0bcd \u0b95\u0bc1\u0bb4\u0bbe\u0baf\u0bcd \u0bb5\u0bc6\u0b9f\u0bbf\u0baa\u0bcd\u0baa\u0bc1", "\u0baa\u0bc6\u0bb0\u0bbf\u0baf \u0ba8\u0bc0\u0bb0\u0bcd \u0b95\u0b9a\u0bbf\u0bb5\u0bc1", "\u0bb5\u0b9f\u0bbf\u0b95\u0bbe\u0bb2\u0bcd \u0ba8\u0bc0\u0bb0\u0bcd \u0baa\u0bc1\u0bb0\u0b9f\u0bcd\u0b9f\u0bc1", "\u0b9a\u0bbe\u0bb2\u0bc8\u0baf\u0bbf\u0bb2\u0bcd \u0ba8\u0bc0\u0bb0\u0bcd \u0bb5\u0bbf\u0bb0\u0baf\u0bae\u0bcd", "\u0b9a\u0bc7\u0ba4\u0bae\u0b9f\u0bc8\u0ba8\u0bcd\u0ba4 \u0ba8\u0bc0\u0bb0\u0bcd \u0bb5\u0bb4\u0bbf"],
        "streetlight": ["\u0baa\u0bb4\u0bc1\u0ba4\u0bbe\u0ba9 \u0ba4\u0bc6\u0bb0\u0bc1\u0bb5\u0bbf\u0bb3\u0b95\u0bcd\u0b95\u0bc1", "\u0b87\u0bb0\u0bc1\u0b9f\u0bcd\u0b9f\u0bbe\u0ba9 \u0ba4\u0bc6\u0bb0\u0bc1", "\u0baa\u0bb2 \u0bb5\u0bbf\u0bb3\u0b95\u0bcd\u0b95\u0bc1\u0b95\u0bb3\u0bcd \u0baa\u0bb4\u0bc1\u0ba4\u0bc1", "\u0ba4\u0bc6\u0bb0\u0bc1\u0bb5\u0bbf\u0bb3\u0b95\u0bcd\u0b95\u0bc1 \u0b95\u0bae\u0bcd\u0baa\u0bae\u0bcd \u0b9a\u0bc7\u0ba4\u0bae\u0bcd", "\u0b87\u0bb0\u0bb5\u0bc1 \u0baa\u0bbe\u0ba4\u0bc1\u0b95\u0bbe\u0baa\u0bcd\u0baa\u0bc1 \u0baa\u0bbf\u0bb0\u0b9a\u0bcd\u0b9a\u0bbf\u0ba9\u0bc8"],
    }
}

complaints = []
notifications = []
comments_list = []
activities = []

scenarios = [
    ("Resolved", 28, ["Submitted", "Acknowledged", "In Progress", "Resolved"]),
    ("Resolved", 25, ["Submitted", "Acknowledged", "In Progress", "Resolved"]),
    ("Resolved", 22, ["Submitted", "Acknowledged", "In Progress", "Resolved"]),
    ("Resolved", 20, ["Submitted", "Acknowledged", "In Progress", "Resolved"]),
    ("Resolved", 18, ["Submitted", "Acknowledged", "In Progress", "Resolved"]),
    ("Resolved", 15, ["Submitted", "Acknowledged", "In Progress", "Resolved"]),
    ("In Progress", 10, ["Submitted", "Acknowledged", "In Progress"]),
    ("In Progress", 8, ["Submitted", "Acknowledged", "In Progress"]),
    ("In Progress", 5, ["Submitted", "Acknowledged", "In Progress"]),
    ("In Progress", 3, ["Submitted", "Acknowledged", "In Progress"]),
    ("Acknowledged", 4, ["Submitted", "Acknowledged"]),
    ("Acknowledged", 2, ["Submitted", "Acknowledged"]),
    ("Acknowledged", 1, ["Submitted", "Acknowledged"]),
    ("Submitted", 5, ["Submitted"]),
    ("Submitted", 4, ["Submitted"]),
    ("Submitted", 0.5, ["Submitted"]),
    ("Submitted", 0.2, ["Submitted"]),
    ("Submitted", 0.1, ["Submitted"]),
    ("Rejected", 14, ["Submitted", "Rejected"]),
    ("Rejected", 12, ["Submitted", "Rejected"]),
]

year = datetime.now(timezone.utc).year
complaint_counter = 1

for cycle in range(3):
    for i, (final_status, days_ago, progression) in enumerate(scenarios):
        if complaint_counter > 45: break
        
        issue_type = ISSUE_TYPES[(i + cycle) % 3]
        loc = LOCATIONS[(i + cycle * 7) % len(LOCATIONS)]
        lat, lng, address = loc
        reporter_id = citizen_ids[(i + cycle) % len(citizen_ids)]
        language = "ta" if (i + cycle) % 3 != 2 else "en"
        
        severity_opts = {"pothole": ["High", "Medium", "Low"], "water_leak": ["High", "Medium", "Low"], "streetlight": ["High", "Medium"]}
        severity = severity_opts[issue_type][(i + cycle) % len(severity_opts[issue_type])]
        main_road = (i + cycle) % 4 == 0
        
        complaint_id = f"KRR-{year}-{complaint_counter:05d}"
        complaint_counter += 1
        
        dept_id = DEPT_MAP[issue_type]
        officer_id = OFFICER_MAP[dept_id]
        
        base_time = datetime.now(timezone.utc) - timedelta(days=days_ago)
        history = []
        for j, stat in enumerate(progression):
            by = reporter_id if j == 0 else officer_id
            at = (base_time + timedelta(hours=j*8)).isoformat()
            note = "" if j == 0 else f"Status updated to {stat}"
            if stat == "Rejected": note = "Issue not verified at location visit"
            history.append({"status": stat, "at": at, "by": by, "note": note})
        
        upvoters = random.sample(citizen_ids, min(random.randint(0, 6), 8))
        followers = list(set(random.sample(citizen_ids, min(random.randint(0, 3), 8)) + [reporter_id]))
        
        titles = TITLES[language][issue_type]
        title = titles[(i + cycle) % len(titles)]
        
        img = images[issue_type][(complaint_counter - 2) % len(images[issue_type])]
        res_img = None
        if final_status == "Resolved":
            res_img = images[issue_type][(complaint_counter - 1) % len(images[issue_type])]
        
        resolved_at = None
        if final_status == "Resolved":
            resolved_at = (base_time + timedelta(days=2)).isoformat()
        
        lat_off = random.uniform(-0.002, 0.002)
        lng_off = random.uniform(-0.002, 0.002)
        
        severity_reason_map = {
            "High": f"severity.reason.large_{issue_type}_area" if issue_type == "pothole" else ("severity.reason.major_water_leak" if issue_type == "water_leak" else "severity.reason.main_road_streetlight"),
            "Medium": f"severity.reason.moderate_{issue_type}" if issue_type == "pothole" else ("severity.reason.moderate_water_leak" if issue_type == "water_leak" else "severity.reason.streetlight_faulty"),
            "Low": f"severity.reason.minor_{issue_type}" if issue_type != "streetlight" else "severity.reason.streetlight_faulty",
        }
        
        c = {
            "id": complaint_id,
            "user_id": reporter_id,
            "issue_type": issue_type,
            "severity": severity,
            "severity_reason": severity_reason_map.get(severity, "severity.reason.unknown"),
            "title": title,
            "description": f"Issue detected at {address}. Requires immediate attention from the concerned department.",
            "language": language,
            "text_original": {"title": title, "description": f"Issue at {address}."},
            "text_en": {"title": TITLES["en"][issue_type][(i + cycle) % len(TITLES["en"][issue_type])], "description": f"Issue detected at {address}."},
            "image": img,
            "resolution_image": res_img,
            "lat": lat + lat_off,
            "lng": lng + lng_off,
            "address": address,
            "location_source": "gps",
            "main_road": main_road,
            "department_id": dept_id,
            "status": final_status,
            "history": history,
            "upvotes": upvoters,
            "followers": followers,
            "ai_issue_type": issue_type,
            "ai_confidence": round(0.65 + random.uniform(0, 0.30), 2),
            "detector_mode": "stub",
            "verification": {
                "ai_confidence": round(0.65 + random.uniform(0, 0.30), 2),
                "exif_gps_match": None,
                "duplicate_checked": True,
                "needs_review": False
            },
            "duplicate_of": None,
            "created_at": base_time.isoformat(),
            "updated_at": (base_time + timedelta(hours=len(progression)*8)).isoformat(),
            "resolved_at": resolved_at,
        }
        complaints.append(c)
        
        commenter_id = citizen_ids[(i + 1 + cycle) % len(citizen_ids)]
        comment_id = gen_id()
        comments_list.append({
            "id": comment_id,
            "complaint_id": complaint_id,
            "user_id": commenter_id,
            "parent_id": None,
            "text": "This needs urgent attention!" if language == "en" else "\u0b87\u0ba4\u0bc1 \u0b89\u0b9f\u0ba9\u0b9f\u0bbf\u0baf\u0bbe\u0b95 \u0b9a\u0bb0\u0bbf \u0b9a\u0bc6\u0baf\u0bcd\u0baf\u0baa\u0bcd\u0baa\u0b9f \u0bb5\u0bc7\u0ba3\u0bcd\u0b9f\u0bc1\u0bae\u0bcd!",
            "is_official": False,
            "helpful": [],
            "created_at": (base_time + timedelta(hours=2)).isoformat(),
            "edited_at": None,
        })
        
        if final_status in ["In Progress", "Resolved"] and (i + cycle) % 3 == 0:
            comments_list.append({
                "id": gen_id(),
                "complaint_id": complaint_id,
                "user_id": officer_id,
                "parent_id": comment_id,
                "text": "We have acknowledged this issue and dispatched a team to assess it.",
                "is_official": True,
                "helpful": [reporter_id],
                "created_at": (base_time + timedelta(hours=10)).isoformat(),
                "edited_at": None,
            })
        
        if final_status != "Submitted":
            notifications.append({
                "id": gen_id(),
                "user_id": reporter_id,
                "type": "status_changed",
                "complaint_id": complaint_id,
                "actor_id": officer_id,
                "message_key": "notification.status_changed",
                "params": {"status": final_status, "id": complaint_id},
                "read": random.choice([True, False]),
                "created_at": (base_time + timedelta(hours=8)).isoformat(),
            })
        
        activities.append({"id": gen_id(), "user_id": reporter_id, "type": "report", "complaint_id": complaint_id, "created_at": base_time.isoformat()})
    
    if complaint_counter > 45: break

print(f"\n Seeding data...")
write_json('departments.json', departments)
write_json('users.json', users)
write_json('complaints.json', complaints)
write_json('comments.json', comments_list)
write_json('notifications.json', notifications)
write_json('activity.json', activities)

print(f"\n Seeded:")
print(f"  Users: {len(users)} (1 admin, 3 officers, 8 citizens)")
print(f"  Complaints: {len(complaints)}")
print(f"  Comments: {len(comments_list)}")
print(f"  Notifications: {len(notifications)}")

print("\n" + "="*55)
print(" Demo Credentials")
print("="*55)
print(f" Admin:          admin@karurmc.gov.in        / Admin@1234")
print(f" Roads Officer:  officer.roads@karurmc.gov.in / Officer@1234")
print(f" Water Officer:  officer.water@karurmc.gov.in / Officer@1234")
print(f" Elec Officer:   officer.electric@karurmc.gov.in / Officer@1234")
print(f" Citizen (ta):   murugan@example.com          / Citizen@1234")
print(f" Citizen (ta):   priya@example.com            / Citizen@1234")
print(f" Citizen (en):   arjun@example.com            / Citizen@1234")
print("="*55)

if __name__ == "__main__":
    pass
