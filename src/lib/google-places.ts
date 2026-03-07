// Google Places API service — uses Next.js API proxy to avoid CORS
// Mirrors: google_places_service.dart

export interface PlacePrediction {
    description: string;
    placeId: string;
}

export interface PlaceDetails {
    placeId: string;
    address: string;
    city: string;
    country: string;
    lat: number;
    lng: number;
}

/**
 * Autocomplete search for places (via server proxy)
 */
export async function autocomplete(queryStr: string): Promise<PlacePrediction[]> {
    if (!queryStr.trim()) return [];

    try {
        const response = await fetch(
            `/api/places?action=autocomplete&input=${encodeURIComponent(queryStr)}`
        );
        if (!response.ok) return [];
        return await response.json();
    } catch {
        return [];
    }
}

/**
 * Get place details (via server proxy)
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    if (!placeId) return null;

    try {
        const response = await fetch(
            `/api/places?action=details&placeId=${encodeURIComponent(placeId)}`
        );
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

/**
 * Reverse geocode coordinates to get city name
 */
export async function reverseGeocode(
    lat: number,
    lng: number
): Promise<{ city: string; country: string }> {
    const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== "OK" || !data.results.length) {
            return { city: "", country: "" };
        }

        let city = "";
        let country = "";
        const components = data.results[0].address_components || [];
        for (const comp of components) {
            if (comp.types.includes("locality")) {
                city = comp.long_name;
            } else if (comp.types.includes("administrative_area_level_1") && !city) {
                city = comp.long_name;
            }
            if (comp.types.includes("country")) {
                country = comp.long_name;
            }
        }

        return { city, country };
    } catch {
        return { city: "", country: "" };
    }
}
