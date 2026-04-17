import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      webhookSecret
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook error";
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const ref = session.client_reference_id;
      const uuidRe =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      if (ref && uuidRe.test(ref)) {
        try {
          const supabase = getSupabaseAdmin();
          const { data: paidRow } = await supabase
            .from("paid_waitlist")
            .select("id")
            .eq("id", ref)
            .maybeSingle();

          if (paidRow) {
            const customerId =
              typeof session.customer === "string" ? session.customer : null;
            await supabase
              .from("paid_waitlist")
              .update({
                status: "paid",
                paid_at: new Date().toISOString(),
                stripe_customer_id: customerId,
              })
              .eq("id", ref);
            break;
          }
        } catch (err) {
          console.error("paid_waitlist checkout.session.completed:", err);
        }
      }

      console.log("checkout.session.completed:", session.customer_email);
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("Subscription updated:", subscription.id);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("Subscription canceled:", subscription.id);
      break;
    }
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      if (intent.metadata?.product === "max_early_access") {
        try {
          const supabase = getSupabaseAdmin();
          await supabase
            .from("paid_waitlist")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
              stripe_customer_id:
                typeof intent.customer === "string" ? intent.customer : null,
            })
            .eq("stripe_payment_intent_id", intent.id);
        } catch (err) {
          console.error("Failed to mark paid_waitlist as paid:", err);
        }
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      if (intent.metadata?.product === "max_early_access") {
        try {
          const supabase = getSupabaseAdmin();
          await supabase
            .from("paid_waitlist")
            .update({ status: "failed" })
            .eq("stripe_payment_intent_id", intent.id);
        } catch (err) {
          console.error("Failed to mark paid_waitlist as failed:", err);
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
