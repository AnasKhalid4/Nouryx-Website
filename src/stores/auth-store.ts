import { create } from "zustand";
import type { AuthUser } from "@/types/user";

interface AuthState {
    user: AuthUser | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    uid: string | null;
    role: "user" | "salon" | null;

    setUser: (user: AuthUser) => void;
    clearUser: () => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoggedIn: false,
    isLoading: true,
    uid: null,
    role: null,

    setUser: (user) =>
        set({
            user,
            isLoggedIn: true,
            isLoading: false,
            uid: user.uid,
            role: user.role,
        }),

    clearUser: () =>
        set({
            user: null,
            isLoggedIn: false,
            isLoading: false,
            uid: null,
            role: null,
        }),

    setLoading: (loading) => set({ isLoading: loading }),
}));
