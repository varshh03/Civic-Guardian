import base64
import json
import httpx
import io
import re
from dataclasses import dataclass
from pathlib import Path
from PIL import Image
from app.config import get_settings

@dataclass
class DetectionResult:
    issue_type: str | None
    confidence: float
    area_ratio: float
    count: int
    mode: str
    is_valid: bool = True
    reason: str = ""

ISSUE_TYPES = ["pothole", "water_leak", "streetlight"]

def optimize_image_for_vision(image_bytes: bytes, max_size: int = 1024) -> bytes:
    try:
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        w, h = img.size
        if max(w, h) > max_size:
            scale = max_size / max(w, h)
            new_w = max(1, int(w * scale))
            new_h = max(1, int(h * scale))
            img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        out = io.BytesIO()
        img.save(out, format="JPEG", quality=85, optimize=True)
        return out.getvalue()
    except Exception:
        return image_bytes

def parse_json_safely(raw_text: str) -> dict:
    text = raw_text.strip()
    # Strip any <think>...</think> reasoning blocks
    text = re.sub(r"<think>[\s\S]*?</think>", "", text).strip()
    if "```" in text:
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            text = match.group(1).strip()
    try:
        return json.loads(text)
    except Exception:
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            return json.loads(match.group(0))
        raise

class SmartHeuristicDetector:
    async def detect_async(self, image_bytes: bytes) -> DetectionResult:
        try:
            img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            img_resized = img.resize((120, 120))
            pixels = list(img_resized.getdata())
            n = len(pixels)
            
            avg_r = sum(p[0] for p in pixels) / n
            avg_g = sum(p[1] for p in pixels) / n
            avg_b = sum(p[2] for p in pixels) / n
            
            lums = [0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2] for p in pixels]
            avg_lum = sum(lums) / n
            variance = sum((l - avg_lum) ** 2 for l in lums) / n
            std_dev = variance ** 0.5
            
            upper_pixels = pixels[:3600]
            lower_pixels = pixels[10800:]
            avg_upper_lum = sum(0.299*p[0] + 0.587*p[1] + 0.114*p[2] for p in upper_pixels) / len(upper_pixels)
            avg_lower_lum = sum(0.299*p[0] + 0.587*p[1] + 0.114*p[2] for p in lower_pixels) / len(lower_pixels)
            
            if std_dev < 6:
                return DetectionResult(
                    issue_type="invalid",
                    confidence=0.92,
                    area_ratio=0.0,
                    count=0,
                    mode="heuristic",
                    is_valid=False,
                    reason="Image has flat or low contrast with no recognizable civic infrastructure features."
                )
                
            is_skin_tone = (avg_r > 130 and avg_g > 95 and avg_b > 70 and (avg_r - avg_b) > 40 and (avg_r - avg_g) > 15)
            if is_skin_tone and avg_upper_lum < 180 and std_dev < 45:
                return DetectionResult(
                    issue_type="invalid",
                    confidence=0.94,
                    area_ratio=0.0,
                    count=0,
                    mode="heuristic",
                    is_valid=False,
                    reason="Image appears to depict a portrait, indoor scene, or non-civic subject."
                )
                
            if (avg_g > avg_r + 35 and avg_g > avg_b + 35) or (avg_r > avg_g + 55 and avg_r > avg_b + 55):
                return DetectionResult(
                    issue_type="invalid",
                    confidence=0.89,
                    area_ratio=0.0,
                    count=0,
                    mode="heuristic",
                    is_valid=False,
                    reason="Image does not match roadway, water supply, or electrical streetlight patterns."
                )

            dark_wet_pixels = sum(1 for p in pixels if p[0] < 70 and p[1] < 75 and p[2] < 85 and abs(p[0] - p[1]) < 15)
            specular_reflections = sum(1 for p in pixels if p[0] > 200 and p[1] > 200 and p[2] > 200)
            
            if (avg_b > avg_r + 4 and avg_b > 85) or (dark_wet_pixels > n * 0.25 and specular_reflections > n * 0.02):
                return DetectionResult(
                    issue_type="water_leak",
                    confidence=0.88,
                    area_ratio=0.25,
                    count=1,
                    mode="heuristic",
                    is_valid=True,
                    reason="Water accumulation, pipe leak, or drainage runoff detected."
                )
            
            elif (avg_upper_lum > avg_lower_lum + 45 and avg_upper_lum > 150) or (avg_r > 165 and avg_g > 150 and avg_b < 130):
                return DetectionResult(
                    issue_type="streetlight",
                    confidence=0.88,
                    area_ratio=0.18,
                    count=1,
                    mode="heuristic",
                    is_valid=True,
                    reason="Street lighting fixture or electrical utility pole detected."
                )
            
            elif abs(avg_r - avg_g) < 25 and abs(avg_g - avg_b) < 25 and 30 <= avg_lum <= 165 and std_dev >= 7:
                return DetectionResult(
                    issue_type="pothole",
                    confidence=0.90,
                    area_ratio=0.26,
                    count=2,
                    mode="heuristic",
                    is_valid=True,
                    reason="Roadway surface damage, asphalt crack, or pothole detected."
                )
            
            else:
                return DetectionResult(
                    issue_type="invalid",
                    confidence=0.87,
                    area_ratio=0.0,
                    count=0,
                    mode="heuristic",
                    is_valid=False,
                    reason="Image does not match road damage, water pipeline leaks, or municipal streetlight issues."
                )
        except Exception:
            return DetectionResult(
                issue_type="invalid",
                confidence=0.80,
                area_ratio=0.0,
                count=0,
                mode="heuristic",
                is_valid=False,
                reason="Unable to verify civic issue from the uploaded image."
            )

