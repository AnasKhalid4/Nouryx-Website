import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    writeBatch,
    serverTimestamp,
    DocumentSnapshot,
    Timestamp,
    deleteField,
    runTransaction,
} from "firebase/firestore";
import { db } from "./config";
import type { AuthUser, SalonService } from "@/types/user";
import type { SalonModel, SalonFetchResult } from "@/types/salon";
import type { CategoryModel } from "@/types/category";
import type { TeamMemberModel, WeeklyScheduleModel, TimeRange } from "@/types/team-member";

// --------------------------------------------------
// COLLECTION REFERENCES
// --------------------------------------------------
export const usersCol = collection(db, "users");
export const bookingsCol = collection(db, "bookings");
export const categoriesCol = collection(db, "categories");
export const notificationsCol = collection(db, "notifications");
export const conversationsCol = collection(db, "conversations");
export const subscriptionsCol = collection(db, "subscriptions");

// --------------------------------------------------
// USER CRUD (mirrors firebase_user_service.dart)
// --------------------------------------------------
export async function createUser(
    uid: string,
    data: Record<string, unknown>
): Promise<void> {
    await setDoc(doc(db, "users", uid), {
        uid,
        createdAt: serverTimestamp(),
        isBlock: "0",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneUpdatedAt: serverTimestamp(),
        ...data,
    });
}

export async function fetchUser(uid: string): Promise<AuthUser> {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) throw new Error("User document not found");
    return parseAuthUser(snap.data()!);
}

export async function updateUserProfile(
    uid: string,
    data: { fullName?: string; profileImage?: string }
): Promise<void> {
    const updates: Record<string, string> = {};
    if (data.fullName) updates["data.fullName"] = data.fullName;
    if (data.profileImage) updates["data.profileImage"] = data.profileImage;
    await updateDoc(doc(db, "users", uid), updates);
}

export async function updateSalonProfile(
    uid: string,
    data: {
        shopName?: string;
        description?: string;
        shopImages?: string[];
    }
): Promise<void> {
    const updates: Record<string, unknown> = {};
    if (data.shopName !== undefined) updates["salon.shopName"] = data.shopName;
    if (data.description !== undefined) updates["salon.description"] = data.description;
    if (data.shopImages !== undefined) updates["salon.shopImages"] = data.shopImages;
    await updateDoc(doc(db, "users", uid), updates);
}

export async function checkEmailExists(email: string): Promise<boolean> {
    if (!email) return false;
    // Web stores email under data.email, mobile may store under email at root
    const q1 = query(usersCol, where("data.email", "==", email), limit(1));
    const snap1 = await getDocs(q1);
    if (!snap1.empty) return true;

    const q2 = query(usersCol, where("email", "==", email), limit(1));
    const snap2 = await getDocs(q2);
    return !snap2.empty;
}

export async function checkPhoneExists(phone: string): Promise<boolean> {
    if (!phone) return false;
    const q = query(usersCol, where("data.phoneNumber", "==", phone), limit(1));
    const snap = await getDocs(q);
    return !snap.empty;
}

// --------------------------------------------------
// SALON QUERIES (mirrors salon_firestore_service.dart)
// --------------------------------------------------
export async function fetchFeaturedSalons(
    userLat?: number,
    userLng?: number,
    lastDoc?: DocumentSnapshot,
    pageLimit = 10
): Promise<SalonFetchResult> {
    let q = query(
        usersCol,
        where("role", "==", "salon"),
        where("salon.status", "==", "approved"),
        where("salon.isFeatured", "==", true),
        orderBy("createdAt", "desc"),
        limit(pageLimit)
    );
    if (lastDoc) q = query(q, startAfter(lastDoc));

    const snap = await getDocs(q);
    const salons: SalonModel[] = snap.docs.map((d) =>
        parseSalonFromFirestore(d.id, d.data(), userLat, userLng)
    );

    return {
        salons,
        lastDoc: snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null,
    };
}

