"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
    fetchSalonTeamMembers,
    fetchAllTeamMembers,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
} from "@/lib/firebase/firestore";
import { uploadImage } from "@/lib/firebase/storage";
import type { TeamMemberModel } from "@/types/team-member";
import { toast } from "sonner";

/**
 * Fetch enabled team members for a salon (user-facing — booking flow)
 */
export function useTeamMembers(salonId: string | undefined) {
    return useQuery({
        queryKey: queryKeys.teamMembers.bySalon(salonId || ""),
        queryFn: () => fetchSalonTeamMembers(salonId!),
        enabled: !!salonId,
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Fetch ALL team members for a salon (dashboard — includes disabled)
 */
export function useAllTeamMembers(salonId: string | undefined) {
    return useQuery({
        queryKey: queryKeys.teamMembers.allBySalon(salonId || ""),
        queryFn: () => fetchAllTeamMembers(salonId!),
        enabled: !!salonId,
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Add a new team member
 */
export function useAddTeamMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            salonId,
            data,
            imageFile,
        }: {
            salonId: string;
            data: Omit<TeamMemberModel, "id" | "image">;
            imageFile?: File | null;
        }) => {
            let imageUrl = "";
            if (imageFile) {
                const path = `users/${salonId}/team_members/${Date.now()}_${imageFile.name}`;
                imageUrl = await uploadImage(imageFile, path);
            }
            return addTeamMember(salonId, { ...data, image: imageUrl });
        },
        onSuccess: (_, { salonId }) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.teamMembers.bySalon(salonId),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.teamMembers.allBySalon(salonId),
            });
            toast.success("Team member added");
        },
        onError: (err: Error) => {
            toast.error("Failed to add team member: " + err.message);
        },
    });
}

/**
 * Update an existing team member
 */
export function useUpdateTeamMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            salonId,
            memberId,
            data,
            imageFile,
        }: {
            salonId: string;
            memberId: string;
            data: Partial<Omit<TeamMemberModel, "id">>;
            imageFile?: File | null;
        }) => {
            const updates = { ...data };
            if (imageFile) {
                const path = `users/${salonId}/team_members/${Date.now()}_${imageFile.name}`;
                updates.image = await uploadImage(imageFile, path);
            }
            return updateTeamMember(salonId, memberId, updates);
        },
        onSuccess: (_, { salonId }) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.teamMembers.bySalon(salonId),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.teamMembers.allBySalon(salonId),
            });
            toast.success("Team member updated");
        },
        onError: (err: Error) => {
            toast.error("Failed to update team member: " + err.message);
        },
    });
}

/**
 * Delete a team member
 */
export function useDeleteTeamMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            salonId,
            memberId,
        }: {
            salonId: string;
            memberId: string;
        }) => {
            return deleteTeamMember(salonId, memberId);
        },
        onSuccess: (_, { salonId }) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.teamMembers.bySalon(salonId),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.teamMembers.allBySalon(salonId),
            });
            toast.success("Team member deleted");
        },
        onError: (err: Error) => {
            toast.error("Failed to delete team member: " + err.message);
        },
    });
}
