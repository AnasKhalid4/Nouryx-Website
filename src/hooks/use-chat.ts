"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    collection,
    doc,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    updateDoc,
    setDoc,
    getDoc,
    getDocs,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "./use-auth";
import type { ConversationModel, ChatMessage } from "@/types/conversation";

/**
 * Real-time conversation list
 */
export function useConversations() {
    const { uid } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!uid) return;

        // Listen to ALL conversations, filter client-side (avoids composite index requirement)
        // Mirrors Flutter: chat_list_viewmodel.dart → loadChats()
        const unsubscribe = onSnapshot(collection(db, "conversations"), (snapshot) => {
            const conversations: ConversationModel[] = [];

            snapshot.docs.forEach((d) => {
                const data = d.data();
                const participants = (data.participants as string[]) || [];

                // Only include conversations where current user is a participant
                if (!participants.includes(uid)) return;

                const otherId = participants.find((p) => p !== uid) || "";
                const userInfo = (data.userInfo as Record<string, Record<string, string>>) || {};
                const otherInfo = userInfo[otherId] || {};

                conversations.push({
                    conversationId: d.id,
                    participants,
                    salonId: (data.salonId as string) || "",
                    userId: (data.userId as string) || "",
                    lastMessage: (data.lastMessage as string) || "",
                    lastMessageAt: (data.lastMessageAt as Timestamp)?.toDate() ?? new Date(),
                    lastSenderId: (data.lastSenderId as string) || "",
                    otherName: otherInfo.name || "Unknown",
                    otherImage: otherInfo.image || "",
                });
            });

            // Sort by last message time (newest first)
            conversations.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());

            queryClient.setQueryData(queryKeys.conversations.all, conversations);
        }, (error) => {
            console.error("Conversations listener error:", error);
        });

        return () => unsubscribe();
    }, [uid, queryClient]);

    return useQuery<ConversationModel[]>({
        queryKey: queryKeys.conversations.all,
        queryFn: () => [],
        staleTime: Infinity,
        enabled: !!uid,
    });
}

/**
 * Real-time chat messages
 * Mirrors: use-chat in migration plan
 */
export function useChatMessages(conversationId: string) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!conversationId) return;

        const q = query(
            collection(db, "conversations", conversationId, "messages"),
            orderBy("createdAt")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messages: ChatMessage[] = snapshot.docs.map((d) => {
                const data = d.data();
                return {
                    id: d.id,
                    senderId: (data.senderId as string) || "",
                    text: (data.text as string) || "",
                    imageUrl: (data.imageUrl as string) || null,
                    seen: (data.seen as boolean) || false,
                    createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
                };
            });

            queryClient.setQueryData(
                queryKeys.conversations.messages(conversationId),
                messages
            );
        });

        return () => unsubscribe();
    }, [conversationId, queryClient]);

    return useQuery<ChatMessage[]>({
        queryKey: queryKeys.conversations.messages(conversationId),
        queryFn: () => [],
        staleTime: Infinity,
        enabled: !!conversationId,
    });
}

/**
 * Send a text or image message
 */
export function useSendMessage() {
    const { uid } = useAuth();

    return useMutation({
        mutationFn: async (params: {
            conversationId: string;
            text: string;
            imageUrl?: string;
        }) => {
            if (!uid) throw new Error("Not logged in");

            const messagesRef = collection(
                db,
                "conversations",
                params.conversationId,
                "messages"
            );

            await addDoc(messagesRef, {
                senderId: uid,
                text: params.text,
                imageUrl: params.imageUrl || null,
                seen: false,
                createdAt: serverTimestamp(),
            });

            // Update conversation last message
            const convRef = doc(db, "conversations", params.conversationId);
            await updateDoc(convRef, {
                lastMessage: params.imageUrl ? "📷 Image" : params.text,
                lastMessageAt: serverTimestamp(),
                lastSenderId: uid,
            });
        },
    });
}

/**
 * Create a new conversation (from salon detail page)
 */
export function useCreateConversation() {
    const { uid, user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: {
            salonId: string;
            salonName: string;
            salonImage: string;
        }): Promise<string> => {
            if (!uid || !user) throw new Error("Not logged in");

            // Check if conversation already exists
            const q = query(
                collection(db, "conversations"),
                where("participants", "array-contains", uid)
            );
            const snap = await getDocs(q);

            const existing = snap.docs.find((d) => {
                const parts = d.data().participants as string[];
                return parts.includes(params.salonId);
            });

            if (existing) return existing.id;

            // Create new conversation
            const conversationId = `${uid}_${params.salonId}`;
            const convRef = doc(db, "conversations", conversationId);

            await setDoc(convRef, {
                conversationId,
                participants: [uid, params.salonId],
                salonId: params.salonId,
                userId: uid,
                userInfo: {
                    [uid]: {
                        name: user.profile.fullName,
                        image: user.profile.profileImage,
                    },
                    [params.salonId]: {
                        name: params.salonName,
                        image: params.salonImage,
                    },
                },
                lastMessage: "",
                lastMessageAt: serverTimestamp(),
                lastSenderId: "",
            });

            queryClient.invalidateQueries({
                queryKey: queryKeys.conversations.all,
            });

            return conversationId;
        },
    });
}

/**
 * Delete a conversation
 */
export function useDeleteConversation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (conversationId: string) => {
            // Import deleteConversation which deletes all messages + the conversation doc
            const { deleteConversation } = await import("@/lib/firebase/firestore");
            await deleteConversation(conversationId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.conversations.all,
            });
        },
    });
}