export async function fetchForYouSalons(
    userLat?: number,
    userLng?: number,
    lastDoc?: DocumentSnapshot,
    pageLimit = 10
): Promise<SalonFetchResult> {
    let q = query(
        usersCol,
        where("role", "==", "salon"),
        where("salon.status", "==", "approved"),
        orderBy("createdAt", "desc"),
        limit(pageLimit)
    );
    if (lastDoc) q = query(q, startAfter(lastDoc));

    const snap = await getDocs(q);
    const salons: SalonModel[] = snap.docs
        .map((d) => parseSalonFromFirestore(d.id, d.data(), userLat, userLng))
        .filter((s) => !s.isFeatured);

    return {
        salons,
        lastDoc: snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null,
    };
}

export async function fetchNearbySalons(
    userLat: number,
    userLng: number,
    lastDoc?: DocumentSnapshot,
    pageLimit = 20
): Promise<SalonFetchResult> {
    let q = query(
        usersCol,
        where("role", "==", "salon"),
        where("salon.status", "==", "approved"),
        orderBy("createdAt", "desc"),
        limit(pageLimit)
    );
    if (lastDoc) q = query(q, startAfter(lastDoc));

    const snap = await getDocs(q);
    const all = snap.docs.map((d) =>
        parseSalonFromFirestore(d.id, d.data(), userLat, userLng)
    );
    const nearby = all.filter((s) => s.distanceKm != null && s.distanceKm! <= 5);

    return {
        salons: nearby,
        lastDoc: snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null,
    };
}

export async function fetchAllApprovedSalons(
    userLat?: number,
    userLng?: number
): Promise<SalonModel[]> {
    const q = query(
        usersCol,
        where("role", "==", "salon"),
        where("salon.status", "==", "approved"),
        orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    const salons = snap.docs.map((d) =>
        parseSalonFromFirestore(d.id, d.data(), userLat, userLng)
    );

    // Load services subcollection for each salon (needed for category filtering)
    await Promise.all(
        salons.map(async (salon) => {
            const servicesRef = collection(db, "users", salon.uid, "services");
            const svcSnap = await getDocs(servicesRef);
            salon.services = svcSnap.docs.map((d) =>
                parseSalonService(d.id, d.data())
            );
        })
    );

    return salons;
}

export async function fetchSalonById(
    salonId: string,
    userLat?: number,
    userLng?: number
): Promise<SalonModel | null> {
    const snap = await getDoc(doc(db, "users", salonId));
    if (!snap.exists()) return null;
    const data = snap.data()!;
    if (data.role !== "salon") return null;
    return parseSalonFromFirestore(snap.id, data, userLat, userLng);
}

// --------------------------------------------------
// SALON SERVICES (subcollection)
// --------------------------------------------------
export async function fetchSalonServices(
    salonId: string
): Promise<SalonService[]> {
    const servicesRef = collection(db, "users", salonId, "services");
    const snap = await getDocs(query(servicesRef, orderBy("createdAt", "desc")));
    return snap.docs.map((d) => parseSalonService(d.id, d.data()));
}

export async function addSalonService(
    salonId: string,
    serviceId: string,
    data: Omit<SalonService, "id" | "createdAt">
): Promise<void> {
    const ref = doc(db, "users", salonId, "services", serviceId);
    await setDoc(ref, {
        ...data,
        createdAt: serverTimestamp(),
    });
}

export async function updateSalonService(
    salonId: string,
    serviceId: string,
    data: Partial<Omit<SalonService, "id" | "createdAt">>
): Promise<void> {
    const ref = doc(db, "users", salonId, "services", serviceId);
    await updateDoc(ref, data);
}

export async function deleteSalonService(
    salonId: string,
    serviceId: string
): Promise<void> {
    await deleteDoc(doc(db, "users", salonId, "services", serviceId));
}

// --------------------------------------------------
// CATEGORIES
// --------------------------------------------------
export async function fetchCategories(): Promise<CategoryModel[]> {
    const q = query(categoriesCol, where("enabled", "==", true));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: (d.data().createdAt as Timestamp)?.toDate() ?? new Date(),
    })) as CategoryModel[];
}

