"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    fetchFavorites,
    addFavorite,
    removeFavorite,
    fetchSalonById,
} from "@/lib/firebase/firestore";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "./use-auth";
import { useLocationStore } from "@/stores/location-store";
import type { SalonModel } from "@/types/salon";

/**
 * Fetch favorite salon IDs
 */
export function useFavoriteIds() {
    const { uid } = useAuth();

    return useQuery<string[]>({
        queryKey: queryKeys.favorites.list(uid || ""),
        queryFn: () => fetchFavorites(uid!),
        enabled: !!uid,
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Fetch favorite salons with full data
 */
export function useFavoriteSalons() {
    const { uid } = useAuth();
    const { lat, lng } = useLocationStore();

    return useQuery<SalonModel[]>({
        queryKey: [...queryKeys.favorites.list(uid || ""), "full"],
        queryFn: async () => {
            if (!uid) return [];
            const favoriteIds = await fetchFavorites(uid);

            const salons: SalonModel[] = [];
            for (const salonId of favoriteIds) {
                const salon = await fetchSalonById(
                    salonId,
                    lat ?? undefined,
                    lng ?? undefined
                );
                if (salon) salons.push(salon);
            }

            return salons;
        },
        enabled: !!uid,
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Check if a salon is in favorites
 */
export function useIsFavorite(salonId: string): boolean {
    const { data: favoriteIds } = useFavoriteIds();
    return favoriteIds?.includes(salonId) ?? false;
}

/**
 * Toggle favorite (add/remove)
 */
export function useToggleFavorite() {
    const queryClient = useQueryClient();
    const { uid } = useAuth();

    return useMutation({
        mutationFn: async (params: { salonId: string; isFavorite: boolean }) => {
            if (!uid) throw new Error("Not logged in");

            if (params.isFavorite) {
                await removeFavorite(uid, params.salonId);
            } else {
                await addFavorite(uid, params.salonId);
            }
        },
        onMutate: async (params) => {
            // Optimistic update
            if (!uid) return;

            await queryClient.cancelQueries({
                queryKey: queryKeys.favorites.list(uid),
            });

            const prev = queryClient.getQueryData<string[]>(
                queryKeys.favorites.list(uid)
            );

            queryClient.setQueryData<string[]>(
                queryKeys.favorites.list(uid),
                (old) => {
                    if (!old) return params.isFavorite ? [] : [params.salonId];
                    return params.isFavorite
                        ? old.filter((id) => id !== params.salonId)
                        : [...old, params.salonId];
                }
            );

            return { prev };
        },
        onError: (_, __, context) => {
            // Rollback on error
            if (uid && context?.prev) {
                queryClient.setQueryData(
                    queryKeys.favorites.list(uid),
                    context.prev
                );
            }
        },
        onSettled: () => {
            if (uid) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.favorites.list(uid),
                });
            }
        },
    });
}
