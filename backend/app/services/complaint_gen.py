import httpx
import json
from app.config import get_settings

TEMPLATES = {
    "en": {
        "pothole": {
            "High": {
                "title": "Severe Pothole and Road Crater on Arterial Road",
                "description": "A severe, deep pothole has formed causing an immediate traffic and safety hazard. Vehicles risk tire and suspension damage. Immediate asphalt resurfacing and patching required."
            },
            "Medium": {
                "title": "Moderate Road Damage and Asphalt Patching Required",
                "description": "Road surface is damaged with multiple uneven potholes affecting smooth vehicle movement. Maintenance crew inspection and bituminous patching requested."
            },
            "Low": {
                "title": "Minor Road Surface Wear and Small Pothole",
                "description": "Minor pavement deterioration observed. Early intervention recommended to prevent further degradation into larger potholes."
            }
        },
        "water_leak": {
            "High": {
                "title": "Major Water Main Pipeline Burst and Heavy Overflow",
                "description": "High-pressure pipeline damage causing significant potable water wastage and road waterlogging. Urgent valve closure and pipe replacement required within 24 hours."
            },
            "Medium": {
                "title": "Continuous Underground Pipeline Leakage Detected",
                "description": "Continuous water seepage from underground municipal distribution line causing muddy water accumulation. Drainage inspection and pipe joint seal required."
            },
            "Low": {
                "title": "Minor Water Pipe Drip and Valve Seepage",
                "description": "Slow water dripping from utility pipe junction. Preventive maintenance requested to prevent pressure drop and resource loss."
            }
        },
        "streetlight": {
            "High": {
                "title": "Dangerous Dark Stretch - Junction Streetlight Non-Functional",
                "description": "Multiple high-mast or junction streetlights are completely out, causing severe nighttime blindness and accident risk on the main transit corridor. Urgent electrical crew dispatch needed."
            },
            "Medium": {
                "title": "Faulty Streetlight and Flickering Luminaire Reported",
                "description": "Streetlight fixture is blinking/damaged and failing to illuminate the road adequately. Luminaire bulb/driver replacement requested."
            },
            "Low": {
                "title": "Damaged Streetlight Cover / Loose Fixture",
                "description": "Streetlight pole wiring or protective housing is loose. Routine electrical servicing required."
            }
        }
    },
    "ta": {
        "pothole": {
            "High": {
                "title": "ஆபத்தான பெரிய சாலைக்குழி மற்றும் சாலை சேதம்",
                "description": "சாலையில் மிக ஆழமான குழி ஏற்பட்டு வாகனப் போக்குவரத்திற்கு பெரும் ஆபத்தை ஏற்படுத்துகிறது. விபத்துகளைத் தவிர்க்க உடனடி தார் சாலை சீரமைப்பு பணி தேவை."
            },
            "Medium": {
                "title": "சாலையில் நடுத்தர குழிகள் மற்றும் சேதம்",
                "description": "சாலை மேற்பரப்பு சேதமடைந்து வாகன ஓட்டிகளுக்கு சிரமம் ஏற்படுகிறது. தார் பூச்சு மற்றும் பேட்ச் வேலைகள் செய்யுமாறு கேட்டுக்கொள்ளப்படுகிறது."
            },
            "Low": {
                "title": "சிறிய சாலை சேதம் மற்றும் குழி",
                "description": "சாலையில் சிறு பள்ளம் கண்டறியப்பட்டுள்ளது. மேலும் பெரிதாகாமல் தடுக்க பராமரிப்பு பணி மேற்கொள்ளப்பட வேண்டும்."
            }
        },
        "water_leak": {
            "High": {
                "title": "முக்கிய குடிநீர் குழாய் வெடிப்பு - பெரும் நீர் விரயம்",
                "description": "முக்கிய விநியோக குழாய் உடைந்து பெருமளவில் குடிநீர் சாலையில் வீணாகிறது. அவசர பழுதுபார்த்து குழாய் மாற்றத்தை 24 மணி நேரத்திற்குள் முடிக்க வேண்டுகிறோம்."
            },
            "Medium": {
                "title": "நிலத்தடி குடிநீர் குழாயில் தொடர் நீர் கசிவு",
                "description": "குழாய் இணைப்பில் தொடர்ச்சியாக நீர் கசிந்து சாலையில் தேங்குகிறது. நகராட்சி குடிநீர் பிரிவு உடனடியாக சரிசெய்ய வேண்டும்."
            },
            "Low": {
                "title": "குழாய் வால்வில் சிறிய நீர் கசிவு",
                "description": "குழாய் பகுதியில் லேசான நீர் சொட்டுகிறது. அழுத்தம் குறைவதைத் தடுக்க முன்னெச்சரிக்கை சீரமைப்பு தேவை."
            }
        },
        "streetlight": {
            "High": {
                "title": "முக்கிய சந்திப்பில் பழுதான தெருவிளக்கு - இருள் ஆபத்து",
                "description": "முக்கிய சாலை சந்திப்பில் உள்ள தெருவிளக்குகள் எரியாமல் இரவு நேரத்தில் பெரும் விபத்து அபாயம் உள்ளது. மின்வாரிய பிரிவு உடனடியாக புதிய விளக்கு பொருத்த வேண்டும்."
            },
            "Medium": {
                "title": "மின் தெருவிளக்கு எரியவில்லை - பழுது நீக்க கோரிக்கை",
                "description": "தெருவிளக்கு பழுதடைந்து ஒளிராமல் உள்ளது. பொதுமக்களின் பாதுகாப்புக்காக எல்இடி பல்பை மாற்றி சரிசெய்ய வேண்டுகிறோம்."
            },
            "Low": {
                "title": "தெருவிளக்கு மூடி சேதம் / மின் கம்பி ஆய்வு",
                "description": "தெருவிளக்கு கம்பத்தில் உள்ள பாதுகாப்பு மூடி தளர்ந்துள்ளது. வழக்கமான பராமரிப்பு ஆய்வு தேவை."
            }
        }
    }
}

