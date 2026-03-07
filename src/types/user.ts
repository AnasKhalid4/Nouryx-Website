// TypeScript types mirroring auth_user_model.dart

export interface UserProfile {
    fullName: string;
    email: string;
    phoneNumber: string;
    profileImage: string;
}

export interface SalonProfile {
    shopName: string;
    shopImages: string[];
    siretNumber: string;
    legalStatus: string;
    description: string;
    status: "pending" | "approved" | "declined";
    autoAcceptBooking: number; // 0 or 1
    isFeatured: boolean;
    rating: number;
    ratingCount: number;
    totalOrders: number;
    completedOrders: number;
    totalEarnings: number;
}

export interface UserLocation {
    address: string;
    city: string;
    country: string;
    placeId: string;
    lat: number;
    lng: number;
}

export interface SalonService {
    id: string;
    name: string;
    categoryId: string;
    providerId: string;
    minutes: number;
    timeLabel: string;
    price: number;
    createdAt?: Date;
}

export interface UserSubscription {
    active: boolean;
    productId: string;
    platform: "ios" | "android" | "web";
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    freeTrial: {
        enabled: boolean;
        durationMonths: number;
        used: boolean;
    };
    purchase: {
        startedAt: number;
        expiresAt?: number;
        autoRenew: boolean;
    };
}

export interface AuthUser {
    uid: string;
    role: "user" | "salon";
    createdAt: Date;
    isBlock: string; // "0" or "1"
    fcmTokens: string[];
    profile: UserProfile;
    salon?: SalonProfile;
    location?: UserLocation;
    subscription?: UserSubscription;
    services: SalonService[];
}
