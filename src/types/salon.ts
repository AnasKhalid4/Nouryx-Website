// TypeScript types mirroring salon_model.dart + salon_owner_data.dart
import type { SalonService } from "./user";

export interface SalonOwnerData {
    fullName: string;
    email: string;
    phoneNumber: string;
    profileImage: string;
}

export interface SalonModel {
    uid: string;
    owner: SalonOwnerData;
    description: string;
    shopName: string;
    shopImages: string[];
    autoAcceptBooking: number; // 0 or 1
    city: string;
    address: string;
    country: string;
    lat: number;
    lng: number;
    placeId: string;
    isFeatured: boolean;
    rating: number;
    ratingCount: number;
    totalOrders: number;
    completedOrders: number;
    createdAt: Date;
    distanceKm?: number;
    services?: SalonService[];
    fcmTokens: string[];
}

export interface SalonFetchResult {
    salons: SalonModel[];
    lastDoc: unknown | null; // Firestore DocumentSnapshot
}
