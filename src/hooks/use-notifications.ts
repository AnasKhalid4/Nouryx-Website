"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Timestamp } from "firebase/firestore";
import {
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
} from "@/lib/firebase/firestore";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "./use-auth";
import type { AppNotification } from "@/types/notification";

function parseNotification(data: Record<string, unknown>): AppNotification {
    return {
        id: (data.id as string) || "",
        title: (data.title as string) || "",
        message: (data.message as string) || "",
        type: (data.type as string) || "order",
        orderId: (data.orderId as string) || "",
        receiverId: (data.receiverId as string) || "",
        senderId: (data.senderId as string) || "",
        isRead: (data.isRead as boolean) || false,
        createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
    };
}

/**
 * Fetch user notifications
 */
export function useNotifications() {
    const { uid } = useAuth();

    return useQuery<AppNotification[]>({
        queryKey: queryKeys.notifications.all,
        queryFn: async () => {
            if (!uid) return [];
            const raw = await fetchNotifications(uid);
            return raw.map(parseNotification);
        },
        enabled: !!uid,
        staleTime: 1000 * 60 * 2,
    });
}

/**
 * Count unread notifications
 */
export function useUnreadCount() {
    const { data: notifications } = useNotifications();
    return notifications?.filter((n) => !n.isRead).length ?? 0;
}

/**
 * Mark notification as read
 */
export function useMarkAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId: string) => {
            await markNotificationRead(notificationId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.notifications.all,
            });
        },
    });
}

/**
 * Mark all notifications as read
 */
export function useMarkAllRead() {
    const queryClient = useQueryClient();
    const { uid } = useAuth();

    return useMutation({
        mutationFn: async () => {
            if (!uid) return;
            await markAllNotificationsRead(uid);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.notifications.all,
            });
        },
    });
}

