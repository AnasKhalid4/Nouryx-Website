// Cloud Function API callers
// Mirrors: notification_api.dart

const CLOUD_FUNCTIONS_URL =
    process.env.NEXT_PUBLIC_CLOUD_FUNCTIONS_URL ||
    "https://us-central1-my-assistant-64809.cloudfunctions.net";

/**
 * Send push notification via Cloud Function
 * Mirrors: NotificationApi.send()
 */
export async function sendUserNotification(params: {
    receiverId: string;
    senderId: string;
    title: string;
    message: string;
    orderId?: string;
}): Promise<Response> {
    return fetch(`${CLOUD_FUNCTIONS_URL}/sendUserNotification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
    });
}

/**
 * Delete account via Cloud Function
 * Mirrors: NotificationApi.deleteAccount()
 */
export async function deleteAccount(params: {
    uid: string;
    role: "user" | "salon";
}): Promise<Response> {
    return fetch(`${CLOUD_FUNCTIONS_URL}/deleteAccount`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
    });
}
