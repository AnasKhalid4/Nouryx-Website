// TypeScript types mirroring app_notification_model.dart

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: string; // "order"
    orderId: string;
    receiverId: string;
    senderId: string;
    isRead: boolean;
    createdAt: Date;
}
