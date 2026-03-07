import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { stripeCustomerId } = body;

        if (!stripeCustomerId) {
            return NextResponse.json(
                { error: "Missing stripeCustomerId" },
                { status: 400 }
            );
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: `${request.nextUrl.origin}/dashboard/subscription`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Stripe portal error:", error);
        return NextResponse.json(
            { error: "Failed to create portal session" },
            { status: 500 }
        );
    }
}
