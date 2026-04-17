import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const paymentIntentId =
      typeof body?.paymentIntentId === "string" ? body.paymentIntentId : "";

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "paymentIntentId is required" },
        { status: 400 },
      );
    }

    const stripe = getStripe();
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.status !== "succeeded") {
      return NextResponse.json(
        { status: intent.status, paid: false },
        { status: 200 },
      );
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("paid_waitlist")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        stripe_customer_id:
          typeof intent.customer === "string" ? intent.customer : null,
      })
      .eq("stripe_payment_intent_id", paymentIntentId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ paid: true });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to finalize payment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
