// Centralized TanStack Query key factory

export const queryKeys = {
    salons: {
        all: ["salons"] as const,
        featured: (lat?: number | null, lng?: number | null) =>
            [...queryKeys.salons.all, "featured", lat ?? 0, lng ?? 0] as const,
        nearby: (lat: number, lng: number) =>
            [...queryKeys.salons.all, "nearby", lat, lng] as const,
        forYou: (lat?: number | null, lng?: number | null) =>
            [...queryKeys.salons.all, "forYou", lat ?? 0, lng ?? 0] as const,
        detail: (id: string) => [...queryKeys.salons.all, id] as const,
        services: (id: string) =>
            [...queryKeys.salons.all, id, "services"] as const,
        reviews: (id: string) =>
            [...queryKeys.salons.all, id, "reviews"] as const,
        search: (lat?: number | null, lng?: number | null) =>
            [...queryKeys.salons.all, "search", lat ?? 0, lng ?? 0] as const,
    },
    categories: {
        all: ["categories"] as const,
        enabled: () => [...queryKeys.categories.all, "enabled"] as const,
    },
    bookings: {
        all: ["bookings"] as const,
        byStatus: (status: string) =>
            [...queryKeys.bookings.all, status] as const,
        detail: (id: string) => [...queryKeys.bookings.all, id] as const,
        userBookingIds: (uid: string) =>
            [...queryKeys.bookings.all, "user", uid] as const,
        salonBookingIds: (uid: string) =>
            [...queryKeys.bookings.all, "salon", uid] as const,
    },
    notifications: {
        all: ["notifications"] as const,
        unread: () => [...queryKeys.notifications.all, "unread"] as const,
    },
    conversations: {
        all: ["conversations"] as const,
        messages: (id: string) =>
            [...queryKeys.conversations.all, id, "messages"] as const,
    },
    favorites: {
        all: ["favorites"] as const,
        list: (uid: string) => [...queryKeys.favorites.all, uid] as const,
    },
};
