import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { salonId, email } = body;

        if (!salonId || !email) {
            return NextResponse.json(
                { error: "Missing salonId or email" },
                { status: 400 }
            );
        }

        // Look up the active price for the product
        const productId = process.env.STRIPE_PRODUCT_ID;
        if (!productId) {
            return NextResponse.json(
                { error: "Stripe product ID not configured" },
                { status: 500 }
            );
        }

        const prices = await stripe.prices.list({
            product: productId,
            active: true,
            limit: 1,
        });

        if (prices.data.length === 0) {
            return NextResponse.json(
                { error: "No active price found for this product" },
                { status: 500 }
            );
        }

        const priceId = prices.data[0].id;

        // Create or retrieve customer
        const customers = await stripe.customers.list({ email, limit: 1 });
        let customer: Stripe.Customer;

        if (customers.data.length > 0) {
            customer = customers.data[0];
        } else {
            customer = await stripe.customers.create({
                email,
                metadata: { salonId },
            });
        }

        // Create checkout session with 2-month free trial
        const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            payment_method_types: ["card"],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: "subscription",
            subscription_data: {
                trial_period_days: 60, // 2-month free trial
                metadata: { salonId, platform: "web" },
            },
            success_url: `${request.nextUrl.origin}/dashboard/subscription?success=true`,
            cancel_url: `${request.nextUrl.origin}/dashboard/subscription?cancelled=true`,
            metadata: { salonId, platform: "web" },
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error("Stripe checkout error:", error);
        return NextResponse.json(
            { error: "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
