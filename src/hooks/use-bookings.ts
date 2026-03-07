"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Timestamp } from "firebase/firestore";
import {
    fetchUserBookingIds,
    fetchUserBookings,
    fetchSalonBookings,
    fetchBookingById,
    createBooking,
    updateBookingStatus,
} from "@/lib/firebase/firestore";
import { sendUserNotification } from "@/lib/notifications";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "./use-auth";
import type { BookingModel, BookingStatus } from "@/types/booking";

// --------------------------------------------------
// Parse Firestore booking data to BookingModel
// --------------------------------------------------
function parseBooking(data: Record<string, unknown>): BookingModel {
    const schedule = (data.schedule as Record<string, unknown>) || {};
    const pricing = (data.pricing as Record<string, unknown>) || {};
    const review = data.review as Record<string, unknown> | null;
    const salon = (data.salon as Record<string, unknown>) || {};
    const user = (data.user as Record<string, unknown>) || {};
    const services = (data.services as Record<string, unknown>[]) || [];

    const parseDate = (val: unknown): Date => {
        if (!val) return new Date();
        if (val instanceof Timestamp) return val.toDate();
        if (typeof val === "string") return new Date(val);
        return new Date();
    };

    const salonOwner = (salon.owner as Record<string, unknown>) || {};

    return {
        bookingId: (data.bookingId as string) || "",
        status: (data.status as BookingStatus) || "pending",
        salon: {
            salonId: (salon.salonId as string) || "",
            shopName: (salon.shopName as string) || "",
            city: (salon.city as string) || "",
            address: (salon.address as string) || "",
            country: (salon.country as string) || "",
            lat: Number(salon.lat ?? 0),
            lng: Number(salon.lng ?? 0),
            placeId: (salon.placeId as string) || "",
            owner: {
                fullName: (salonOwner.fullName as string) || "",
                phoneNumber: (salonOwner.phoneNumber as string) || "",
                email: (salonOwner.email as string) || "",
                profileImage: (salonOwner.profileImage as string) || "",
            },
        },
        user: {
            userId: (user.userId as string) || "",
            fullName: (user.fullName as string) || "",
            phoneNumber: (user.phoneNumber as string) || "",
            profileImage: (user.profileImage as string) || "",
        },
        services: services.map((s) => ({
            serviceId: (s.serviceId as string) || "",
            name: (s.name as string) || "",
            categoryId: (s.categoryId as string) || "",
            providerId: (s.providerId as string) || "",
            minutes: Number(s.minutes ?? 0),
            price: Number(s.price ?? 0),
        })),
        schedule: {
            startAt: (schedule.startAt as string) || "",
            endAt: (schedule.endAt as string) || "",
            durationMinutes: Number(schedule.durationMinutes ?? 0),
        },
        pricing: {
            total: Number(pricing.total ?? 0),
            currency: (pricing.currency as string) || "EUR",
        },
        notes: (data.notes as string) || null,
        review: review
            ? {
                isReviewed: (review.isReviewed as boolean) || false,
                rating: Number(review.rating ?? 0),
                comment: (review.comment as string) || "",
                reviewImage: (review.reviewImage as string) || null,
                userId: (review.userId as string) || "",
                reviewedAt: review.reviewedAt ? parseDate(review.reviewedAt) : null,
            }
            : null,
        cancelReason: data.cancelReason as string | undefined,
        cancelledBy: data.cancelledBy as string | undefined,
        cancelledAt: data.cancelledAt ? parseDate(data.cancelledAt) : undefined,
        createdAt: parseDate(data.createdAt),
    };
}

/**
 * Fetch user bookings — queries bookings collection directly by user.userId
 */
export function useUserBookings() {
    const { uid } = useAuth();

    return useQuery<BookingModel[]>({
        queryKey: queryKeys.bookings.userBookingIds(uid || ""),
        queryFn: async () => {
            if (!uid) return [];
            const docs = await fetchUserBookings(uid);
            return docs
                .map(parseBooking)
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        },
        enabled: !!uid,
        staleTime: 1000 * 60 * 2,
    });
}

/**
 * Fetch a single booking by ID
 */
export function useBooking(bookingId: string) {
    const { uid } = useAuth();

    return useQuery<BookingModel | null>({
        queryKey: queryKeys.bookings.detail(bookingId),
        queryFn: async () => {
            if (!uid || !bookingId) return null;
            const data = await fetchBookingById(bookingId);
            if (!data) return null;
            return parseBooking(data);
        },
        enabled: !!uid && !!bookingId,
        staleTime: 1000 * 60 * 2,
    });
}

/**
 * Fetch salon's bookings — queries bookings collection directly by salon.salonId
 */
export function useSalonBookings() {
    const { uid } = useAuth();

    return useQuery<BookingModel[]>({
        queryKey: queryKeys.bookings.salonBookingIds(uid || ""),
        queryFn: async () => {
            if (!uid) return [];
            const docs = await fetchSalonBookings(uid);
            return docs
                .map(parseBooking)
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        },
        enabled: !!uid,
        staleTime: 1000 * 60 * 2,
    });
}

/**
 * Create a new booking
 */
export function useCreateBooking() {
    const queryClient = useQueryClient();
    const { uid } = useAuth();

    return useMutation({
        mutationFn: async (params: {
            bookingId: string;
            salonId: string;
            bookingData: Record<string, unknown>;
        }) => {
            if (!uid) throw new Error("Not logged in");
            await createBooking(
                params.bookingId,
                uid,
                params.salonId,
                params.bookingData
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.bookings.all,
            });
        },
    });
}

/**
 * Cancel a booking
 */
export function useCancelBooking() {
    const queryClient = useQueryClient();
    const { uid } = useAuth();

    return useMutation({
        mutationFn: async (params: {
            bookingId: string;
            reason: string;
            receiverId: string;
            salonName: string;
        }) => {
            if (!uid) throw new Error("Not logged in");

            await updateBookingStatus(params.bookingId, "cancelled", {
                cancelReason: params.reason,
                cancelledBy: uid,
                cancelledAt: new Date().toISOString(),
            });

            // Send notification
            await sendUserNotification({
                receiverId: params.receiverId,
                senderId: uid,
                title: "Booking Cancelled",
                message: `A booking at ${params.salonName} has been cancelled.`,
                orderId: params.bookingId,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.bookings.all,
            });
        },
    });
}

/**
 * Accept a booking (salon)
 */
export function useAcceptBooking() {
    const queryClient = useQueryClient();
    const { uid } = useAuth();

    return useMutation({
        mutationFn: async (params: {
            bookingId: string;
            userId: string;
            salonName: string;
        }) => {
            if (!uid) throw new Error("Not logged in");

            await updateBookingStatus(params.bookingId, "inprocess");

            await sendUserNotification({
                receiverId: params.userId,
                senderId: uid,
                title: "Booking Accepted",
                message: `Your booking at ${params.salonName} has been accepted!`,
                orderId: params.bookingId,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.bookings.all,
            });
        },
    });
}

/**
 * Complete a booking (salon)
 */
export function useCompleteBooking() {
    const queryClient = useQueryClient();
    const { uid } = useAuth();

    return useMutation({
        mutationFn: async (params: {
            bookingId: string;
            userId: string;
            salonName: string;
        }) => {
            if (!uid) throw new Error("Not logged in");

            await updateBookingStatus(params.bookingId, "completed");

            await sendUserNotification({
                receiverId: params.userId,
                senderId: uid,
                title: "Booking Completed",
                message: `Your session at ${params.salonName} is complete. Leave a review!`,
                orderId: params.bookingId,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.bookings.all,
            });
        },
    });
}
