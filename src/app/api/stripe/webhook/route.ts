import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

// Initialize Firebase Admin (server-side only)
if (getApps().length === 0) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        // Authenticate with explicit service account credentials if provided (Vercel/Local)
        const cert = require('firebase-admin/app').cert;
        initializeApp({
            credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
    } else {
        // Fallback to ADC
        initializeApp({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
    }
}

const adminDb = getFirestore();

export async function POST(request: NextRequest) {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const salonId = session.metadata?.salonId;
                if (!salonId) break;

                // Retrieve subscription details
                const subscription = await stripe.subscriptions.retrieve(
                    session.subscription as string
                );

                const subData = subscription as unknown as Record<string, unknown>;

                // Update Firestore — platform: "web", never overwrite mobile data
                await adminDb.doc(`users/${salonId}`).update({
                    subscription: {
                        active: true,
                        product_id: process.env.STRIPE_PRODUCT_ID || "",
                        platform: "web",
                        status: subscription.status,
                        stripe_customer_id: session.customer as string,
                        stripe_subscription_id: subscription.id,
                        free_trial: {
                            enabled: !!subscription.trial_end,
                            duration_months: 0,
                            used: false,
                        },
                        purchase: {
                            started_at: (Number(subData.current_period_start ?? 0)) * 1000,
                            expires_at: (Number(subData.current_period_end ?? 0)) * 1000,
                            auto_renew: !subscription.cancel_at_period_end,
                        },
                    },
                });

                // Create subscription binding
                await adminDb.collection("subscriptions").doc(salonId).set({
                    bound_salon_id: salonId,
                    platform: "web",
                    product_id: process.env.STRIPE_PRODUCT_ID || "",
                    created_at: new Date(),
                });
                break;
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;
                const salonId = subscription.metadata?.salonId;
                if (!salonId) break;

                const subData = subscription as unknown as Record<string, unknown>;

                await adminDb.doc(`users/${salonId}`).update({
                    "subscription.active":
                        subscription.status === "active" ||
                        subscription.status === "trialing",
                    "subscription.status": subscription.cancel_at_period_end ? "cancelled_at_period_end" : subscription.status,
                    "subscription.purchase.expires_at":
                        (Number(subData.current_period_end ?? 0)) * 1000,
                    "subscription.purchase.auto_renew":
                        !subscription.cancel_at_period_end,
                });
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                const salonId = subscription.metadata?.salonId;
                if (!salonId) break;

                await adminDb.doc(`users/${salonId}`).update({
                    "subscription.active": false,
                    "subscription.status": "cancelled",
                    "subscription.purchase.auto_renew": false,
                    "subscription.purchase.ended_at": Date.now(),
                });
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook processing error:", error);
        return NextResponse.json(
            { error: "Webhook processing failed", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
