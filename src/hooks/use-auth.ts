"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useCallback } from "react";
import { fetchUser } from "@/lib/firebase/firestore";

export function useAuth() {
    const { user, isLoggedIn, isLoading, uid, role, setUser } = useAuthStore();

    const refreshUser = useCallback(async () => {
        if (!uid) return;
        const freshUser = await fetchUser(uid);
        if (freshUser) {
            setUser(freshUser);
        }
    }, [uid, setUser]);

    return { user, isLoggedIn, isLoading, uid, role, refreshUser };
}