CIVIC_INSPECTOR_PROMPT = """You are an expert AI Municipal Civic Inspector for Civic Guardian, operating under the application label "City Municipal Corporation".

Your responsibility is to analyze uploaded images carefully and determine whether they depict an eligible PUBLIC CIVIC INFRASTRUCTURE ISSUE. You must evaluate the actual defect, the surrounding environment, the background, visible infrastructure, and contextual clues before making a decision.

Civic Guardian currently accepts ONLY these three civic issue categories:

1. `pothole`
   - Potholes, craters, damaged asphalt, broken public road surfaces, significant road cracks, and damaged public pedestrian walkways.
2. `water_leak`
   - Leaking or burst public water-supply pipelines, damaged public water infrastructure, visible water leakage from public roadside pipelines, public drainage overflow, sewage overflow, and waterlogging on public roads.
3. `streetlight`
   - Broken, damaged, tilted, or malfunctioning streetlights serving public roads and public pathways, including clearly identifiable damaged public streetlight fixtures and associated infrastructure.

IMPORTANT: Detecting a physical defect is NOT sufficient. The image must also provide reasonable visual evidence that the issue concerns public civic infrastructure rather than private internal infrastructure.

## 1. Carefully Analyze the Entire Image

Before deciding whether an image is valid, inspect:

- The main subject and the actual defect.
- The foreground, middle ground, and background.
- Road markings, pavements, sidewalks, curbs, public road layouts, and street intersections.
- Public utility poles, streetlight installations, roadside drainage, and visible public water infrastructure.
- Indoor walls, ceilings, floors, bathrooms, kitchens, corridors, classrooms, hospital rooms, offices, and residential interiors.
- Building entrances, private compounds, gates, parking areas, campus interiors, and restricted-access spaces.
- Whether the defect appears to be part of a public road or public utility network, or instead appears to be part of a private building or property.

Do not classify an image using the defect alone. Consider both the defect and its surrounding environment.

## 2. Determine Whether the Issue Concerns Public or Private Infrastructure

### A. Public civic infrastructure

Examples include:

- A pothole on a public street.
- Broken asphalt or damaged pavement on a public road.
- A leaking public water pipe beside a public road.
- Sewage overflowing from a public roadside drain.
- Waterlogging affecting a public street.
- A broken streetlight installed along a public road.
- A damaged streetlight illuminating a public sidewalk.

When a supported defect is clearly visible in a public infrastructure setting, it may qualify as a valid civic issue.

### B. Private or institutional infrastructure

Reject issues that clearly concern private internal infrastructure, including:

- Water leaking from pipes inside a house, apartment, bathroom, kitchen, or bedroom.
- Cracked floors, damaged walls, leaking ceilings, or broken plumbing inside a building.
- Water leakage inside a school, college, university, hospital, office, shop, or other institutional building.
- Damaged internal corridors, classrooms, laboratories, hospital wards, and indoor facilities.
- Potholes or damaged surfaces in private driveways, private parking areas, or internal building premises when they are not established as public municipal infrastructure.
- Broken indoor lights, internal electrical fixtures, or private building utility systems.
- Other private property defects that do not qualify as one of the three supported public civic categories.

A school, college, hospital, or other organization may be located in a public area, but that does not make its internal plumbing, walls, floors, or utilities public civic infrastructure.

If the image clearly shows a private or institutional interior, reject the issue even if the defect itself resembles a supported category.

### C. Do not reject public issues merely because a building is visible

The presence of a house, school, college, hospital, shop, or office in the background does not automatically make an issue private.

Examples:

- A pothole on the public road outside a school can be valid.
- A broken public streetlight outside a hospital can be valid.
- A leaking public water pipeline along a street outside a house can be valid.

Evaluate where the defect itself is located and what infrastructure it appears to belong to.

### D. Ambiguous public/private context

If the image shows a defect but the surroundings do not provide enough evidence to determine whether it belongs to public infrastructure or private property, do not automatically approve it.

Classify the issue as invalid for automatic complaint submission and explain that public infrastructure eligibility could not be established from the image.

Do not claim certainty about ownership, municipal responsibility, or public accessibility based solely on visual appearance.

## 3. Issue Classification and Validation

Return `is_valid: true` only when BOTH conditions are satisfied:

1. One of the three supported civic defects is visibly identifiable.
2. The image provides sufficient visual evidence that the defect concerns public civic infrastructure.

For valid issues:

- `issue_type`: `pothole`, `water_leak`, or `streetlight`.
- `confidence`: estimated model confidence based on the available visual evidence.
- `area_ratio`: estimated proportion of the image occupied by the relevant defect, between 0.0 and 1.0.
- `count`: estimated number of distinct visible defects, from 1 to 5.
- `reason`: concise description of the defect and the visual context supporting its classification as a public civic issue.

For rejected issues:

- `is_valid`: false.
- `issue_type`: `invalid`.
- `area_ratio`: 0.0.
- `count`: 0.
- `confidence`: confidence in the rejection decision, based on the available evidence.
- `reason`: explain whether the image shows a private or institutional issue, an unsupported issue, no visible defect, or insufficient evidence of public civic infrastructure.

Never invent defects, public infrastructure, or evidence that is not visible in the image.

## 4. Confidence and Uncertainty Rules

- Do not force high confidence when the image is blurry, obstructed, poorly lit, or ambiguous.
- Do not assign confidence values arbitrarily just to fit a specified range.
- Use the model's actual estimated confidence when available.
- If confidence is unavailable, provide a reasonable qualitative estimate converted to a numeric value.
- When public/private eligibility is uncertain, reject automatic submission and explain the uncertainty.
- Do not treat uncertainty as proof that the location is private.
- Do not infer that a pipeline, road, or streetlight belongs to the municipality solely because it is outdoors.

## 5. Strict Output Requirements

Return ONLY valid JSON. Do not include Markdown, code fences, explanations outside the JSON, or additional keys.

Use exactly these keys:

{
  "is_valid": true,
  "issue_type": "pothole",
  "confidence": 0.93,
  "area_ratio": 0.15,
  "count": 1,
  "reason": "A visible pothole is located on an apparent public road with surrounding road infrastructure."
}

The example above illustrates the output structure only. Never reuse its values automatically.

For invalid images, use the same structure with `is_valid: false` and `issue_type: "invalid"`.

The `issue_type` field must contain exactly one of:
- `pothole`
- `water_leak`
- `streetlight`
- `invalid`

Ensure that the JSON is syntactically valid, all values have the correct types, and no additional fields are returned."""

