import { NextResponse } from "next/server";
import { getSupabaseJwtRole } from "@/lib/supabaseJwt";

export const dynamic = "force-dynamic";

/**
 * Lightweight config check (no secrets returned). Use after deploy or when
 * debugging the payment pipeline.
 */
export async function GET() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const role = serviceKey ? getSupabaseJwtRole(serviceKey) : undefined;

  const checks = {
    supabaseUrl: !!(
      process.env.SUPABASE_URL?.trim() ||
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    ),
    supabaseServiceKeyPresent: !!serviceKey,
    supabaseServiceRoleJwtOk: role === "service_role",
    stripeSecretPresent: !!process.env.STRIPE_SECRET_KEY?.trim(),
    stripePublishablePresent: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim(),
    stripeWebhookPresent: !!process.env.STRIPE_WEBHOOK_SECRET?.trim(),
    appUrlPresent: !!process.env.NEXT_PUBLIC_APP_URL?.trim(),
  };

  const allOk =
    checks.supabaseUrl &&
    checks.supabaseServiceKeyPresent &&
    checks.supabaseServiceRoleJwtOk &&
    checks.stripeSecretPresent &&
    checks.stripeWebhookPresent &&
    checks.appUrlPresent;

  return NextResponse.json(
    {
      ok: allOk,
      checks,
      hint: allOk
        ? "Core env vars look set. POST /api/max-waitlist registers email + password to max_waitlist."
        : "Fix missing or wrong env vars on your host (Vercel). SUPABASE_SERVICE_ROLE_KEY must be the service_role JWT (role claim = service_role).",
    },
    { status: allOk ? 200 : 503 },
  );
}
