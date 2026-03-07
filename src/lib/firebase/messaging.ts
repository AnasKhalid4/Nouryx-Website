import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import app from "./config";

// --------------------------------------------------
// FCM WEB PUSH SETUP
// --------------------------------------------------

let messagingInstance: ReturnType<typeof getMessaging> | null = null;

async function getMessagingInstance() {
    if (messagingInstance) return messagingInstance;
    const supported = await isSupported();
    if (!supported) {
        console.warn("Firebase Messaging is not supported in this browser");
        return null;
    }
    messagingInstance = getMessaging(app);
    return messagingInstance;
}

// --------------------------------------------------
// REQUEST PERMISSION + GET TOKEN
// --------------------------------------------------
export async function requestNotificationPermission(): Promise<string | null> {
    try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.log("Notification permission denied");
            return null;
        }

        const messaging = await getMessagingInstance();
        if (!messaging) return null;

        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
            console.warn("VAPID key not configured");
            return null;
        }

        // Register and wait for the service worker to be active
        const registration = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js"
        );

        // Wait until the service worker is active
        if (registration.installing) {
            await new Promise<void>((resolve) => {
                registration.installing!.addEventListener("statechange", function handler() {
                    if (this.state === "activated") {
                        this.removeEventListener("statechange", handler);
                        resolve();
                    }
                });
            });
        } else if (registration.waiting) {
            await new Promise<void>((resolve) => {
                registration.waiting!.addEventListener("statechange", function handler() {
                    if (this.state === "activated") {
                        this.removeEventListener("statechange", handler);
                        resolve();
                    }
                });
            });
        }
        // If registration.active already exists, no need to wait

        const token = await getToken(messaging, {
            vapidKey,
            serviceWorkerRegistration: registration,
        });

        return token;
    } catch (error) {
        console.error("Error getting notification permission:", error);
        return null;
    }
}

// --------------------------------------------------
// FOREGROUND MESSAGE HANDLER
// --------------------------------------------------
export async function onForegroundMessage(
    callback: (payload: {
        title?: string;
        body?: string;
        data?: Record<string, string>;
    }) => void
): Promise<(() => void) | null> {
    const messaging = await getMessagingInstance();
    if (!messaging) return null;

    return onMessage(messaging, (payload) => {
        callback({
            title: payload.notification?.title,
            body: payload.notification?.body,
            data: payload.data,
        });
    });
}
