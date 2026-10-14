import math
import urllib.request
import urllib.parse
import json
from fastapi import APIRouter, Query

router = APIRouter(prefix="/geocode", tags=["geocode"])

KARUR_LANDMARKS = [
    {
        "name_en": "Arulmigu Kalyana Pasupatheeswarar Temple",
        "name_ta": "அருள்மிகு கல்யாண பசுபதீஸ்வரர் திருக்கோவில்",
        "road_en": "West Car Street, Sannathi",
        "road_ta": "மேல ரத வீதி, சன்னதி",
        "area_en": "Karur Town",
        "area_ta": "கரூர் டவுன்",
        "ward": 14,
        "pin": "639001",
        "lat": 10.9585,
        "lng": 78.0825
    },
    {
        "name_en": "Karur Central Bus Stand",
        "name_ta": "கரூர் மத்திய பேருந்து நிலையம்",
        "road_en": "Kovai Road",
        "road_ta": "கோவை ரோடு",
        "area_en": "Karur Central",
        "area_ta": "கரூர் மத்திய பகுதி",
        "ward": 11,
        "pin": "639001",
        "lat": 10.9605,
        "lng": 78.0765
    },
    {
        "name_en": "Karur City Municipal Corporation Office",
        "name_ta": "கரூர் மாநகராட்சி தலைமை அலுவலகம்",
        "road_en": "Azad Road",
        "road_ta": "ஆசாத் ரோடு",
        "area_en": "Municipal Campus",
        "area_ta": "மாநகராட்சி வளாகம்",
        "ward": 10,
        "pin": "639001",
        "lat": 10.9598,
        "lng": 78.0725
    },
    {
        "name_en": "Karur District Collectorate Complex",
        "name_ta": "கரூர் மாவட்ட ஆட்சியர் பெருந்திட்ட வளாகம்",
        "road_en": "Thanthonimalai Main Road",
        "road_ta": "தாந்தோணிமலை மெயின் ரோடு",
        "area_en": "Thanthonimalai",
        "area_ta": "தாந்தோணிமலை",
        "ward": 38,
        "pin": "639005",
        "lat": 10.9335,
        "lng": 78.0768
    },
    {
        "name_en": "Karur Railway Junction",
        "name_ta": "கரூர் ரயில்வே சந்திப்பு நிலையம்",
        "road_en": "Station Road",
        "road_ta": "ஸ்டேஷன் ரோடு",
        "area_en": "Railway Colony",
        "area_ta": "ரயில்வே காலனி",
        "ward": 16,
        "pin": "639001",
        "lat": 10.9620,
        "lng": 78.0870
    },
    {
        "name_en": "Jawahar Bazaar Commercial Centre",
        "name_ta": "ஜவகர் பஜார் வணிக வளாகம்",
        "road_en": "Jawahar Bazaar",
        "road_ta": "ஜவகர் பஜார்",
        "area_en": "Bazaar Ward",
        "area_ta": "பஜார் வார்டு",
        "ward": 15,
        "pin": "639001",
        "lat": 10.9592,
        "lng": 78.0815
    },
    {
        "name_en": "Light House Corner Junction",
        "name_ta": "லைட் ஹவுஸ் கார்னர் சந்திப்பு",
        "road_en": "Dindigul Road - Kovai Road Crossing",
        "road_ta": "திண்டுக்கல் - கோவை ரோடு சந்திப்பு",
        "area_en": "Light House",
        "area_ta": "லைட் ஹவுஸ் பகுதி",
        "ward": 13,
        "pin": "639001",
        "lat": 10.9565,
        "lng": 78.0800
    },
    {
        "name_en": "Sengunthapuram Textile Hub",
        "name_ta": "செங்குந்தபுரம் ஜவுளி வணிக பகுதி",
        "road_en": "Sengunthapuram Main Road",
        "road_ta": "செங்குந்தபுரம் மெயின் ரோடு",
        "area_en": "Sengunthapuram",
        "area_ta": "செங்குந்தபுரம்",
        "ward": 20,
        "pin": "639002",
        "lat": 10.9550,
        "lng": 78.0750
    },
    {
        "name_en": "Thanthoni Kalyana Venkataramana Swamy Temple",
        "name_ta": "தாந்தோணி கல்யாண வெங்கடரமண சுவாமி திருக்கோவில்",
        "road_en": "Temple Hill Road",
        "road_ta": "கோவில் மலைப் பாதை",
        "area_en": "Thanthonimalai",
        "area_ta": "தாந்தோணிமலை",
        "ward": 40,
        "pin": "639005",
        "lat": 10.9280,
        "lng": 78.0790
    },
    {
        "name_en": "Government Arts College",
        "name_ta": "அரசு கலைக்கல்லூரி",
        "road_en": "Arts College Road",
        "road_ta": "கலைக்கல்லூரி ரோடு",
        "area_en": "Thanthonimalai North",
        "area_ta": "தாந்தோணிமலை வடக்கு",
        "ward": 39,
        "pin": "639005",
        "lat": 10.9380,
        "lng": 78.0750
    },
    {
        "name_en": "Vengamedu Market & Bus Stop",
        "name_ta": "வெங்கமேடு சந்தை & பேருந்து நிறுத்தம்",
        "road_en": "Vengamedu Main Road",
        "road_ta": "வெங்கமேடு மெயின் ரோடு",
        "area_en": "Vengamedu",
        "area_ta": "வெங்கமேடு",
        "ward": 5,
        "pin": "639006",
        "lat": 10.9750,
        "lng": 78.0735
    },
    {
        "name_en": "Nethaji Nagar Residential Area",
        "name_ta": "நேதாஜி நகர் குடியிருப்பு பகுதி",
        "road_en": "Nethaji Nagar 1st Cross",
        "road_ta": "நேதாஜி நகர் 1வது குறுக்குத் தெரு",
        "area_en": "Vengamedu East",
        "area_ta": "வெங்கமேடு கிழக்கு",
        "ward": 6,
        "pin": "639006",
        "lat": 10.9720,
        "lng": 78.0770
    },
    {
        "name_en": "Gandhigramam South Residential Ward",
        "name_ta": "காந்திகிராமம் தெற்கு பகுதி",
        "road_en": "Gandhigramam Main Road",
        "road_ta": "காந்திகிராமம் மெயின் ரோடு",
        "area_en": "Gandhigramam",
        "area_ta": "காந்திகிராமம்",
        "ward": 24,
        "pin": "639004",
        "lat": 10.9630,
        "lng": 78.0620
    },
    {
        "name_en": "Vadivel Nagar Colony",
        "name_ta": "வடிவேல் நகர் காலனி",
        "road_en": "Vadivel Nagar 2nd Street",
        "road_ta": "வடிவேல் நகர் 2வது தெரு",
        "area_en": "Gandhigramam West",
        "area_ta": "காந்திகிராமம் மேற்கு",
        "ward": 25,
        "pin": "639004",
        "lat": 10.9650,
        "lng": 78.0650
    },
    {
        "name_en": "Kamarajapuram Commercial Area",
        "name_ta": "காமராஜபுரம் வணிக பகுதி",
        "road_en": "80 Feet Road",
        "road_ta": "80 அடி ரோடு",
        "area_en": "Kamarajapuram",
        "area_ta": "காமராஜபுரம்",
        "ward": 22,
        "pin": "639002",
        "lat": 10.9560,
        "lng": 78.0680
    },
    {
        "name_en": "Pasupathipalayam Amaravathi Bridge",
        "name_ta": "பசுபதிபாளையம் அமராவதி ஆற்றுப் பாலம்",
        "road_en": "Tiruchi Main Road",
        "road_ta": "திருச்சி மெயின் ரோடு",
        "area_en": "Pasupathipalayam",
        "area_ta": "பசுபதிபாளையம்",
        "ward": 31,
        "pin": "639004",
        "lat": 10.9540,
        "lng": 78.0920
    },
    {
        "name_en": "Sanapiratti Rural & Industrial Ward",
        "name_ta": "சணப்பிரட்டி கிராம & தொழிற்பேட்டை பகுதி",
        "road_en": "Sanapiratti Road",
        "road_ta": "சணப்பிரட்டி ரோடு",
        "area_en": "Sanapiratti",
        "area_ta": "சணப்பிரட்டி",
        "ward": 35,
        "pin": "639004",
        "lat": 10.9710,
        "lng": 78.0910
    },
    {
        "name_en": "Inam Karur Municipality Ward",
        "name_ta": "இனம் கரூர் நகராட்சி வார்டு",
        "road_en": "Inam Karur Main Road",
        "road_ta": "இனம் கரூர் மெயின் ரோடு",
        "area_en": "Inam Karur",
        "area_ta": "இனம் கரூர்",
        "ward": 18,
        "pin": "639002",
        "lat": 10.9680,
        "lng": 78.0550
    },
    {
        "name_en": "Chinnandankoil Road Junction",
        "name_ta": "சின்னாண்டான்கோவில் சாலை சந்திப்பு",
        "road_en": "Chinnandankoil Road",
        "road_ta": "சின்னாண்டான்கோவில் ரோடு",
        "area_en": "Chinnandankoil",
        "area_ta": "சின்னாண்டான்கோவில்",
        "ward": 12,
        "pin": "639001",
        "lat": 10.9610,
        "lng": 78.0830
    },
    {
        "name_en": "Rayanur Residential Ward",
        "name_ta": "ராயனூர் குடியிருப்பு பகுதி",
        "road_en": "Rayanur Main Road",
        "road_ta": "ராயனூர் மெயின் ரோடு",
        "area_en": "Rayanur",
        "area_ta": "ராயனூர்",
        "ward": 28,
        "pin": "639003",
        "lat": 10.9480,
        "lng": 78.0580
    }
]

