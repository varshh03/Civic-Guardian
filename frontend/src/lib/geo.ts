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

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en,ta',
        },
      }
    );
    if (!res.ok) return '';
    const data = await res.json();
    if (!data) return '';

    if (data.address) {
      const addr = data.address;
      const parts = [
        addr.road || addr.pedestrian || addr.street || addr.footway || addr.path || addr.amenity,
        addr.neighbourhood || addr.suburb || addr.residential || addr.commercial || addr.quarter,
        addr.village || addr.town || addr.city_district || addr.city || 'Karur',
        addr.postcode,
      ].filter(Boolean);

      if (parts.length > 0) {
        return parts.join(', ');
      }
    }
    return data.display_name || '';
  } catch (err) {
    console.warn('Reverse geocode failed:', err);
    return '';
  }
}

export async function searchAddressSuggestions(query: string): Promise<AddressSuggestion[]> {
  const q = query.trim();
  if (!q || q.length < 2) return [];

  try {
    const encoded = encodeURIComponent(q);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&addressdetails=1&limit=6&countrycodes=in`,
      {
        headers: {
          'Accept-Language': 'en,ta',
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
    console.warn('Search address suggestions failed:', err);
    return [];
  }
}