// --------------------------------------------------
// BOOKINGS (mirrors firebase_booking_service.dart)
// --------------------------------------------------
export async function createBooking(
    bookingId: string,
    userId: string,
    salonId: string,
    bookingData: Record<string, unknown>
): Promise<void> {
    const schedule = bookingData.schedule as Record<string, unknown> | undefined;
    const startAt = schedule?.startAt as string | undefined;
    const durationMinutes = Number(schedule?.durationMinutes ?? 0);
    const teamMember = bookingData.team_member as Record<string, unknown> | undefined;
    const memberId = teamMember?.memberId as string | undefined;

    // If we have member + schedule info, use transactional per-member slot blocking
    if (startAt && memberId && durationMinutes > 0) {
        const startDate = new Date(startAt);
        const yyyy = startDate.getFullYear().toString().padStart(4, "0");
        const mm = (startDate.getMonth() + 1).toString().padStart(2, "0");
        const dd = startDate.getDate().toString().padStart(2, "0");
        const dayKey = `${yyyy}-${mm}-${dd}`;

        const slotRef = doc(db, "salons", salonId, "members", memberId, "slots", dayKey);
        const bookingRef = doc(db, "bookings", bookingId);

        await runTransaction(db, async (tx) => {
            const slotDoc = await tx.get(slotRef);
            const slotData = slotDoc.data() ?? {};

            const SLOT_INTERVAL = 15;
            const startMinutes =
                startDate.getHours() * 60 + startDate.getMinutes();
            const endMinutes = startMinutes + durationMinutes;

            const slotsToBlock: Record<string, boolean> = {};
            let cursor = startMinutes;

            // Check for overlapping booked slots
            while (cursor < endMinutes) {
                const h = Math.floor(cursor / 60).toString().padStart(2, "0");
                const m = (cursor % 60).toString().padStart(2, "0");
                const key = `${h}:${m}`;

                if (slotData[key] === true) {
                    throw new Error(`Slot ${key} is already booked`);
                }

                slotsToBlock[key] = true;
                cursor += SLOT_INTERVAL;
            }

            // Block all slots
            tx.set(slotRef, slotsToBlock, { merge: true });

            // Create booking
            tx.set(bookingRef, {
                ...bookingData,
                createdAt: serverTimestamp(),
            });
        });

        // Write user + provider booking indexes (outside transaction)
        try {
            await setDoc(doc(db, "users", userId, "bookings", bookingId), {
                bookingId,
                createdAt: serverTimestamp(),
            });
        } catch (e) {
            console.warn("Could not write user booking index:", e);
        }

        try {
            await setDoc(doc(db, "users", salonId, "bookings", bookingId), {
                bookingId,
                createdAt: serverTimestamp(),
            });
        } catch (e) {
            console.warn("Could not write provider booking index:", e);
        }
    } else {
        // Fallback: simple write without slot blocking (for backward compat)
        await setDoc(doc(db, "bookings", bookingId), {
            ...bookingData,
            createdAt: serverTimestamp(),
        });

        try {
            await setDoc(doc(db, "users", userId, "bookings", bookingId), {
                bookingId,
                salonId,
                status: bookingData.status,
                createdAt: serverTimestamp(),
            });
        } catch (e) {
            console.warn("Could not write user booking index:", e);
        }
    }
}

export async function updateBookingStatus(
    bookingId: string,
    status: string,
    extra?: Record<string, unknown>
): Promise<void> {
    const ref = doc(db, "bookings", bookingId);

    // If cancelling, we need to unlock the time slots
    if (status === "cancelled") {
        try {
            const snap = await getDoc(ref);
            if (snap.exists()) {
                const data = snap.data();
                const salonId = data.salon?.salonId as string | undefined;
                const schedule = data.schedule as Record<string, unknown> | undefined;
                const startAt = schedule?.startAt as string | undefined;
                const durationMinutes = Number(schedule?.durationMinutes ?? 0);
                const teamMember = data.team_member as Record<string, unknown> | undefined;
                const memberId = teamMember?.memberId as string | undefined;

                if (salonId && startAt) {
                    const dateObj = new Date(startAt);
                    const yyyy = dateObj.getFullYear().toString().padStart(4, "0");
                    const mm = (dateObj.getMonth() + 1).toString().padStart(2, "0");
                    const dd = dateObj.getDate().toString().padStart(2, "0");
                    const dateKey = `${yyyy}-${mm}-${dd}`;

                    if (memberId && durationMinutes > 0) {
                        // Per-member slot unblocking (new format)
                        const SLOT_INTERVAL = 15;
                        const startMinutes =
                            dateObj.getHours() * 60 + dateObj.getMinutes();
                        const endMinutes = startMinutes + durationMinutes;

                        const slotsToUnblock: Record<string, unknown> = {};
                        let cursor = startMinutes;

                        while (cursor < endMinutes) {
                            const h = Math.floor(cursor / 60).toString().padStart(2, "0");
                            const m = (cursor % 60).toString().padStart(2, "0");
                            slotsToUnblock[`${h}:${m}`] = deleteField();
                            cursor += SLOT_INTERVAL;
                        }

                        await updateDoc(
                            doc(db, "salons", salonId, "members", memberId, "slots", dateKey),
                            slotsToUnblock
                        );
                    } else {
                        // Legacy flat slot unblocking (old format)
                        const hour = dateObj.getHours().toString().padStart(2, "0");
                        const minute = dateObj.getMinutes().toString().padStart(2, "0");
                        const timeKey = `${hour}:${minute}`;

                        await updateDoc(
                            doc(db, "salons", salonId, "slots", dateKey),
                            { [timeKey]: deleteField() }
                        );
                    }
                }
            }
        } catch (e) {
            console.warn("Could not unlock salon slot:", e);
        }
    }

    await updateDoc(ref, { status, ...extra });
}

