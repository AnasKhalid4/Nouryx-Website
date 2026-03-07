// TypeScript types for Stripe web subscription

export interface SubscriptionBinding {
    boundSalonId: string;
    platform: "ios" | "android" | "web";
    productId?: string;
    createdAt: Date;
}

export interface StripeSubscriptionData {
    active: boolean;
    productId: string;
    platform: "web";
    status: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
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
