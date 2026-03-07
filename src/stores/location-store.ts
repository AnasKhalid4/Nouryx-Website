import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LocationState {
    lat: number | null;
    lng: number | null;
    address: string;
    city: string;
    country: string;
    hasPermission: boolean;
    isLoading: boolean;

    setLocation: (data: {
        lat: number;
        lng: number;
        address?: string;
        city?: string;
        country?: string;
    }) => void;
    setPermission: (granted: boolean) => void;
    setLoading: (loading: boolean) => void;
    clearLocation: () => void;
}

export const useLocationStore = create<LocationState>()(
    persist(
        (set) => ({
            lat: null,
            lng: null,
            address: "",
            city: "",
            country: "",
            hasPermission: false,
            isLoading: false,

            setLocation: (data) =>
                set({
                    lat: data.lat,
                    lng: data.lng,
                    address: data.address || "",
                    city: data.city || "",
                    country: data.country || "",
                    hasPermission: true,
                    isLoading: false,
                }),

            setPermission: (granted) => set({ hasPermission: granted }),
            setLoading: (loading) => set({ isLoading: loading }),
            clearLocation: () =>
                set({
                    lat: null,
                    lng: null,
                    address: "",
                    city: "",
                    country: "",
                    hasPermission: false,
                }),
        }),
        { name: "nouryx-location" }
    )
);
