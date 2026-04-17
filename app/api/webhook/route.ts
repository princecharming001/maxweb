import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
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
      console.log("Subscription created for:", session.customer_email);
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
