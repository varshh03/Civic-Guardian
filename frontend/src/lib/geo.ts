export function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 12000,
      enableHighAccuracy: true,
      maximumAge: 0,
    });
  });
}

export const KARUR_CENTER: [number, number] = [10.9574, 78.0809];

export interface AddressSuggestion {
  displayName: string;
  formattedAddress: string;
  lat: number;
  lng: number;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function reverseGeocode(lat: number, lng: number, lang?: string): Promise<string> {
  const activeLang = lang || localStorage.getItem('civic_lang') || 'ta';
  try {
    const res = await fetch(`${API_BASE}/geocode/reverse?lat=${lat}&lng=${lng}&lang=${activeLang}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.address) {
        return data.address;
      }
    }
  } catch (err) {
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': activeLang === 'ta' ? 'ta,en' : 'en,ta',
        },
      }
    );
    if (!res.ok) return '';
    const data = await res.json();
    if (!data) return '';

    if (data.address) {
      const addr = data.address;
      const point = addr.amenity || addr.building || addr.shop || addr.office || addr.tourism || addr.leisure || '';
      const road = addr.road || addr.pedestrian || addr.street || addr.footway || addr.path || addr.alley || '';
      const house = addr.house_number || '';
      const roadStr = house && road ? `${house}, ${road}` : road;
      const area = addr.suburb || addr.neighbourhood || addr.residential || addr.commercial || addr.village || addr.hamlet || addr.quarter || '';
      const city = addr.city || addr.town || addr.city_district || addr.municipality || addr.county || '';
      const pin = addr.postcode || '';

      const parts = [point, roadStr, area, city].filter((p, idx, arr) => Boolean(p) && arr.indexOf(p) === idx);
      if (parts.length > 0) {
        let formatted = parts.join(', ');
        if (pin && !formatted.includes(pin)) formatted += ` - ${pin}`;
        return formatted;
      }
    }
    if (data.display_name) {
      const parts = data.display_name.split(',').map((p: string) => p.trim()).filter((p: string) => !['india', 'இந்தியா', 'இந்திய'].includes(p.toLowerCase()));
      return parts.join(', ');
    }
    return '';
  } catch (err) {
    return '';
  }
}

export async function searchAddressSuggestions(query: string, lang?: string): Promise<AddressSuggestion[]> {
  const q = query.trim();
  if (!q || q.length < 2) return [];
  const activeLang = lang || localStorage.getItem('civic_lang') || 'ta';

  try {
    const res = await fetch(`${API_BASE}/geocode/search?q=${encodeURIComponent(q)}&lang=${activeLang}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
  }

  try {
    const encoded = encodeURIComponent(q);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&addressdetails=1&limit=6&countrycodes=in`,
      {
        headers: {
          'Accept-Language': activeLang === 'ta' ? 'ta,en' : 'en,ta',
        },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((item: any) => {
      const addr = item.address || {};
      const parts = [
        item.name || addr.road || addr.pedestrian || addr.amenity || addr.building,
        addr.neighbourhood || addr.suburb || addr.residential,
        addr.village || addr.town || addr.city_district || addr.city,
        addr.postcode,
      ].filter(Boolean);

      const formatted = parts.length > 0 ? Array.from(new Set(parts)).join(', ') : item.display_name;
      return {
        displayName: item.display_name,
        formattedAddress: formatted,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      };
    });
  } catch (err) {
    return [];
  }
}
