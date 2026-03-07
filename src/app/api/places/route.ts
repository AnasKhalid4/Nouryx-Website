import { NextRequest, NextResponse } from "next/server";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const BASE_URL = "https://maps.googleapis.com/maps/api/place";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action"); // "autocomplete" or "details"

    if (action === "autocomplete") {
        const input = searchParams.get("input") || "";
        if (!input.trim()) return NextResponse.json([]);

        const url = `${BASE_URL}/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== "OK") return NextResponse.json([]);

        const predictions = data.predictions.map(
            (p: { description: string; place_id: string }) => ({
                description: p.description,
                placeId: p.place_id,
            })
        );
        return NextResponse.json(predictions);
    }

    if (action === "details") {
        const placeId = searchParams.get("placeId") || "";
        if (!placeId) return NextResponse.json(null);

        const url = `${BASE_URL}/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== "OK") return NextResponse.json(null);

        const result = data.result;
        const location = result.geometry.location;

        let city = "";
        let country = "";
        const components = result.address_components || [];
        for (const comp of components) {
            if (comp.types.includes("locality")) city = comp.long_name;
            else if (comp.types.includes("administrative_area_level_1") && !city)
                city = comp.long_name;
            if (comp.types.includes("country")) country = comp.long_name;
        }

        return NextResponse.json({
            placeId,
            address: result.formatted_address,
            city,
            country,
            lat: location.lat,
            lng: location.lng,
        });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
