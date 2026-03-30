# Website Subscription Model & Stripe Setup

This document describes how subscription access works on the website, what to configure in Stripe, and which files implement the logic.

## 1. Stripe Account Configuration

### Product & Pricing Setup
1. **Product**: Create a single recurring subscription product in Stripe (e.g., `Nouryx Professional`).
2. **Price**: Create one active recurring price (e.g., `€29.99 / month`).
3. **Trial Setting in Stripe**: Do not configure a Stripe trial period for this product/price. The website's “1-year free access” is not a Stripe trial; it is handled by account age in the app.

### Webhook Configuration
Ensure your Stripe Webhook is configured to listen to the following events and is pointing to your production/staging `api/stripe/webhook` endpoint:
*   `checkout.session.completed`
*   `customer.subscription.updated`
*   `customer.subscription.deleted`

## 2. Web Application Code Changes

### A. 1-Year Free Access (No Card)
The website allows salon accounts to use the dashboard for the first year after account creation without paying or adding a card. After 1 year, an active subscription is required.

This is based on `user.createdAt` (Firestore account creation date), not Stripe trial time.

### B. Stripe Checkout (No Stripe Trial)
Stripe Checkout creates a subscription immediately (no Stripe trial). This is used when the salon upgrades after the free year ends.

*   **File**: `src/app/api/stripe/create-checkout/route.ts`
*   **Behavior**: Creates a subscription checkout session without `trial_period_days`.

### C. After 1 Year: Gate + Toast + Redirect
If a salon account is older than 1 year and `subscription.active` is false, the dashboard redirects to `/dashboard/subscription` and shows a toast asking the user to purchase.

*   **File Modified**: `src/app/dashboard/layout.tsx`
*   **Behavior**: Redirect only when account age >= 1 year AND subscription is inactive.

### D. Pricing UI
The pricing page shows a “Free (1 year)” plan card plus the paid Professional plan card.

*   **File**: `src/app/pricing/page.tsx`

### E. Subscription UI
The subscription page displays “Free (1 year)” status (with end date) when the user is within the first year and doesn’t have an active subscription yet.

*   **File**: `src/app/dashboard/subscription/page.tsx`

## 3. How the Flow Works Now
1. **Signup**: User creates a salon account.
2. **Free Year**: The salon can use the dashboard for 1 year (no card required).
3. **After 1 Year**: If not subscribed, the dashboard redirects to `/dashboard/subscription` and shows a toast.
4. **Checkout**: User clicks “Upgrade” and completes Stripe Checkout.
5. **Webhook Fires**: Stripe calls the webhook, which updates Firestore `subscription.active = true`.
6. **Access Granted**: The dashboard gate allows full access when subscription is active.
