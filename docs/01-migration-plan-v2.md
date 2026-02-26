# Nouryx — Flutter-to-Next.js Website Migration Plan (v2)

Complete blueprint to replicate the Nouryx salon-booking mobile app as a Next.js website sharing the same Firebase backend (`my-assistant-64809`), incorporating 2026 best practices, TanStack Query, scalable architecture, and Stripe subscriptions.

---

## TABLE OF CONTENTS

1. [Firebase Setup for Web](#1-firebase-setup-for-web)
2. [Tech Stack (2026 Best Practices)](#2-tech-stack-2026-best-practices)
3. [Scalable Folder Structure](#3-scalable-folder-structure)
4. [TanStack Query Architecture](#4-tanstack-query-architecture)
5. [Firebase Collections & Schemas](#5-firebase-collections--schemas)
6. [Authentication System](#6-authentication-system)
7. [Page-by-Page Specification](#7-page-by-page-specification)
8. [Stripe Subscription (Web)](#8-stripe-subscription-web)
9. [Web Push Notifications (FCM)](#9-web-push-notifications-fcm)
10. [Location Services](#10-location-services)
11. [Internationalization (i18n)](#11-internationalization-i18n)
12. [File Upload Patterns](#12-file-upload-patterns)
13. [Key Business Logic](#13-key-business-logic)
14. [Environment Variables](#14-environment-variables)
15. [Implementation Order (3 Prompts)](#15-implementation-order-3-prompts)
16. [Critical Notes for AI Agent](#16-critical-notes-for-ai-agent)

---

## 1. FIREBASE SETUP FOR WEB

### 1.1 How to Get Firebase Web Config

The mobile app only has Android + iOS configs. **You must create a Web app in Firebase Console:**

1. Go to [Firebase Console](https://console.firebase.google.com/) → select project **`my-assistant-64809`**
2. Click **⚙️ Project Settings** (gear icon top-left)
3. Scroll to **"Your apps"** section
4. Click **"Add app"** → select **Web** (</> icon)
5. Register app with nickname "Nouryx Web"
6. Firebase will display a config object:
```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "my-assistant-64809.firebaseapp.com",
  projectId: "my-assistant-64809",
  storageBucket: "my-assistant-64809.firebasestorage.app",
  messagingSenderId: "1071894016355",
  appId: "1:1071894016355:web:..."
};
```
7. Copy these values into `.env.local` (see Section 14)

**Known values from the codebase:**
- `projectId`: `my-assistant-64809`
- `storageBucket`: `my-assistant-64809.firebasestorage.app`
- `messagingSenderId`: `1071894016355`
- `apiKey` and `appId` → **you'll get new ones** specific to web

### 1.2 How to Get VAPID Key (for Web Push Notifications)

1. In Firebase Console → **⚙️ Project Settings**
2. Go to **"Cloud Messaging"** tab
3. Scroll to **"Web Push certificates"** section
4. If no key pair exists, click **"Generate key pair"**
5. Copy the **Key pair** value — this is your VAPID key
6. Set as `NEXT_PUBLIC_FIREBASE_VAPID_KEY` in `.env.local`

### 1.3 Google Maps API Key (Already in Project)

Found in `lib/util/constants.dart` line 5:
```
AIzaSyAHF114Pn5RIOiG39XomX_QIslbeKfW9y4
```
This key is used for:
- Google Places Autocomplete (salon registration + edit location)
- Place Details (get lat/lng/city/country from placeId)
- The same key works for web — just ensure **Maps JavaScript API**, **Places API**, and **Geocoding API** are enabled in Google Cloud Console for this key, and add your web domain to the key's HTTP referrer restrictions.

### 1.4 Cloud Function Endpoints (Already Deployed)

| Endpoint | Method | Body | Purpose |
|---|---|---|---|
| `POST /sendUserNotification` | POST | `{ receiverId, senderId, title, message, orderId? }` | Send push notification + store in `notifications` collection |
| `POST /deleteAccount` | POST | `{ uid, role }` | Delete user/salon: all data, storage, auth record |
| `POST /verifyAppleSubscription` | POST | `{ originalTransactionId, signedTransaction }` | Verify iOS subscription (not needed for web) |
| `POST /verifyAndroidSubscription` | POST | `{ purchase_token, product_id, package_name }` | Verify Android subscription (not needed for web) |

Base URL: `https://us-central1-my-assistant-64809.cloudfunctions.net`

> **Note:** The Cloud Functions source (`index.js`) is gitignored. Only `package.json` is in the repo. The functions are already deployed and working — just call them via HTTP.

---

## 2. TECH STACK (2026 BEST PRACTICES)

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js 15+ (App Router) | Latest stable, RSC support, route handlers |
| **Language** | TypeScript (strict mode) | Type safety across Firebase data |
| **UI Framework** | Tailwind CSS v4 + shadcn/ui | Utility-first, accessible components |
| **Icons** | Lucide React | Consistent, tree-shakeable icons |
| **Server State** | TanStack Query v5 + `@tanstack-query-firebase/react` | Auto-caching, background sync, real-time Firestore subscriptions |
| **Client State** | Zustand | Lightweight auth/location/UI state |
| **Firebase** | `firebase` JS SDK v10+ | Auth, Firestore, Storage, Messaging |
| **Maps** | `@react-google-maps/api` + Google Places API | Location picker, map display |
| **i18n** | `next-intl` | FR + EN, matching mobile `.arb` files |
| **Forms** | `react-hook-form` + `zod` | Type-safe validation |
| **Phone Input** | `react-phone-number-input` | International phone with country picker |
| **Toast** | `sonner` | Modern, beautiful toasts |
| **Calendar** | `react-day-picker` | Date selection for booking |
| **Image Upload** | Firebase Storage web SDK | File → `uploadBytes` → `getDownloadURL` |
| **Payments** | Stripe (`@stripe/stripe-js` + `stripe` server) | Web subscriptions for salons |
| **Date** | `date-fns` | Lightweight date formatting |

### Why TanStack Query over raw Firestore calls?

1. **Auto-caching** — Salon lists, categories, bookings cached and deduplicated
2. **Background refetching** — Data stays fresh without manual polling
3. **Real-time subscriptions** — `@tanstack-query-firebase/react` wraps `onSnapshot` into query hooks
4. **Optimistic updates** — Instant UI for favorites, booking status changes
5. **Loading/error states** — Built-in `isLoading`, `isError`, `data` pattern
6. **DevTools** — Visual debugging of all Firebase data in browser

---

## 3. SCALABLE FOLDER STRUCTURE

```
nouryx-web/
├── public/
│   ├── firebase-messaging-sw.js    # FCM service worker
│   ├── images/                     # Static assets
│   └── locales/                    # i18n JSON files
│       ├── en.json
│       └── fr.json
│
├── src/
│   ├── app/                        # Next.js App Router (routes only)
│   │   ├── layout.tsx              # Root layout (providers, fonts, i18n)
│   │   ├── page.tsx                # Home page
│   │   ├── globals.css             # Tailwind imports
│   │   │
│   │   ├── (auth)/                 # Route group: auth pages
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/
│   │   │   │   ├── page.tsx        # Role selection
│   │   │   │   ├── user/page.tsx   # User signup
│   │   │   │   └── salon/
│   │   │   │       ├── step1/page.tsx
│   │   │   │       └── step2/page.tsx
│   │   │   ├── otp/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   │
│   │   ├── (user)/                 # Route group: user-facing pages
│   │   │   ├── layout.tsx
│   │   │   ├── search/page.tsx
│   │   │   ├── salon/[id]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── reviews/page.tsx
│   │   │   ├── booking/page.tsx
│   │   │   ├── bookings/
│   │   │   │   ├── page.tsx
│   │   │   │   └── cancel/page.tsx
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── edit/page.tsx
│   │   │   │   ├── favorites/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   ├── notifications/page.tsx
│   │   │   ├── chat/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── language/page.tsx
│   │   │
│   │   ├── (salon)/                # Route group: salon dashboard
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── bookings/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── [id]/page.tsx
│   │   │   │   │   └── cancel/page.tsx
│   │   │   │   ├── profile/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── edit-basic/page.tsx
│   │   │   │   │   ├── edit-business/page.tsx
│   │   │   │   │   └── edit-images/page.tsx
│   │   │   │   ├── services/page.tsx
│   │   │   │   ├── settings/page.tsx
│   │   │   │   └── subscription/page.tsx
│   │   │
│   │   └── api/                    # Route handlers (server-side)
│   │       └── stripe/
│   │           ├── create-checkout/route.ts
│   │           ├── webhook/route.ts
│   │           └── create-portal/route.ts
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui primitives
│   │   ├── layout/                 # Header, Footer, Sidebar
│   │   ├── features/               # Feature-specific components
│   │   │   ├── auth/
│   │   │   ├── salon/
│   │   │   ├── booking/
│   │   │   ├── chat/
│   │   │   ├── profile/
│   │   │   ├── notification/
│   │   │   └── subscription/
│   │   └── shared/                 # LoadingSkeleton, EmptyState, etc.
│   │
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── config.ts
│   │   │   ├── auth.ts
│   │   │   ├── firestore.ts
│   │   │   ├── storage.ts
│   │   │   └── messaging.ts
│   │   ├── stripe/
│   │   │   └── client.ts
│   │   ├── google-places.ts
│   │   ├── notifications.ts
│   │   ├── haversine.ts
│   │   ├── validators.ts
│   │   └── utils.ts
│   │
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-location.ts
│   │   ├── use-salons.ts
│   │   ├── use-bookings.ts
│   │   ├── use-categories.ts
│   │   ├── use-chat.ts
│   │   ├── use-notifications.ts
│   │   ├── use-reviews.ts
│   │   └── use-services.ts
│   │
│   ├── stores/
│   │   ├── auth-store.ts
│   │   ├── location-store.ts
│   │   ├── booking-store.ts
│   │   └── locale-store.ts
│   │
│   ├── types/
│   │   ├── user.ts
│   │   ├── salon.ts
│   │   ├── booking.ts
│   │   ├── category.ts
│   │   ├── conversation.ts
│   │   ├── notification.ts
│   │   ├── review.ts
│   │   └── subscription.ts
│   │
│   ├── providers/
│   │   ├── query-provider.tsx
│   │   ├── auth-provider.tsx
│   │   └── locale-provider.tsx
│   │
│   └── middleware.ts
│
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. TANSTACK QUERY ARCHITECTURE

### 4.1 Setup

```typescript
// src/providers/query-provider.tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});

export function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### 4.2 Query Key Convention

```typescript
export const queryKeys = {
  salons: {
    all: ["salons"] as const,
    featured: () => [...queryKeys.salons.all, "featured"] as const,
    nearby: (lat: number, lng: number) => [...queryKeys.salons.all, "nearby", lat, lng] as const,
    forYou: () => [...queryKeys.salons.all, "forYou"] as const,
    detail: (id: string) => [...queryKeys.salons.all, id] as const,
    services: (id: string) => [...queryKeys.salons.all, id, "services"] as const,
    reviews: (id: string) => [...queryKeys.salons.all, id, "reviews"] as const,
  },
  categories: {
    all: ["categories"] as const,
    enabled: () => [...queryKeys.categories.all, "enabled"] as const,
  },
  bookings: {
    all: ["bookings"] as const,
    byStatus: (status: string) => [...queryKeys.bookings.all, status] as const,
    detail: (id: string) => [...queryKeys.bookings.all, id] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    unread: () => [...queryKeys.notifications.all, "unread"] as const,
  },
  conversations: {
    all: ["conversations"] as const,
    messages: (id: string) => [...queryKeys.conversations.all, id, "messages"] as const,
  },
  favorites: {
    all: ["favorites"] as const,
  },
};
```

### 4.3 Example Hook: Fetch Featured Salons

```typescript
// src/hooks/use-salons.ts
import { useQuery } from "@tanstack/react-query";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { queryKeys } from "@/lib/query-keys";
import type { SalonModel } from "@/types/salon";

export function useFeaturedSalons() {
  return useQuery({
    queryKey: queryKeys.salons.featured(),
    queryFn: async () => {
      const q = query(
        collection(db, "users"),
        where("role", "==", "salon"),
        where("salon.status", "==", "approved"),
        where("salon.isFeatured", "==", true),
        orderBy("createdAt", "desc"),
        limit(10)
      );
      const snap = await getDocs(q);
      const salons: SalonModel[] = [];
      for (const doc of snap.docs) {
        const salon = parseSalonFromFirestore(doc.id, doc.data());
        const services = await fetchSalonServices(doc.id);
        salons.push({ ...salon, services });
      }
      return salons;
    },
    staleTime: 1000 * 60 * 5,
  });
}
```

### 4.4 Real-Time Chat with TanStack Query

```typescript
// src/hooks/use-chat.ts
import { useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export function useChatMessages(conversationId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const q = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("createdAt")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      queryClient.setQueryData(
        queryKeys.conversations.messages(conversationId),
        messages
      );
    });
    return () => unsubscribe();
  }, [conversationId, queryClient]);

  return useQuery({
    queryKey: queryKeys.conversations.messages(conversationId),
    queryFn: () => [],
    staleTime: Infinity,
  });
}
```

---

## 5. FIREBASE COLLECTIONS & SCHEMAS

### `users` (SINGLE collection for BOTH roles)

```typescript
interface FirestoreUser {
  uid: string;
  role: "user" | "salon";
  createdAt: Timestamp;
  isBlock: "0" | "1";
  timezone: string;
  timezoneUpdatedAt: Timestamp;
  data: {
    fullName: string;
    email: string;
    phoneNumber: string;
    profileImage: string;
  };
  fcmTokens: string[];

  // SALON ROLE ONLY:
  location?: {
    address: string;
    city: string;
    country: string;
    placeId: string;
    lat: number;
    lng: number;
  };
  salon?: {
    shopName: string;
    shopImages: string[];
    siretNumber: string;
    legalStatus: string;
    description: string;
    status: "pending" | "approved" | "declined";
    autoAcceptBooking: 0 | 1;
    isFeatured?: boolean;
    rating?: number;
    ratingCount?: number;
    totalOrders?: number;
    completedOrders?: number;
    totalEarnings?: number;
  };
  subscription?: {
    active: boolean;
    product_id: string;
    platform: "ios" | "android" | "web";
    status?: string;
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
    purchase_token?: string;
    signed_transaction?: string;
    subscription_binding_id?: string;
    transaction_id?: string;
    free_trial: {
      enabled: boolean;
      duration_months: number;
      used: boolean;
    };
    purchase: {
      started_at: number;
      expires_at?: number;
      ended_at?: number;
      auto_renew: boolean;
    };
  };
}
```

**Subcollections under `users/{uid}/`:**

| Subcollection | Doc ID | Fields |
|---|---|---|
| `services/` | UUID | `{ id, name, categoryId, providerId, minutes, timeLabel, price, createdAt }` |
| `bookings/` | bookingId | `{ bookingId, createdAt }` — index only |
| `favourite/` | salonId | `{ salonUid, favorite: "1", createdAt }` |
| `reviews/` | bookingId | `{ bookingId, userId, rating, comment, reviewImage?, createdAt }` |

### `categories`

```typescript
interface Category {
  id: string;
  name: string;
  enabled: boolean;
  imageUrl: string;
  createdAt: Timestamp;
}
```

### `bookings`

```typescript
interface Booking {
  bookingId: string;
  status: "pending" | "inprocess" | "completed" | "cancelled";
  salon: {
    salonId: string;
    shopName: string;
    city: string;
    address: string;
    country: string;
    lat: number;
    lng: number;
    placeId: string;
    owner: { fullName: string; phoneNumber: string; email: string; profileImage: string; };
  };
  user: {
    userId: string;
    fullName: string;
    phoneNumber: string;
    profileImage: string;
  };
  services: Array<{
    serviceId: string;
    name: string;
    categoryId: string;
    providerId: string;
    minutes: number;
    price: number;
  }>;
  schedule: {
    startAt: string;
    endAt: string;
    durationMinutes: number;
  };
  pricing: { total: number; currency: "EUR"; };
  notes: string | null;
  review: {
    isReviewed: boolean;
    rating: number;
    comment: string;
    reviewImage: string | null;
    userId: string;
    reviewedAt: Timestamp;
  } | null;
  cancelReason?: string;
  cancelledBy?: string;
  cancelledAt?: Timestamp;
  createdAt: Timestamp;
}
```

### `notifications`

```typescript
interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "order";
  orderId: string;
  receiverId: string;
  senderId: string;
  isRead: boolean;
  createdAt: Timestamp;
}
```

### `conversations`

```typescript
interface Conversation {
  conversationId: string;
  participants: [string, string];
  salonId: string;
  userId: string;
  userInfo: {
    [uid: string]: { name: string; image: string; };
  };
  lastMessage: string;
  lastMessageAt: Timestamp;
}

interface ChatMessage {
  senderId: string;
  text: string;
  imageUrl: string | null;
  seen: boolean;
  createdAt: Timestamp;
}
```

### `subscriptions`

```typescript
interface SubscriptionBinding {
  bound_salon_id: string;
  platform: "ios" | "android" | "web";
  product_id?: string;
  created_at: Timestamp;
}
```

> **Important:** There is NO separate `salons` collection. All salon data lives in `users` where `role == "salon"`.

---

## 6. AUTHENTICATION SYSTEM

### 6.1 User Sign Up (Form → OTP → Account)

**Step 1 — Form:**
- Profile image (required), full name, email, phone (international with country picker), password (8+ chars), confirm password, agree to T&C checkbox
- **Validation (Zod):** Email format, phone format, password min 8, passwords match, image required

**Step 2 — Duplicate Check:**
- Query Firestore: `users` where `data.email == email` (limit 1)
- Query Firestore: `users` where `data.phoneNumber == phone` (limit 1)
- If either exists → show error

**Step 3 — OTP:**
- Firebase phone auth on web requires `RecaptchaVerifier` (invisible reCAPTCHA)
- `signInWithPhoneNumber(auth, phone, recaptchaVerifier)` → returns `confirmationResult`
- User enters 6-digit OTP → `confirmationResult.confirm(otp)`
- Then `linkWithCredential(EmailAuthProvider.credential(email, password))`

**Step 4 — Firestore Write:**
```js
await setDoc(doc(db, "users", uid), {
  uid, role: "user", createdAt: serverTimestamp(),
  isBlock: "0",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  timezoneUpdatedAt: serverTimestamp(),
  data: { fullName, email, phoneNumber, profileImage: uploadedUrl },
});
await updateDoc(userRef, { fcmTokens: arrayUnion([webFcmToken]) });
```

### 6.2 Salon Owner Sign Up (2-Step + OTP)

**Step 1:** Shop logo, shop name, owner name, email, phone, password, confirm password

**Step 2:** Location (Google Places autocomplete), shop images (1-7), SIRET number, legal status (dropdown), description, auto-accept booking toggle, agree to T&C

**Firestore Write includes extra:**
```js
{
  ...baseFields,
  role: "salon",
  salon: {
    shopName, shopImages: [urls], siretNumber, legalStatus,
    description, status: "pending", autoAcceptBooking: 0|1,
  },
  location: { address, city, country, placeId, lat, lng },
}
```

### 6.3 Login

1. `signInWithEmailAndPassword(auth, email, password)`
2. Fetch `users/{uid}` from Firestore
3. **Block check:** `isBlock == "1"` → sign out
4. **Salon status:** `pending` → sign out; `declined` → redirect to support
5. Save FCM token
6. Store in Zustand
7. Route: `salon` → `/dashboard`; `user` → `/`

### 6.4 Forgot Password

1. Validate email format
2. Check user exists in Firestore
3. `sendPasswordResetEmail(auth, email)`
4. Show success toast, redirect to login

### 6.5 Logout

1. Remove FCM token from Firestore
2. `signOut(auth)`
3. Clear Zustand stores + localStorage
4. Redirect to `/`

---

## 7. PAGE-BY-PAGE SPECIFICATION

### 7.1 HOME PAGE (`/`)

**Location Flow:**
1. Show location permission modal
2. Use `navigator.geolocation.getCurrentPosition()`
3. Reverse geocode via Google API for city name
4. Store in Zustand + localStorage
5. If declined → show all salons without distance
6. If granted → show featured salons filtered by proximity

**Sections:**
- Service Categories, Featured Salons, Nearby, For You
- Each salon card: First shop image, shop name, city, rating, distance

### 7.2–7.24 (See full plan for all page specs)

Covers: Search, Salon Detail, Salon Reviews, Booking, User Bookings, Cancel Booking, Submit Review, User Profile, Edit Profile, Favorites, User Settings, Notifications, Chat List, Chat Thread, Salon Dashboard, Salon Bookings, Salon Cancel, Salon Profile, Edit screens, Manage Services, Salon Settings

---

## 8. STRIPE SUBSCRIPTION (WEB)

- Product: "Nouryx Salon Monthly" — EUR, monthly
- Free trial: 2 months (60 days)
- API Routes: `/api/stripe/create-checkout`, `/api/stripe/webhook`, `/api/stripe/create-portal`
- Subscription gate on salon dashboard

---

## 9. WEB PUSH NOTIFICATIONS (FCM)

1. `public/firebase-messaging-sw.js` service worker
2. Request permission → get token → store in Firestore
3. Foreground: `onMessage` → sonner toast
4. Background: service worker shows browser notification

---

## 10. LOCATION SERVICES

- First visit flow with permission modal
- Google Places for salon registration
- Haversine distance calculation

---

## 11. INTERNATIONALIZATION (i18n)

- Locales: `fr` (default), `en`
- `next-intl` with JSON message files
- ~480 translation keys from mobile `.arb` files

---

## 12. FILE UPLOAD PATTERNS

| Upload | Storage Path | Max |
|---|---|---|
| User profile image | `users/{uid}/profile.jpg` | 1 |
| Salon logo | `users/{uid}/salon/logo.jpg` | 1 |
| Salon shop images | `users/{uid}/salon/images/shop_{0-6}.jpg` | 7 |
| Chat image | `chat_images/{timestamp}.jpg` | 1/msg |
| Review image | `reviews/{bookingId}.jpg` | 1/review |

---

## 13. KEY BUSINESS LOGIC

1. Slot blocking via Cloud Function
2. Auto-cancel pending bookings after 24h
3. Rating recalculation on review
4. Featured salons set by admin
5. Block/unblock via admin
6. Salon approval via admin
7. Subscription binding prevents sharing
8. Draft booking persistence in localStorage
9. Chat notifications via Cloud Function
10. Share salon link format

---

## 14. ENVIRONMENT VARIABLES

```env
NEXT_PUBLIC_FIREBASE_API_KEY=<from Firebase Console>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=my-assistant-64809.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=my-assistant-64809
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=my-assistant-64809.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1071894016355
NEXT_PUBLIC_FIREBASE_APP_ID=<from Firebase Console>
NEXT_PUBLIC_FIREBASE_VAPID_KEY=<from Cloud Messaging tab>
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAHF114Pn5RIOiG39XomX_QIslbeKfW9y4
NEXT_PUBLIC_CLOUD_FUNCTIONS_URL=https://us-central1-my-assistant-64809.cloudfunctions.net
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
```

---

## 15. IMPLEMENTATION ORDER (3 PHASES)

### Phase 1: Complete UI + Navigations (DONE)
All pages built with mock data, bilingual content, responsive design.

### Phase 2: Foundation + Auth + Home + Search + Salon Detail
Firebase SDK, TanStack Query, Zustand, Auth, real data integration for home/search/salon pages.

### Phase 3: Booking + User Features + Chat + Notifications + Salon Dashboard + Stripe
Full booking flow, user features, real-time chat, FCM, salon dashboard, Stripe subscriptions.

---

## 16. CRITICAL NOTES

1. **SAME FIREBASE BACKEND** — Do NOT create new collections or change schema
2. **No separate `salons` collection** — All salon data in `users` where `role == "salon"`
3. **FCM tokens** — Web tokens coexist with mobile tokens
4. **Phone OTP on web** — MUST use `RecaptchaVerifier`
5. **Image upload** — Use `File` API + `uploadBytes`
6. **Real-time** — Use `onSnapshot` for chat only
7. **Currency** — Always EUR
8. **Salon hours** — Fixed 09:00–19:00
9. **User booking tabs** — InProcess / Completed / Cancelled (NOT Pending)
10. **Stripe writes `platform: "web"`** — Never overwrite mobile data
11. **`isBlock` is a string** — `"0"` or `"1"`
12. **`autoAcceptBooking` is a number** — `0` or `1`
13. **Admin panel** at `admin.nouryx.com` — website does NOT replicate admin features
14. **Service duration conversions** — "10 minutes"→10, "1 hour"→60, "2 hours"→120, etc.
15. **Salon cancel reasons differ from user cancel reasons**
