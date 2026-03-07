// TypeScript types mirroring conversation_model.dart + message_model.dart

export interface ConversationModel {
    conversationId: string;
    participants: string[];
    salonId: string;
    userId: string;
    lastMessage: string;
    lastMessageAt: Date;
    lastSenderId: string;
    otherName: string;
    otherImage: string;
}

export interface ChatMessage {
    id: string;
    senderId: string;
    text: string;
    imageUrl: string | null;
    seen: boolean;
    createdAt: Date;
}
