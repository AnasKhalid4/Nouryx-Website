"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
    fetchSalonWeeklySchedule,
    saveDaySchedule,
    saveFullWeeklySchedule,
} from "@/lib/firebase/firestore";
import type { TimeRange } from "@/types/team-member";
import { toast } from "sonner";

/**
 * Fetch salon weekly schedule
 */
export function useWeeklySchedule(salonId: string | undefined) {
    return useQuery({
        queryKey: queryKeys.schedule.bySalon(salonId || ""),
        queryFn: () => fetchSalonWeeklySchedule(salonId!),
        enabled: !!salonId,
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Save a single day's schedule
 */
export function useSaveDaySchedule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            salonId,
            dayKey,
            ranges,
        }: {
            salonId: string;
            dayKey: string;
            ranges: TimeRange[];
        }) => {
            return saveDaySchedule(salonId, dayKey, ranges);
        },
        onSuccess: (_, { salonId }) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.schedule.bySalon(salonId),
            });
            toast.success("Schedule saved");
        },
        onError: (err: Error) => {
            toast.error("Failed to save schedule: " + err.message);
        },
    });
}

/**
 * Save the entire weekly schedule at once
 */
export function useSaveFullSchedule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            salonId,
            schedule,
        }: {
            salonId: string;
            schedule: Record<string, TimeRange[]>;
        }) => {
            return saveFullWeeklySchedule(salonId, schedule);
        },
        onSuccess: (_, { salonId }) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.schedule.bySalon(salonId),
            });
            toast.success("Weekly schedule saved");
        },
        onError: (err: Error) => {
            toast.error("Failed to save schedule: " + err.message);
        },
    });
}
