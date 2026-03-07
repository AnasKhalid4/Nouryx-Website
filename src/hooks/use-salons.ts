"use client";

import { useQuery } from "@tanstack/react-query";
import {
    fetchFeaturedSalons,
    fetchNearbySalons,
    fetchForYouSalons,
    fetchAllApprovedSalons,
    fetchSalonById,
    fetchSalonServices,
} from "@/lib/firebase/firestore";
import { queryKeys } from "@/lib/query-keys";
import { useLocationStore } from "@/stores/location-store";
import type { SalonModel } from "@/types/salon";
import type { SalonService } from "@/types/user";

/**
 * Fetch featured salons
 * Mirrors: salon_firestore_service.dart → fetchFeaturedSalons
 */
export function useFeaturedSalons() {
    const { lat, lng } = useLocationStore();

    return useQuery({
        queryKey: queryKeys.salons.featured(lat, lng),
        queryFn: async () => {
            const result = await fetchFeaturedSalons(
                lat ?? undefined,
                lng ?? undefined
            );
            return result.salons;
        },
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Fetch nearby salons (within 5km)
 */
export function useNearbySalons() {
    const { lat, lng, hasPermission } = useLocationStore();

    return useQuery({
        queryKey: queryKeys.salons.nearby(lat ?? 0, lng ?? 0),
        queryFn: async () => {
            if (!lat || !lng) return [];
            const result = await fetchNearbySalons(lat, lng);
            return result.salons;
        },
        enabled: hasPermission && lat !== null && lng !== null,
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Fetch "For You" salons (all approved, not featured)
 */
export function useForYouSalons() {
    const { lat, lng } = useLocationStore();

    return useQuery({
        queryKey: queryKeys.salons.forYou(lat, lng),
        queryFn: async () => {
            const result = await fetchForYouSalons(
                lat ?? undefined,
                lng ?? undefined
            );
            return result.salons;
        },
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Fetch all approved salons for search page
 */
export function useAllSalons() {
    const { lat, lng } = useLocationStore();

    return useQuery({
        queryKey: queryKeys.salons.search(lat, lng),
        queryFn: async () => {
            return await fetchAllApprovedSalons(
                lat ?? undefined,
                lng ?? undefined
            );
        },
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Fetch single salon detail by ID
 */
export function useSalonDetail(salonId: string) {
    const { lat, lng } = useLocationStore();

    return useQuery<SalonModel | null>({
        queryKey: queryKeys.salons.detail(salonId),
        queryFn: async () => {
            const salon = await fetchSalonById(
                salonId,
                lat ?? undefined,
                lng ?? undefined
            );
            if (!salon) return null;

            // Also fetch services
            const services = await fetchSalonServices(salonId);
            return { ...salon, services };
        },
        enabled: !!salonId,
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Fetch services for a salon
 */
export function useSalonServices(salonId: string) {
    return useQuery<SalonService[]>({
        queryKey: queryKeys.salons.services(salonId),
        queryFn: () => fetchSalonServices(salonId),
        enabled: !!salonId,
        staleTime: 1000 * 60 * 5,
    });
}
