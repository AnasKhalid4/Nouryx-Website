# Nouryx Website — Remaining Tasks & Phase 2 Plan

## CURRENT STATUS

**Phase 1 (UI Build): COMPLETE ✅**
All 24 pages built with mock data, bilingual content, responsive design, and Fresha-inspired UI.

**Phase 2 (Firebase Integration): NOT STARTED ❌**

---

## REMAINING UI POLISH (Optional)

These are minor UI tweaks that can be done anytime:

- [ ] Add loading skeletons for all pages
- [ ] Add empty state components (no results, no bookings, etc.)
- [ ] Add error boundary components
- [ ] Improve mobile responsiveness on smaller screens
- [ ] Add page transition animations
- [ ] Add micro-interactions (button hover, card hover effects)
- [ ] Add SEO meta tags per page
- [ ] Add favicon and Open Graph images
- [ ] Salon detail reviews page (`/salon/[id]/reviews`) — dedicated paginated page
- [ ] Cancel booking pages (`/bookings/cancel`, `/dashboard/bookings/cancel`)
- [ ] Salon profile edit sub-pages (`/dashboard/profile/edit-basic`, `edit-business`, `edit-images`)

---

## PHASE 2: FIREBASE INTEGRATION + AUTH + CORE FEATURES

### Prerequisites (Manual Steps)

- [ ] **Create Firebase Web App** in Firebase Console → get `apiKey` and `appId`
- [ ] **Generate VAPID key** for web push notifications
- [ ] **Enable Google Maps APIs** (Maps JavaScript, Places, Geocoding) for web domain
- [ ] **Create Stripe account** → get API keys + create product/price
- [ ] **Set up `.env.local`** with all environment variables

### 2.1 Foundation Setup

- [ ] Install Firebase SDK (`firebase` v10+)
- [ ] Install TanStack Query v5 + `@tanstack-query-firebase/react`
- [ ] Install Zustand for client state
- [ ] Install `next-intl` for i18n
- [ ] Install `react-hook-form` + `zod` for form validation
- [ ] Install `react-phone-number-input` for phone fields
- [ ] Install `sonner` for toast notifications
- [ ] Install `date-fns` for date formatting

### 2.2 Firebase Configuration

- [ ] Create `src/lib/firebase/config.ts` — Firebase app initialization
- [ ] Create `src/lib/firebase/auth.ts` — Auth helpers (login, signup, OTP, logout)
- [ ] Create `src/lib/firebase/firestore.ts` — Collection references & typed helpers
- [ ] Create `src/lib/firebase/storage.ts` — Upload helpers
- [ ] Create `src/lib/firebase/messaging.ts` — FCM web setup

### 2.3 State Management

- [ ] Create `src/providers/query-provider.tsx` — TanStack QueryClientProvider
- [ ] Create `src/providers/auth-provider.tsx` — Firebase auth state listener
- [ ] Create `src/stores/auth-store.ts` — Zustand: user, isLoggedIn, role, uid
- [ ] Create `src/stores/location-store.ts` — Zustand: lat, lng, address
- [ ] Create `src/stores/booking-store.ts` — Zustand: selected salon, services, date, time
- [ ] Create `src/stores/locale-store.ts` — Zustand: locale ("fr" | "en")

### 2.4 TypeScript Types

- [ ] Create `src/types/user.ts` — AuthUser, UserProfile, SalonInfo
- [ ] Create `src/types/salon.ts` — SalonModel, SalonService
- [ ] Create `src/types/booking.ts` — BookingModel, BookingSchedule, BookingPricing
- [ ] Create `src/types/category.ts` — CategoryModel
- [ ] Create `src/types/conversation.ts` — ConversationModel, ChatMessage
- [ ] Create `src/types/notification.ts` — AppNotification
- [ ] Create `src/types/review.ts` — ReviewModel
- [ ] Create `src/types/subscription.ts` — SubscriptionData

### 2.5 TanStack Query Hooks

- [ ] Create `src/hooks/use-auth.ts` — Auth state hook
- [ ] Create `src/hooks/use-salons.ts` — Featured, nearby, for-you, detail
- [ ] Create `src/hooks/use-categories.ts` — Enabled categories
- [ ] Create `src/hooks/use-bookings.ts` — User/salon bookings by status
- [ ] Create `src/hooks/use-reviews.ts` — Paginated reviews
- [ ] Create `src/hooks/use-chat.ts` — Real-time chat messages
- [ ] Create `src/hooks/use-notifications.ts` — Notifications list
- [ ] Create `src/hooks/use-services.ts` — Salon services CRUD
- [ ] Create `src/hooks/use-location.ts` — Browser geolocation

### 2.6 Authentication Pages (Replace Mock UI)

- [ ] **Login page** — Wire to `signInWithEmailAndPassword`, block check, role routing
- [ ] **Signup (User)** — Form validation, duplicate check, OTP with reCAPTCHA, Firestore write
- [ ] **Signup (Salon)** — 2-step form, Google Places location, image upload, OTP
- [ ] **OTP page** — `RecaptchaVerifier` + `signInWithPhoneNumber` + `confirm()`
- [ ] **Forgot Password** — Email check in Firestore + `sendPasswordResetEmail`
- [ ] **Logout** — Remove FCM token, clear stores, redirect

### 2.7 Auth Middleware

- [ ] Create `src/middleware.ts` — Auth guards, role-based redirects
- [ ] Protected routes: `/profile/*`, `/bookings`, `/booking`, `/chat/*`, `/notifications`
- [ ] Salon-only routes: `/dashboard/*`
- [ ] Redirect logged-in users away from `/login`, `/signup`