async def generate_draft(issue_type: str, severity: str, address: str, lang: str) -> dict:
    settings = get_settings()
    if not settings.openrouter_api_key:
        return _template_draft(issue_type, severity, address, lang)
    try:
        lang_name = "Tamil" if lang == "ta" else "English"
        location_ctx = f" at {address}" if address else " in the municipal area"
        prompt = f"""You are an AI assistant for City Municipal Corporation Civic Guardian.
Generate an official, precise civic complaint title (max 12 words) and descriptive explanation (max 45 words) in {lang_name}.
Issue Category: {issue_type.replace('_', ' ')}
Severity: {severity}
Location: {location_ctx}

Return valid JSON with keys:
"title": "Concise issue summary",
"description": "Actionable, clear explanation of the situation and repair need"
"""
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.openrouter_api_key}"},
                json={
                    "model": settings.openrouter_model,
                    "max_tokens": 300,
                    "messages": [{"role": "user", "content": prompt}],
                    "response_format": {"type": "json_object"}
                }
            )
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            parsed = json.loads(content)
            return {
                "title": parsed.get("title", "").strip(),
                "description": parsed.get("description", "").strip(),
                "source": "ai"
            }
    except Exception as e:
        print(f"OpenRouter draft generation error: {e}")
        return _template_draft(issue_type, severity, address, lang)

def _template_draft(issue_type: str, severity: str = "Medium", address: str = "", lang: str = "ta") -> dict:
    active_lang = lang if lang in TEMPLATES else "en"
    cat_dict = TEMPLATES[active_lang].get(issue_type, TEMPLATES[active_lang]["pothole"])
    sev_key = severity if severity in cat_dict else "Medium"
    draft = cat_dict[sev_key]
    
    title = draft["title"]
    description = draft["description"]
    
    if address:
        if active_lang == "ta":
            description = f"{address} பகுதியில், {description}"
        else:
            description = f"Located near {address}. {description}"
            
    return {
        "title": title,
        "description": description,
        "source": "template"
    }

async def translate_to_english(title: str, description: str, source_lang: str = "ta") -> dict:
    if source_lang == "en":
        return {"title": title, "description": description}
    settings = get_settings()
    if not settings.openrouter_api_key:
        return {"title": title, "description": description}
    try:
        prompt = f"Translate this Tamil municipal civic complaint to English. Return JSON {{\"title\": \"...\", \"description\": \"...\"}}.\nTitle: {title}\nDescription: {description}"
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.openrouter_api_key}"},
                json={
                    "model": settings.openrouter_model,
                    "max_tokens": 300,
                    "messages": [{"role": "user", "content": prompt}],
                    "response_format": {"type": "json_object"}
                }
            )
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            parsed = json.loads(content)
            return {
                "title": parsed.get("title", title),
                "description": parsed.get("description", description)
            }
    except Exception:
        return {"title": title, "description": description}
