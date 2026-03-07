"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { fetchUser } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/stores/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setUser, clearUser, setLoading } = useAuthStore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const user = await fetchUser(firebaseUser.uid);

                    // Block check
                    if (user.isBlock === "1") {
                        await auth.signOut();
                        clearUser();
                        return;
                    }

                    // Salon status check
                    if (
                        user.role === "salon" &&
                        user.salon?.status === "pending"
                    ) {
                        await auth.signOut();
                        clearUser();
                        return;
                    }

                    setUser(user);
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    clearUser();
                }
            } else {
                clearUser();
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [setUser, clearUser, setLoading]);

    return <>{children}</>;
}
