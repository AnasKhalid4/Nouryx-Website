// Firebase Messaging Service Worker for background notifications
// This file must be in /public directory

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyCfKuRKToIrcd4REbK81Hwz_2AL7Fr3ZtQ",
    authDomain: "my-assistant-64809.firebaseapp.com",
    projectId: "my-assistant-64809",
    storageBucket: "my-assistant-64809.firebasestorage.app",
    messagingSenderId: "1071894016355",
    appId: "1:1071894016355:web:3ea00efc1078a197b5a356",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification?.title || "Nouryx";
    const notificationOptions = {
        body: payload.notification?.body || "",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        data: payload.data,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const orderId = event.notification.data?.orderId;
    const url = orderId ? `/bookings?id=${orderId}` : "/";

    event.waitUntil(
        self.clients.matchAll({ type: "window" }).then((clientList) => {
            for (const client of clientList) {
                if (client.url === url && "focus" in client) {
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(url);
            }
        })
    );
});
