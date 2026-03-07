"use client";

import { useCallback } from "react";
import { useLocationStore } from "@/stores/location-store";
import { reverseGeocode } from "@/lib/google-places";

export function useLocation() {
    const { lat, lng, city, country, hasPermission, isLoading, setLocation, setLoading, setPermission } =
        useLocationStore();

    const requestLocation = useCallback(async () => {
        if (!navigator.geolocation) {
            console.warn("Geolocation not supported");
            setPermission(false);
            return;
        }

        setLoading(true);

        try {
            const position = await new Promise<GeolocationPosition>(
                (resolve, reject) =>
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0,
                    })
            );

            const { latitude, longitude } = position.coords;

            // Reverse geocode to get city name
            const geo = await reverseGeocode(latitude, longitude);

            setLocation({
                lat: latitude,
                lng: longitude,
                city: geo.city,
                country: geo.country,
            });
        } catch (error) {
            console.warn("Geolocation error:", error);
            setPermission(false);
            setLoading(false);
        }
    }, [setLocation, setLoading, setPermission]);

    return {
        lat,
        lng,
        city,
        country,
        hasPermission,
        isLoading,
        requestLocation,
    };
}