### 2.8 Home Page (Real Data)

- [ ] Location permission modal on first visit
- [ ] Fetch categories from Firestore
- [ ] Fetch featured salons (with services subcollection)
- [ ] Nearby salons (if location granted) — Haversine filter
- [ ] For You salons — all approved, paginated

### 2.9 Search Page (Real Data)

- [ ] Load all approved salons
- [ ] Client-side filter by name, city, category
- [ ] Rating and distance filters

### 2.10 Salon Detail (Real Data)

- [ ] Fetch salon data from `users/{salonId}`
- [ ] Fetch services from `users/{salonId}/services`
- [ ] Fetch latest 3 reviews from `users/{salonId}/reviews`
- [ ] Favorite toggle (read/write `users/{uid}/favourite/{salonId}`)
- [ ] Chat creation (check existing conversation, create if needed)
- [ ] Share salon link
- [ ] Draft booking persistence in localStorage

### 2.11 i18n Migration

- [ ] Port ~480 translation keys from Flutter `.arb` files to JSON
- [ ] Create `public/locales/en.json` and `public/locales/fr.json`
- [ ] Replace current `content.en.ts`/`content.fr.ts` with `next-intl`

---

## PHASE 3: BOOKING + USER FEATURES + CHAT + DASHBOARD + STRIPE

### 3.1 Booking Flow

- [ ] Calendar date selection with slot availability
- [ ] Time slot validation (past times, duration overflow, blocked slots)
- [ ] Booking confirmation — Firestore batch write (booking doc + user index + salon index)
- [ ] Send notification to salon via Cloud Function
- [ ] Auto-accept logic (`autoAcceptBooking === 1`)

### 3.2 User Bookings

- [ ] Fetch bookings from `users/{uid}/bookings` → `bookings/{id}`
- [ ] Tab filtering: InProcess, Completed, Cancelled
- [ ] Cancel booking with reason selection + notification
- [ ] Review submission (rating, comment, image upload)

### 3.3 User Profile

- [ ] View profile from Firestore
- [ ] Edit profile (name, image upload to Storage)
- [ ] Favorites list from `users/{uid}/favourite`

### 3.4 Notifications

- [ ] Query `notifications` where `receiverId == uid`
- [ ] Mark as read on tap
- [ ] Navigate to relevant booking

### 3.5 Chat System

- [ ] Real-time messages via `onSnapshot`
- [ ] Send text messages
- [ ] Send image messages (upload to Storage)
- [ ] Push notification on each message
- [ ] Conversation creation from salon detail
- [ ] Delete conversation

### 3.6 FCM Web Push Notifications

- [ ] Create `public/firebase-messaging-sw.js`
- [ ] Request notification permission
- [ ] Get/store FCM token
- [ ] Foreground message handling (sonner toast)
- [ ] Background notification via service worker

### 3.7 Salon Dashboard (Real Data)

- [ ] Dashboard home: real stats from `users/{uid}` + today's bookings
- [ ] Booking management: Accept, Complete, Cancel with salon-specific reasons
- [ ] Booking detail view
- [ ] Salon profile preview + edit screens (basic info, business info, images)
- [ ] Service CRUD (add, edit, delete with category dropdown + duration)
- [ ] Settings: language, password, delete account, logout

### 3.8 Stripe Subscription

- [ ] Create `src/lib/stripe/client.ts` — Stripe initialization
- [ ] API Route: `POST /api/stripe/create-checkout` — Create checkout session
- [ ] API Route: `POST /api/stripe/webhook` — Handle Stripe events
- [ ] API Route: `POST /api/stripe/create-portal` — Customer portal
- [ ] Subscription page: plan status, upgrade/manage CTA
- [ ] Subscription gate middleware for salon dashboard
- [ ] Free trial logic (2 months)
- [ ] Platform: "web" — never overwrite mobile subscription data

### 3.9 Final Polish

- [ ] Loading skeletons for all data-fetching pages
- [ ] Empty states for no results
- [ ] Error boundaries
- [ ] Responsive final pass
- [ ] Page transition animations
- [ ] Deep link support (`/salon/[id]`)
- [ ] SEO optimization (meta tags, OG images)
- [ ] Performance audit (Lighthouse)

---

## IMPLEMENTATION ORDER SUMMARY

| Phase | Description | Status |
|---|---|---|
| **Phase 1** | Complete UI + Navigations (24 pages, mock data, bilingual) | ✅ DONE |
| **Phase 2** | Firebase SDK + Auth + State Management + Home/Search/Salon real data + i18n | ❌ NOT STARTED |
| **Phase 3** | Booking flow + User features + Chat + Notifications + Dashboard + Stripe | ❌ NOT STARTED |

---

## CRITICAL REMINDERS

1. **Same Firebase backend** (`my-assistant-64809`) — shared with mobile app
2. **No separate `salons` collection** — all salon data in `users` where `role == "salon"`
3. **Phone OTP on web** requires `RecaptchaVerifier`
4. **`isBlock` is a string** (`"0"` or `"1"`), **`autoAcceptBooking` is a number** (`0` or `1`)
5. **User booking tabs**: InProcess / Completed / Cancelled (NOT Pending)
6. **Stripe writes `platform: "web"`** — never overwrite mobile subscription data
7. **Currency always EUR** — format as `EUR {amount}` or `{amount} €`
8. **Salon hours**: Fixed 09:00–19:00, hourly time slots
