# Subscription Plan Update: 1 Year Free, then €29 (with Access Control)

This plan outlines the changes needed to transition the current subscription model to a 1-year free trial followed by a €29 automatic charge. It also includes the implementation of a "Subscription Gate" to ensure users cannot perform operations without an active subscription/trial.

## Current State Analysis

* **Trial Period**: Currently 60 days (2 months) in the Stripe integration logic.

* **Price**: Currently €29.99 in content files and configured in Stripe.

* **Access Control**: No enforcement exists yet; users can access dashboard features without an active subscription.

* **Localization**: Mentions of "2 months" and "29.99" are present across 5 languages and in blog posts.

## Proposed Changes

### 1. Backend Logic (Stripe)

* **File**: [route.ts](file:///c:/Users/Aims%20tech/Documents/Nouryx/Nouryx-Website/src/app/api/stripe/create-checkout/route.ts)

* **Action**: Change `trial_period_days` from `60` to `365`.

* **Reason**: This ensures that when a user "subscribes" to the free plan, they won't be charged for 365 days. Stripe will automatically charge the €29 after this period.

### 2. Implementation of Subscription Gate (Access Control)

* **File**: [layout.tsx](file:///c:/Users/Aims%20tech/Documents/Nouryx/Nouryx-Website/src/app/dashboard/layout.tsx)

* **Action**: Add logic to check `user.subscription.active`. If `false` and the user is not on the subscription page, redirect them to `/dashboard/subscription`.

* **Reason**: This fulfills the requirement "otherwise don't allow user to perform operations". Users will be forced to the subscription page to start their free year before they can use other dashboard features.

### 3. Content Update (Price and Trial Duration)

For each language file in `src/data/`, update the price to "29" and the free trial mention to "1 year" or "12 months".

* **Files**:

  * [content.en.ts](file:///c:/Users/Aims%20tech/Documents/Nouryx/Nouryx-Website/src/data/content.en.ts): "29", "12 months free trial"

  * [content.fr.ts](file:///c:/Users/Aims%20tech/Documents/Nouryx/Nouryx-Website/src/data/content.fr.ts): "29", "1 an d'essai gratuit"

  * [content.sp.ts](file:///c:/Users/Aims%20tech/Documents/Nouryx/Nouryx-Website/src/data/content.sp.ts): "29", "1 año de prueba gratuita"

  * [content.it.ts](file:///c:/Users/Aims%20tech/Documents/Nouryx/Nouryx-Website/src/data/content.it.ts): "29", "1 anno di prova gratuita"

  * [content.pt.ts](file:///c:/Users/Aims%20tech/Documents/Nouryx/Nouryx-Website/src/data/content.pt.ts): "29", "1 ano de teste gratuito"

### 4. Blog Posts and UI

* **File**: [blog-posts.ts](file:///c:/Users/Aims%20tech/Documents/Nouryx/Nouryx-Website/src/data/blog-posts.ts)

* **Action**: Replace all occurrences of "2 months", "2 mois", etc., with "1 year" or "12 months".

* **File**: [blog-post-content.tsx](file:///c:/Users/Aims%20tech/Documents/Nouryx/Nouryx-Website/src/app/blog/\[slug]/blog-post-content.tsx)

* **Action**: Update the promotional footer text.

### 5. Documentation

* Update files in `docs/` (e.g., `03-remaining-tasks-phase2.md`, `01-migration-plan-v2.md`) to reflect the new 1-year policy.

## Assumptions & Decisions

* **Required Card Details**: To "automatically charge" after one year, users MUST provide their payment details upfront via the Stripe Checkout session. This is standard for "Free Trial" models.

* **Access Enforcement**: The redirection in `DashboardLayout` is a client-side gate. For full security, server-side middleware would be ideal, but client-side is sufficient for the current UI/UX requirement.

## Verification Steps

1. **Access Control**: Log in with a salon account that has no subscription. Verify that you are automatically redirected to `/dashboard/subscription` and cannot access other tabs.
2. **Visual Test**: Verify the pricing page shows "€29" and "1 year free trial" in all languages.
3. **Logic Verification**: Confirm that clicking "Upgrade/Start Trial" leads to a Stripe session with 365 days trial (viewable in URL or Stripe dashboard logs).

