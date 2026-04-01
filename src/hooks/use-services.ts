"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    fetchSalonServices,
    addSalonService,
    updateSalonService,
    deleteSalonService,
} from "@/lib/firebase/firestore";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "./use-auth";
import type { SalonService } from "@/types/user";

export function useMyServices() {
    const { uid, role } = useAuth();

    return useQuery<SalonService[]>({
        queryKey: queryKeys.salons.services(uid || ""),
        queryFn: () => fetchSalonServices(uid!),
        enabled: !!uid && role === "salon",
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Add a new service
 */
export function useAddService() {
    const queryClient = useQueryClient();
    const { uid } = useAuth();

    return useMutation({
        mutationFn: async (
            data: Omit<SalonService, "id" | "createdAt"> & { serviceId: string }
        ) => {
            if (!uid) throw new Error("Not logged in");
            const { serviceId, ...serviceData } = data;
            await addSalonService(uid, serviceId, serviceData);
        },
        onSuccess: () => {
            if (uid) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.salons.services(uid),
                });
            }
        },
    });
}

/**
 * Update an existing service
 */
export function useUpdateService() {
    const queryClient = useQueryClient();
    const { uid } = useAuth();

    return useMutation({
        mutationFn: async (params: {
            serviceId: string;
            data: Partial<Omit<SalonService, "id" | "createdAt">>;
        }) => {
            if (!uid) throw new Error("Not logged in");
            await updateSalonService(uid, params.serviceId, params.data);
        },
        onSuccess: () => {
            if (uid) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.salons.services(uid),
                });
            }
        },
    });
}

/**
 * Delete a service
 */
export function useDeleteService() {
    const queryClient = useQueryClient();
    const { uid } = useAuth();

    return useMutation({
        mutationFn: async (serviceId: string) => {
            if (!uid) throw new Error("Not logged in");
            await deleteSalonService(uid, serviceId);
        },
        onSuccess: () => {
            if (uid) {
                queryClient.invalidateQueries({
                    queryKey: queryKeys.salons.services(uid),
                });
            }
        },
    });
}
