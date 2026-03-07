// TypeScript types mirroring booking_model.dart

export interface BookingService {
    serviceId: string;
    name: string;
    categoryId: string;
    providerId: string;
    minutes: number;
    price: number;
}

export interface BookingSchedule {
    startAt: string;
    endAt: string;
    durationMinutes: number;
}

export interface BookingPricing {
    total: number;
    currency: string; // always "EUR"
}

export interface BookingSalon {
    salonId: string;
    shopName: string;
    city: string;
    address: string;
    country: string;
    lat: number;
    lng: number;
    placeId: string;
    owner: {
        fullName: string;
        phoneNumber: string;
        email: string;
        profileImage: string;
    };
}

export interface BookingUser {
    userId: string;
    fullName: string;
    phoneNumber: string;
    profileImage: string;
}

export interface BookingReview {
    isReviewed: boolean;
    rating: number;
    comment: string;
    reviewImage: string | null;
    userId: string;
    reviewedAt: Date | null;
}

export type BookingStatus = "pending" | "inprocess" | "completed" | "cancelled";

export interface BookingModel {
    bookingId: string;
    status: BookingStatus;
    salon: BookingSalon;
    user: BookingUser;
    services: BookingService[];
    schedule: BookingSchedule;
    pricing: BookingPricing;
    notes: string | null;
    review: BookingReview | null;
    cancelReason?: string;
    cancelledBy?: string;
    cancelledAt?: Date;
    createdAt: Date;
}