def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371000.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2
    return r * 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

def find_nearest_landmark(lat: float, lng: float):
    best = None
    min_dist = float('inf')
    for lm in KARUR_LANDMARKS:
        d = haversine_m(lat, lng, lm["lat"], lm["lng"])
        if d < min_dist:
            min_dist = d
            best = lm
    return best, min_dist

_cache = {}

@router.get("/reverse")
def reverse_geocode(lat: float = Query(...), lng: float = Query(...), lang: str = Query("ta")):
    cache_key = f"{round(lat, 5)}_{round(lng, 5)}_{lang}"
    if cache_key in _cache:
        return _cache[cache_key]

    nearest_lm, dist_m = find_nearest_landmark(lat, lng)

    osm_road = ""
    osm_suburb = ""
    osm_postcode = "639001"
    try:
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lng}&zoom=18&addressdetails=1"
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "KarurCivicGuardian/1.0 (commr.karur@tn.gov.in)",
                "Accept-Language": "ta,en" if lang == "ta" else "en,ta"
            }
        )
        with urllib.request.urlopen(req, timeout=3.5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            addr = data.get("address", {})
            osm_road = addr.get("road") or addr.get("pedestrian") or addr.get("street") or addr.get("amenity") or ""
            osm_suburb = addr.get("suburb") or addr.get("neighbourhood") or addr.get("residential") or ""
            osm_postcode = addr.get("postcode") or "639001"
    except Exception:
        pass

    pin = osm_postcode or (nearest_lm["pin"] if nearest_lm else "639001")
    ward = nearest_lm["ward"] if nearest_lm else 10

    if lang == "ta":
        if dist_m < 250:
            road = nearest_lm["road_ta"]
            loc = f"{nearest_lm['name_ta']} அருகில், {road}, வார்டு {ward}, கரூர் - {pin}"
        elif dist_m < 800:
            road = osm_road or nearest_lm["road_ta"]
            loc = f"{road}, {nearest_lm['area_ta']}, வார்டு {ward}, கரூர் - {pin}"
        else:
            sub = osm_suburb or nearest_lm["area_ta"]
            road = osm_road or nearest_lm["road_ta"]
            loc = f"{road}, {sub}, கரூர் மாநகராட்சி - {pin}"
    else:
        if dist_m < 250:
            road = nearest_lm["road_en"]
            loc = f"Near {nearest_lm['name_en']}, {road}, Ward {ward}, Karur - {pin}"
        elif dist_m < 800:
            road = osm_road or nearest_lm["road_en"]
            loc = f"{road}, {nearest_lm['area_en']}, Ward {ward}, Karur - {pin}"
        else:
            sub = osm_suburb or nearest_lm["area_en"]
            road = osm_road or nearest_lm["road_en"]
            loc = f"{road}, {sub}, Karur Municipality - {pin}"

    result = {
        "address": loc,
        "landmark_en": nearest_lm["name_en"] if nearest_lm else "Karur",
        "landmark_ta": nearest_lm["name_ta"] if nearest_lm else "கரூர்",
        "road_en": nearest_lm["road_en"] if nearest_lm else "Main Road",
        "road_ta": nearest_lm["road_ta"] if nearest_lm else "முக்கிய சாலை",
        "ward": ward,
        "postcode": pin,
        "distance_to_landmark_m": round(dist_m, 1),
        "lat": lat,
        "lng": lng
    }
    _cache[cache_key] = result
    return result

@router.get("/search")
def search_places(q: str = Query(...), lang: str = Query("ta")):
    query = q.strip().lower()
    if not query:
        return []

    matched = []
    for lm in KARUR_LANDMARKS:
        match_score = 0
        if query in lm["name_en"].lower() or query in lm["name_ta"].lower():
            match_score += 10
        if query in lm["road_en"].lower() or query in lm["road_ta"].lower():
            match_score += 6
        if query in lm["area_en"].lower() or query in lm["area_ta"].lower():
            match_score += 4
        if f"ward {lm['ward']}" in query or f"வார்டு {lm['ward']}" in query or f"{lm['ward']}" == query:
            match_score += 8

        if match_score > 0:
            if lang == "ta":
                fmt = f"{lm['name_ta']}, {lm['road_ta']}, வார்டு {lm['ward']}, கரூர் - {lm['pin']}"
            else:
                fmt = f"{lm['name_en']}, {lm['road_en']}, Ward {lm['ward']}, Karur - {lm['pin']}"
            matched.append({
                "displayName": fmt,
                "formattedAddress": fmt,
                "lat": lm["lat"],
                "lng": lm["lng"],
                "score": match_score
            })

    matched.sort(key=lambda x: x["score"], reverse=True)
    return matched[:8]