export async function fetchBookingById(
    bookingId: string
): Promise<Record<string, unknown> | null> {
    const snap = await getDoc(doc(db, "bookings", bookingId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
}

/**
 * Fetch bookings for a user (as client) — query bookings where user.userId == uid
 */
export async function fetchUserBookings(
    uid: string
): Promise<Record<string, unknown>[]> {
    const q = query(bookingsCol, where("user.userId", "==", uid));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch bookings for a salon (as business) — query bookings where salon.salonId == uid
 */
export async function fetchSalonBookings(
    uid: string
): Promise<Record<string, unknown>[]> {
    const q = query(bookingsCol, where("salon.salonId", "==", uid));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Fetch already-booked time slots for a team member on a specific date.
 * Uses per-member path: salons/{salonId}/members/{memberId}/slots/{dateStr}
 * Returns Record<string, boolean> matching mobile app format.
 */
export async function fetchMemberBookedSlots(
    salonId: string,
    memberId: string,
    dateStr: string  // "YYYY-MM-DD"
): Promise<Record<string, boolean>> {
    try {
        const docRef = doc(db, "salons", salonId, "members", memberId, "slots", dateStr);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const result: Record<string, boolean> = {};
            for (const key of Object.keys(data)) {
                if (data[key] === true) result[key] = true;
            }
            return result;
        }
        return {};
    } catch (error) {
        console.error("Error fetching member booked slots:", error);
        return {};
    }
}

/**
 * @deprecated Use fetchMemberBookedSlots instead for per-member slot tracking.
 * Kept for backward compatibility with old flat slot structure.
 */
export async function fetchBookedSlots(
    salonId: string,
    dateStr: string
): Promise<string[]> {
    try {
        const docRef = doc(db, "salons", salonId, "slots", dateStr);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return Object.keys(data).filter(time => data[time] === true);
        }
        return [];
    } catch (error) {
        console.error("Error fetching booked slots:", error);
        return [];
    }
}

/**
 * @deprecated Use fetchUserBookings or fetchSalonBookings instead
 */
export async function fetchUserBookingIds(
    uid: string
): Promise<string[]> {
    try {
        const ref = collection(db, "users", uid, "bookings");
        const snap = await getDocs(ref);
        return snap.docs.map((d) => d.data().bookingId as string);
    } catch {
        return [];
    }
}

// --------------------------------------------------
// REVIEWS (subcollection under users/{salonId}/reviews)
// --------------------------------------------------
export async function fetchSalonReviews(
    salonId: string,
    reviewLimit = 10
): Promise<Record<string, unknown>[]> {
    const ref = collection(db, "users", salonId, "reviews");
    const q = query(ref, orderBy("createdAt", "desc"), limit(reviewLimit));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function submitReview(
    salonId: string,
    bookingId: string,
    reviewData: Record<string, unknown>
): Promise<void> {
    // Write to salon reviews subcollection
    const reviewRef = doc(db, "users", salonId, "reviews", bookingId);
    await setDoc(reviewRef, {
        ...reviewData,
        createdAt: serverTimestamp(),
    });

    // Update booking with review
    const bookingRef = doc(db, "bookings", bookingId);
    await updateDoc(bookingRef, {
        review: {
            isReviewed: true,
            rating: reviewData.rating,
            comment: reviewData.comment,
            reviewImage: reviewData.reviewImage || null,
            userId: reviewData.userId,
            reviewedAt: serverTimestamp(),
        },
    });
}

// --------------------------------------------------
// NOTIFICATIONS (mirrors notification_viewmodel.dart)
// --------------------------------------------------
export async function fetchNotifications(
    uid: string
): Promise<Record<string, unknown>[]> {
    const q = query(
        notificationsCol,
        where("receiverId", "==", uid),
        orderBy("createdAt", "desc"),
        limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function markNotificationRead(
    notificationId: string
): Promise<void> {
    await updateDoc(doc(db, "notifications", notificationId), {
        isRead: true,
    });
}

export async function markAllNotificationsRead(
    uid: string
): Promise<void> {
    const q = query(
        notificationsCol,
        where("receiverId", "==", uid),
        where("isRead", "==", false)
    );
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.update(d.ref, { isRead: true }));
    await batch.commit();
}

// --------------------------------------------------
// FAVORITES (subcollection under users/{uid}/favourite)
// --------------------------------------------------
export async function fetchFavorites(
    uid: string
): Promise<string[]> {
    const ref = collection(db, "users", uid, "favourite");
    const snap = await getDocs(ref);
    return snap.docs.map((d) => d.id);
}

export async function addFavorite(
    uid: string,
    salonId: string
): Promise<void> {
    const ref = doc(db, "users", uid, "favourite", salonId);
    await setDoc(ref, {
        salonUid: salonId,
        favorite: "1",
        createdAt: serverTimestamp(),
    });
}

export async function removeFavorite(
    uid: string,
    salonId: string
): Promise<void> {
    await deleteDoc(doc(db, "users", uid, "favourite", salonId));
}



// --------------------------------------------------
// SALON PROFILE UPDATES
// --------------------------------------------------
export async function updateSalonBasicInfo(
    uid: string,
    data: { shopName?: string; description?: string }
): Promise<void> {
    const updates: Record<string, unknown> = {};
    if (data.shopName) updates["salon.shopName"] = data.shopName;
    if (data.description) updates["salon.description"] = data.description;
    await updateDoc(doc(db, "users", uid), updates);
}

export async function updateSalonBusinessInfo(
    uid: string,
    data: {
        siretNumber?: string;
        legalStatus?: string;
        autoAcceptBooking?: number;
    }
): Promise<void> {
    const updates: Record<string, unknown> = {};
    if (data.siretNumber) updates["salon.siretNumber"] = data.siretNumber;
    if (data.legalStatus) updates["salon.legalStatus"] = data.legalStatus;
    if (data.autoAcceptBooking !== undefined)
        updates["salon.autoAcceptBooking"] = data.autoAcceptBooking;
    await updateDoc(doc(db, "users", uid), updates);
}

export async function updateSalonImages(
    uid: string,
    shopImages: string[]
): Promise<void> {
    await updateDoc(doc(db, "users", uid), {
        "salon.shopImages": shopImages,
    });
}

export async function updateSalonLocation(
    uid: string,
    location: {
        address: string;
        city: string;
        country: string;
        placeId: string;
        lat: number;
        lng: number;
    }
): Promise<void> {
    await updateDoc(doc(db, "users", uid), { location });
}

// --------------------------------------------------
// SALON BOOKING IDS (subcollection under users/{salonId}/bookings)
// --------------------------------------------------
export async function fetchSalonBookingIds(
    salonId: string
): Promise<string[]> {
    const snap = await getDocs(
        collection(db, `users/${salonId}/bookings`)
    );
    return snap.docs.map((d) => d.id);
}

// --------------------------------------------------
// CONVERSATION / CHAT
// --------------------------------------------------
export async function fetchConversations(
    uid: string
): Promise<Record<string, unknown>[]> {
    const snap = await getDocs(conversationsCol);
    return snap.docs
        .filter((d) => {
            const data = d.data();
            const parts = (data.participants as string[]) || [];
            return parts.includes(uid);
        })
        .map((d) => ({ id: d.id, ...d.data() }));
}

export async function sendChatMessage(
    conversationId: string,
    senderId: string,
    text: string,
    imageUrl?: string | null
): Promise<void> {
    // Add message to subcollection
    await addDoc(
        collection(db, `conversations/${conversationId}/messages`),
        {
            senderId,
            text,
            imageUrl: imageUrl || null,
            createdAt: serverTimestamp(),
            seen: false,
        }
    );

    // Update conversation lastMessage
    await updateDoc(doc(db, "conversations", conversationId), {
        lastMessage: text || "Image",
        lastMessageAt: serverTimestamp(),
        lastSenderId: senderId,
    });
}

export async function createConversation(
    currentUserId: string,
    currentUserName: string,
    currentUserImage: string,
    otherUserId: string,
    otherUserName: string,
    otherUserImage: string
): Promise<string> {
    // Check if conversation already exists
    const snap = await getDocs(conversationsCol);
    const existing = snap.docs.find((d) => {
        const data = d.data();
        const parts = (data.participants as string[]) || [];
        return parts.includes(currentUserId) && parts.includes(otherUserId);
    });

    if (existing) return existing.id;

    // Create new conversation
    const ref = await addDoc(conversationsCol, {
        participants: [currentUserId, otherUserId],
        lastMessage: "",
        lastMessageAt: serverTimestamp(),
        lastSenderId: "",
        userInfo: {
            [currentUserId]: {
                name: currentUserName,
                image: currentUserImage,
            },
            [otherUserId]: {
                name: otherUserName,
                image: otherUserImage,
            },
        },
    });

    return ref.id;
}

export async function deleteConversation(
    conversationId: string
): Promise<void> {
    // Delete all messages inside conversation
    const msgSnap = await getDocs(
        collection(db, `conversations/${conversationId}/messages`)
    );
    const batch = writeBatch(db);
    msgSnap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();

    // Delete conversation itself
    await deleteDoc(doc(db, "conversations", conversationId));
}

// --------------------------------------------------
// PARSERS
// --------------------------------------------------
import { haversineDistance } from "@/lib/haversine";

function parseAuthUser(data: Record<string, unknown>): AuthUser {
    const profileData = (data.data as Record<string, unknown>) || {};
    const salonData = data.salon as Record<string, unknown> | undefined;
    const locationData = data.location as Record<string, unknown> | undefined;
    const subscriptionData = data.subscription as Record<string, unknown> | undefined;
    const ts = data.createdAt as Timestamp;

    return {
        uid: (data.uid as string) || "",
        role: (data.role as "user" | "salon") || "user",
        createdAt: ts?.toDate() ?? new Date(),
        isBlock: String(data.isBlock ?? "0"),
        fcmTokens: Array.isArray(data.fcmTokens)
            ? (data.fcmTokens as string[])
            : [],
        profile: {
            fullName: (profileData.fullName as string) || "",
            email: (profileData.email as string) || "",
            phoneNumber: (profileData.phoneNumber as string) || "",
            profileImage: (profileData.profileImage as string) || "",
        },
        salon: salonData
            ? {
                shopName: (salonData.shopName as string) || "",
                shopImages: Array.isArray(salonData.shopImages)
                    ? (salonData.shopImages as string[])
                    : [],
                siretNumber: (salonData.siretNumber as string) || "",
                legalStatus: (salonData.legalStatus as string) || "",
                description: (salonData.description as string) || "",
                status:
                    (salonData.status as "pending" | "approved" | "declined") ||
                    "pending",
                autoAcceptBooking: (salonData.autoAcceptBooking as number) || 0,
                isFeatured: (salonData.isFeatured as boolean) || false,
                rating: Number(salonData.rating ?? 0),
                ratingCount: Number(salonData.ratingCount ?? 0),
                totalOrders: Number(salonData.totalOrders ?? 0),
                completedOrders: Number(salonData.completedOrders ?? 0),
                totalEarnings: Number(salonData.totalEarnings ?? 0),
            }
            : undefined,
        location: locationData
            ? {
                address: (locationData.address as string) || "",
                city: (locationData.city as string) || "",
                country: (locationData.country as string) || "",
                placeId: (locationData.placeId as string) || "",
                lat: Number(locationData.lat ?? 0),
                lng: Number(locationData.lng ?? 0),
            }
            : undefined,
        subscription: subscriptionData
            ? {
                active: (subscriptionData.active as boolean) || false,
                productId: (subscriptionData.product_id as string) || "",
                platform:
                    (subscriptionData.platform as "ios" | "android" | "web") || "web",
                stripeCustomerId: (subscriptionData.stripe_customer_id as string) || "",
                stripeSubscriptionId:
                    (subscriptionData.stripe_subscription_id as string) || "",
                freeTrial: {
                    enabled:
                        ((subscriptionData.free_trial as Record<string, unknown>)
                            ?.enabled as boolean) || false,
                    durationMonths: Number(
                        (subscriptionData.free_trial as Record<string, unknown>)
                            ?.duration_months ?? 0
                    ),
                    used:
                        ((subscriptionData.free_trial as Record<string, unknown>)
                            ?.used as boolean) || false,
                },
                purchase: {
                    startedAt: Number(
                        (subscriptionData.purchase as Record<string, unknown>)
                            ?.started_at ?? 0
                    ),
                    expiresAt:
                        (subscriptionData.purchase as Record<string, unknown>)
                            ?.expires_at as number | undefined,
                    autoRenew:
                        ((subscriptionData.purchase as Record<string, unknown>)
                            ?.auto_renew as boolean) ?? true,
                },
            }
            : undefined,
        services: [],
    };
}

function parseSalonFromFirestore(
    docId: string,
    data: Record<string, unknown>,
    userLat?: number,
    userLng?: number
): SalonModel {
    const location = (data.location as Record<string, unknown>) || {};
    const salon = (data.salon as Record<string, unknown>) || {};
    const ownerData = (data.data as Record<string, unknown>) || {};
    const ts = data.createdAt as Timestamp;

    const salonLat = Number(location.lat ?? 0);
    const salonLng = Number(location.lng ?? 0);

    let distanceKm: number | undefined;
    if (userLat && userLng && salonLat && salonLng) {
        distanceKm = haversineDistance(userLat, userLng, salonLat, salonLng);
    }

    return {
        uid: (data.uid as string) || docId,
        owner: {
            fullName: (ownerData.fullName as string) || "",
            email: (ownerData.email as string) || "",
            phoneNumber: (ownerData.phoneNumber as string) || "",
            profileImage: (ownerData.profileImage as string) || "",
        },
        description: (salon.description as string) || "",
        shopName: (salon.shopName as string) || "",
        shopImages: Array.isArray(salon.shopImages)
            ? (salon.shopImages as string[])
            : [],
        autoAcceptBooking: (salon.autoAcceptBooking as number) || 0,
        city: (location.city as string) || "",
        address: (location.address as string) || "",
        country: (location.country as string) || "",
        lat: salonLat,
        lng: salonLng,
        placeId: (location.placeId as string) || "",
        isFeatured: (salon.isFeatured as boolean) || false,
        rating: Number(salon.rating ?? 0),
        ratingCount: Number(salon.ratingCount ?? 0),
        totalOrders: Number(salon.totalOrders ?? 0),
        completedOrders: Number(salon.completedOrders ?? 0),
        createdAt: ts?.toDate() ?? new Date(),
        distanceKm,
        services: undefined,
        fcmTokens: Array.isArray(data.fcmTokens)
            ? (data.fcmTokens as string[])
            : [],
    };
}

function parseSalonService(
    id: string,
    data: Record<string, unknown>
): SalonService {
    return {
        id,
        name: (data.name as string) || "",
        categoryId: (data.categoryId as string) || "",
        providerId: (data.providerId as string) || "",
        minutes: Number(data.minutes ?? 0),
        timeLabel: (data.timeLabel as string) || "",
        price: Number(data.price ?? 0),
        createdAt: (data.createdAt as Timestamp)?.toDate() ?? undefined,
    };
}

// --------------------------------------------------
// TEAM MEMBERS (subcollection under users/{salonId}/team_members)
// --------------------------------------------------

function parseTeamMember(
    id: string,
    data: Record<string, unknown>
): TeamMemberModel {
    const rawSchedule = data.schedule as Record<string, unknown> | undefined;
    const schedule: Record<string, TimeRange[]> = {};

    if (rawSchedule) {
        for (const [day, ranges] of Object.entries(rawSchedule)) {
            if (Array.isArray(ranges)) {
                schedule[day] = ranges.map((r: unknown) => {
                    if (typeof r === "object" && r !== null) {
                        const rangeObj = r as Record<string, string>;
                        return {
                            start: rangeObj.start || "closed",
                            end: rangeObj.end || "closed",
                        };
                    }
                    // Legacy format: single string like "09:00-18:00"
                    if (typeof r === "string" && r.includes("-")) {
                        const [start, end] = r.split("-");
                        return { start, end };
                    }
                    return { start: "closed", end: "closed" };
                });
            }
        }
    }

    return {
        id,
        name: (data.name as string) || "",
        role: (data.role as string) || "",
        image: (data.image as string) || "",
        enabled: data.enabled !== false, // default to true
        schedule,
        serviceIds: Array.isArray(data.serviceIds)
            ? (data.serviceIds as string[])
            : [],
    };
}

export async function fetchSalonTeamMembers(
    salonId: string
): Promise<TeamMemberModel[]> {
    const ref = collection(db, "users", salonId, "team_members");
    const snap = await getDocs(ref);
    return snap.docs
        .map((d) => parseTeamMember(d.id, d.data()))
        .filter((m) => m.enabled);
}

export async function fetchAllTeamMembers(
    salonId: string
): Promise<TeamMemberModel[]> {
    const ref = collection(db, "users", salonId, "team_members");
    const snap = await getDocs(ref);
    return snap.docs.map((d) => parseTeamMember(d.id, d.data()));
}

export async function addTeamMember(
    salonId: string,
    data: Omit<TeamMemberModel, "id">
): Promise<string> {
    const ref = collection(db, "users", salonId, "team_members");
    const docRef = await addDoc(ref, {
        ...data,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateTeamMember(
    salonId: string,
    memberId: string,
    data: Partial<Omit<TeamMemberModel, "id">>
): Promise<void> {
    const ref = doc(db, "users", salonId, "team_members", memberId);
    await updateDoc(ref, data as Record<string, unknown>);
}

export async function deleteTeamMember(
    salonId: string,
    memberId: string
): Promise<void> {
    await deleteDoc(doc(db, "users", salonId, "team_members", memberId));
}

// --------------------------------------------------
// SALON WEEKLY SCHEDULE (doc under users/{salonId}/salon_schedule/weekly)
// --------------------------------------------------

function parseWeeklySchedule(
    data: Record<string, unknown>
): WeeklyScheduleModel {
    const schedule: Record<string, TimeRange[]> = {};

    for (const [day, ranges] of Object.entries(data)) {
        if (day === "id" || day === "createdAt") continue; // Skip metadata fields
        if (Array.isArray(ranges)) {
            schedule[day] = ranges.map((r: unknown) => {
                if (typeof r === "object" && r !== null) {
                    const rangeObj = r as Record<string, string>;
                    return {
                        start: rangeObj.start || "closed",
                        end: rangeObj.end || "closed",
                    };
                }
                if (typeof r === "string" && r.includes("-")) {
                    const [start, end] = r.split("-");
                    return { start, end };
                }
                return { start: "closed", end: "closed" };
            });
        }
    }

    return { schedule };
}

export async function fetchSalonWeeklySchedule(
    salonId: string
): Promise<WeeklyScheduleModel | null> {
    try {
        const ref = doc(db, "users", salonId, "salon_schedule", "weekly");
        const snap = await getDoc(ref);
        if (!snap.exists()) return null;
        return parseWeeklySchedule(snap.data());
    } catch (error) {
        console.error("Error fetching salon schedule:", error);
        return null;
    }
}

export async function saveDaySchedule(
    salonId: string,
    dayKey: string,
    ranges: TimeRange[]
): Promise<void> {
    const ref = doc(db, "users", salonId, "salon_schedule", "weekly");
    await setDoc(ref, { [dayKey]: ranges }, { merge: true });
}

export async function saveFullWeeklySchedule(
    salonId: string,
    schedule: Record<string, TimeRange[]>
): Promise<void> {
    const ref = doc(db, "users", salonId, "salon_schedule", "weekly");
    await setDoc(ref, schedule);
}

