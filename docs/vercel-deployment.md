# Deploy Nouryx Website to Vercel (Step by Step)

This guide deploys the Next.js website to Vercel and configures Stripe webhooks so subscriptions update Firestore correctly.

## 1) Prepare the repo

1. Push the website code to a Git repository (GitHub/GitLab/Bitbucket).
2. Make sure you can build locally:
   - `npm install`
   - `npm run build`

## 2) Create the Vercel project

1. Log in to Vercel.
2. Click **Add New → Project**.
3. Import your Git repository.
4. Select the correct **Root Directory**:
   - If the repo contains multiple projects, choose `Nouryx-Website`.
5. Framework should auto-detect as **Next.js**.

## 3) Configure build settings

Use the defaults unless you have a special case:

- Build Command: `npm run build`
- Output Directory: (leave empty; Next.js)
- Install Command: `npm install`

## 4) Add Environment Variables (Vercel)

In Vercel Project → **Settings → Environment Variables**, add these (same values you use locally):

### Stripe (required)
- `STRIPE_SECRET_KEY` = `sk_live_...` (or `sk_test_...` for preview/testing)
- `STRIPE_PRODUCT_ID` = `prod_...`
- `STRIPE_WEBHOOK_SECRET` = `whsec_...` (created in Stripe after webhook endpoint creation)

### Firebase (required for webhook server-side admin writes)
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- Any other `NEXT_PUBLIC_FIREBASE_*` variables your frontend uses (apiKey, authDomain, etc.)
- `FIREBASE_SERVICE_ACCOUNT_KEY`
  - Recommended format: paste the full JSON as a single line.
  - Important: keep quotes valid and avoid trailing commas.

## 5) Deploy

1. Click **Deploy**.
2. Wait for build completion.
3. Open the deployed URL and verify pages load.

## 6) Create Stripe Webhook endpoint for Vercel

Your webhook handler is implemented at:
- `/api/stripe/webhook` (see `src/app/api/stripe/webhook/route.ts`)

### Create the endpoint in Stripe

1. Stripe Dashboard → **Developers → Webhooks**
2. Click **Add endpoint**
3. Endpoint URL:
   - `https://YOUR_VERCEL_DOMAIN/api/stripe/webhook`
   - Example: `https://nouryx.vercel.app/api/stripe/webhook`
4. Events to send:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Save
6. Copy the **Signing secret** (`whsec_...`) and set it in Vercel as `STRIPE_WEBHOOK_SECRET`.

## 7) Verify webhook deliveries

1. Stripe Dashboard → **Developers → Webhooks**
2. Open your endpoint
3. Make a test purchase (Stripe test mode is recommended first)
4. Confirm you see `200` deliveries.

If webhook fails, check Vercel → Project → **Functions** logs for `/api/stripe/webhook`.

## 8) Post-deployment checklist

- Pricing page shows Free (1 year) plan card.
- Dashboard access works for the first year after account creation.
- After one year, dashboard redirects to subscription screen and shows a toast.
- Subscription purchase updates Firestore `users/{salonId}.subscription.active = true` via webhook.

