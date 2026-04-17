import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EARLY_ACCESS_AMOUNT_CENTS = 799;
const EARLY_ACCESS_CURRENCY = "usd";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawEmail = typeof body?.email === "string" ? body.email : "";
    const password = typeof body?.password === "string" ? body.password : "";

    const email = rawEmail.trim().toLowerCase();

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "A valid email is required" },
        { status: 400 },
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }
    if (password.length > 200) {
      return NextResponse.json(
        { error: "Password is too long" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();

    const { data: existing, error: lookupError } = await supabase
      .from("paid_waitlist")
      .select("id, status, stripe_payment_intent_id")
      .eq("email", email)
      .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    if (existing && existing.status === "paid") {
      return NextResponse.json(
        {
          error:
            "This email already has early access. Please use another email or contact support.",
        },
        { status: 409 },
      );
    }

    const password_hash = await bcrypt.hash(password, 12);
    const stripe = getStripe();

    let paymentIntentId: string | null =
      existing?.stripe_payment_intent_id ?? null;
    let clientSecret: string | null = null;

    if (paymentIntentId) {
      try {
        const existingIntent = await stripe.paymentIntents.retrieve(
          paymentIntentId,
        );
        if (
          existingIntent.status === "requires_payment_method" ||
          existingIntent.status === "requires_confirmation" ||
          existingIntent.status === "requires_action"
        ) {
          clientSecret = existingIntent.client_secret ?? null;
        } else {
          paymentIntentId = null;
        }
      } catch {
        paymentIntentId = null;
      }
    }

    if (!paymentIntentId || !clientSecret) {
      const intent = await stripe.paymentIntents.create({
        amount: EARLY_ACCESS_AMOUNT_CENTS,
        currency: EARLY_ACCESS_CURRENCY,
        automatic_payment_methods: { enabled: true },
        receipt_email: email,
        description: "Max — Early Access (1 month · limited launch pricing)",
        metadata: {
          product: "max_early_access",
          email,
        },
      });
      paymentIntentId = intent.id;
      clientSecret = intent.client_secret ?? null;
    }

    if (!clientSecret || !paymentIntentId) {
      throw new Error("Failed to create payment intent");
    }

    const upsertPayload = {
      email,
      password_hash,
      stripe_payment_intent_id: paymentIntentId,
      amount_cents: EARLY_ACCESS_AMOUNT_CENTS,
      currency: EARLY_ACCESS_CURRENCY,
      status: "pending" as const,
    };

    const { error: upsertError } = await supabase
      .from("paid_waitlist")
      .upsert(upsertPayload, { onConflict: "email" });

    if (upsertError) {
      throw upsertError;
    }

    return NextResponse.json({
      clientSecret,
      paymentIntentId,
      amount: EARLY_ACCESS_AMOUNT_CENTS,
      currency: EARLY_ACCESS_CURRENCY,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to start checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
