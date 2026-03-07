"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
    fetchSalonReviews,
    submitReview,
} from "@/lib/firebase/firestore";
import { queryKeys } from "@/lib/query-keys";
import type { ReviewModel } from "@/types/review";


function parseReview(
    id: string,
    data: Record<string, unknown>,
    userName: string,
    userImage: string
): ReviewModel {
    return {
        id,
        userId: (data.userId as string) || "",
        userName,
        userImage: userImage || undefined,
        reviewImage: (data.reviewImage as string) || undefined,
        rating: Number(data.rating ?? 0),
        comment: (data.comment as string) || "",
        createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
    };
}

/**
 * Fetch salon reviews with user info
 * Mirrors: review_model.dart → fromFirestoreAsync
 */
export function useSalonReviews(salonId: string, limit = 10) {
    return useQuery<ReviewModel[]>({
        queryKey: queryKeys.salons.reviews(salonId),
        queryFn: async () => {
            const rawReviews = await fetchSalonReviews(salonId, limit);

            const reviews: ReviewModel[] = [];
            for (const raw of rawReviews) {
                const userId = (raw.userId as string) || "";

                // Fetch user data for name and image
                let userName = "Unknown User";
                let userImage = "";
                if (userId) {
                    try {
                        const userDoc = await getDoc(doc(db, "users", userId));
                        if (userDoc.exists()) {
                            const userData = (userDoc.data().data as Record<string, unknown>) || {};
                            userName = (userData.fullName as string) || "Unknown User";
                            userImage = (userData.profileImage as string) || "";
                        }
                    } catch {
                        // User might be deleted
                    }
                }

                reviews.push(
                    parseReview(raw.id as string, raw, userName, userImage)
                );
            }

            return reviews;
        },
        enabled: !!salonId,
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Submit a review for a completed booking
 */
export function useSubmitReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: {
            salonId: string;
            bookingId: string;
            userId: string;
            rating: number;
            comment: string;
            reviewImage?: string;
        }) => {
            await submitReview(params.salonId, params.bookingId, {
                userId: params.userId,
                rating: params.rating,
                comment: params.comment,
                reviewImage: params.reviewImage || null,
            });

            // Update salon rating (increment)
            const salonRef = doc(db, "users", params.salonId);
            const salonSnap = await getDoc(salonRef);
            if (salonSnap.exists()) {
                const salonData = (salonSnap.data().salon as Record<string, unknown>) || {};
                const currentRating = Number(salonData.rating ?? 0);
                const currentCount = Number(salonData.ratingCount ?? 0);
                const newCount = currentCount + 1;
                const newRating =
                    (currentRating * currentCount + params.rating) / newCount;

                await updateDoc(salonRef, {
                    "salon.rating": Math.round(newRating * 10) / 10,
                    "salon.ratingCount": newCount,
                });
            }
        },
        onSuccess: (_, params) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.salons.reviews(params.salonId),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.bookings.all,
            });
        },
    });
}
