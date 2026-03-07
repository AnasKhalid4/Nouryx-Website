"use client";

import { useEffect } from "react";
import { useLocationStore } from "@/stores/location-store";

/**
 * Invisible component that requests geolocation permission on mount.
 * Place in root layout so it runs once when the app loads.
 */
export function LocationPrompt() {
    const { lat, setLocation, setPermission, setLoading } = useLocationStore();

    useEffect(() => {
        // Skip if we already have a location cached
        if (lat !== null) return;

        // Check if geolocation is available
        if (!navigator.geolocation) return;

        setLoading(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setPermission(true);
                setLoading(false);
            },
            (error) => {
                console.warn("Geolocation denied or failed:", error.message);
                setPermission(false);
                setLoading(false);
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 1000 * 60 * 60, // Cache for 1 hour
            }
        );
    }, [lat, setLocation, setPermission, setLoading]);

    return null; // Invisible component
}
