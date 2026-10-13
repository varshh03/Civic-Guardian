import io
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
from app.services.duplicates import haversine_m
from app.models import Verification

def _get_exif_gps(image_bytes: bytes) -> tuple[float, float] | None:
    try:
        img = Image.open(io.BytesIO(image_bytes))
        exif = img._getexif()
        if not exif:
            return None
        gps_info = {}
        for tag_id, value in exif.items():
            tag = TAGS.get(tag_id)
            if tag == 'GPSInfo':
                for gps_tag_id, gps_value in value.items():
                    gps_tag = GPSTAGS.get(gps_tag_id)
                    gps_info[gps_tag] = gps_value
        if 'GPSLatitude' in gps_info and 'GPSLongitude' in gps_info:
            def dms_to_decimal(dms, ref):
                d, m, s = [float(x) for x in dms]
                result = d + m/60 + s/3600
                if ref in ('S', 'W'):
                    result = -result
                return result
            lat = dms_to_decimal(gps_info['GPSLatitude'], gps_info.get('GPSLatitudeRef', 'N'))
            lng = dms_to_decimal(gps_info['GPSLongitude'], gps_info.get('GPSLongitudeRef', 'E'))
            return lat, lng
    except Exception:
        pass
    return None

def verify_image(image_bytes: bytes, submitted_lat: float, submitted_lng: float, ai_confidence: float) -> Verification:
    exif_gps = _get_exif_gps(image_bytes)
    exif_gps_match = None
    if exif_gps:
        dist = haversine_m(exif_gps[0], exif_gps[1], submitted_lat, submitted_lng)
        exif_gps_match = dist <= 500
    needs_review = ai_confidence < 0.4 or (exif_gps_match is False)
    return Verification(
        ai_confidence=ai_confidence,
        exif_gps_match=exif_gps_match,
        duplicate_checked=True,
        needs_review=needs_review
    )