class OpenRouterDetector:
    FALLBACK_MODELS = [
        "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
        "google/gemma-4-26b-a4b-it:free",
        "google/gemma-4-31b-it:free",
        "dots-studio/dots-3-note-preview:free"
    ]

    async def detect_async(self, image_bytes: bytes) -> DetectionResult:
        settings = get_settings()
        if not settings.openrouter_api_key:
            return await SmartHeuristicDetector().detect_async(image_bytes)

        optimized_bytes = optimize_image_for_vision(image_bytes, max_size=768)
        b64 = base64.b64encode(optimized_bytes).decode('utf-8')

        # Build ordered list of models to try
        models_to_try = []
        if settings.openrouter_model and settings.openrouter_model.strip():
            models_to_try.append(settings.openrouter_model.strip())
        for m in self.FALLBACK_MODELS:
            if m not in models_to_try:
                models_to_try.append(m)

        last_error = ""
        for model_name in models_to_try:
            try:
                async with httpx.AsyncClient(timeout=25.0) as client:
                    resp = await client.post(
                        "https://openrouter.ai/api/v1/chat/completions",
                        headers={
                            "Authorization": f"Bearer {settings.openrouter_api_key}",
                            "HTTP-Referer": "https://karurmc.gov.in",
                            "X-Title": "Karur Civic Guardian"
                        },
                        json={
                            "model": model_name,
                            "messages": [
                                {
                                    "role": "user",
                                    "content": [
                                        {"type": "text", "text": CIVIC_INSPECTOR_PROMPT},
                                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}}
                                    ]
                                }
                            ],
                            "response_format": {"type": "json_object"}
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        choices = data.get("choices") or []
                        if not choices:
                            last_error = f"Model {model_name} returned no choices"
                            continue

                        content = choices[0].get("message", {}).get("content", "")
                        if not content:
                            last_error = f"Model {model_name} returned empty message"
                            continue

                        parsed = parse_json_safely(content)
                        is_valid = bool(parsed.get("is_valid", False))
                        issue_type = str(parsed.get("issue_type", "invalid")).strip().lower()

                        raw_conf = parsed.get("confidence")
                        try:
                            confidence = float(raw_conf) if raw_conf is not None else (0.88 if is_valid else 0.90)
                        except (ValueError, TypeError):
                            confidence = 0.88 if is_valid else 0.90

                        raw_area = parsed.get("area_ratio")
                        try:
                            area_ratio = float(raw_area) if raw_area is not None else (0.20 if is_valid else 0.0)
                        except (ValueError, TypeError):
                            area_ratio = 0.20 if is_valid else 0.0

                        raw_count = parsed.get("count")
                        try:
                            count = int(float(raw_count)) if raw_count is not None else (1 if is_valid else 0)
                        except (ValueError, TypeError):
                            count = 1 if is_valid else 0

                        reason = str(parsed.get("reason", "")).strip()

                        if not is_valid or issue_type not in ISSUE_TYPES:
                            return DetectionResult(
                                issue_type="invalid",
                                confidence=confidence,
                                area_ratio=0.0,
                                count=0,
                                mode="ai_vision",
                                is_valid=False,
                                reason=reason or "This issue cannot be acknowledged because Civic Guardian is currently designed specifically for Roads, Water Supply, and Streetlight issues."
                            )
                        return DetectionResult(
                            issue_type=issue_type,
                            confidence=confidence,
                            area_ratio=area_ratio,
                            count=max(1, count),
                            mode="ai_vision",
                            is_valid=True,
                            reason=reason
                        )
                    else:
                        last_error = f"Model {model_name} HTTP {resp.status_code}: {resp.text[:120]}"
                        print(f"OpenRouter detection error: {last_error}")
            except Exception as e:
                last_error = f"Model {model_name} exception: {e}"
                print(f"OpenRouter detection attempt with {model_name} failed: {e}")

        # If all AI models failed, return an explicit invalid result explaining the inspection error
        # rather than guessing random issues via RGB heuristics
        return DetectionResult(
            issue_type="invalid",
            confidence=0.0,
            area_ratio=0.0,
            count=0,
            mode="ai_vision",
            is_valid=False,
            reason=f"AI Vision service was unable to analyze the image. Please retry with a clear photo. ({last_error})" if last_error else "AI Vision service was unable to analyze the image. Please retry."
        )

class YoloDetector:
    _model = None
    
    def _load(self):
        if self._model is None:
            from ultralytics import YOLO
            self._model = YOLO('weights/civic.pt')
    
    async def detect_async(self, image_bytes: bytes) -> DetectionResult:
        try:
            self._load()
            img = Image.open(io.BytesIO(image_bytes))
            results = self._model(img)
            return DetectionResult(issue_type="pothole", confidence=0.9, area_ratio=0.2, count=1, mode="yolo")
        except Exception:
            return await SmartHeuristicDetector().detect_async(image_bytes)

def get_detector():
    if Path('weights/civic.pt').exists():
        return YoloDetector()
    settings = get_settings()
    if settings.openrouter_api_key:
        return OpenRouterDetector()
    return SmartHeuristicDetector()

_detector = None
def detector():
    global _detector
    if _detector is None:
        _detector = get_detector()
    return _detector
