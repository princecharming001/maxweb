import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { buildEarlyAccessCheckoutUrl } from "@/lib/earlyAccessPaymentLink";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Saves email + bcrypt-hashed password to paid_waitlist, then returns the Stripe
 * Payment Link URL (with client_reference_id + prefilled_email) for hosted checkout.
 */
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
      .select("id, status")
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

    const upsertPayload = {
      email,
      password_hash,
      stripe_payment_intent_id: null as string | null,
      amount_cents: 799,
      currency: "usd",
      status: "pending" as const,
    };

    const { data: row, error: upsertError } = await supabase
      .from("paid_waitlist")
      .upsert(upsertPayload, { onConflict: "email" })
      .select("id")
      .single();

    if (upsertError) {
      throw upsertError;
    }

    if (!row?.id) {
      throw new Error("Failed to save signup");
    }

    const url = buildEarlyAccessCheckoutUrl(row.id, email);

    return NextResponse.json({ url });
  } catch (err: unknown) {
    console.error("[/api/early-access/intent] error:", err);
    let message = "Failed to start checkout";
    if (err instanceof Error) {
      message = err.message;
    } else if (err && typeof err === "object") {
      const maybe = err as { message?: unknown; error?: unknown };
      if (typeof maybe.message === "string") message = maybe.message;
      else if (typeof maybe.error === "string") message = maybe.error;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
