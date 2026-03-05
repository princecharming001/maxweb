"use client";

import { Suspense, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import PricingCard from "@/components/PricingCard";
import Link from "next/link";

function PaymentContent() {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [configError, setConfigError] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  useEffect(() => {
    try {
      const supabase = getSupabase();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          router.push("/login");
        } else {
          setUserEmail(session.user.email || "");
          setLoading(false);
        }
      });
    } catch {
      setConfigError(true);
      setLoading(false);
    }
  }, [router]);

  const handleSignOut = async () => {
    try {
      await getSupabase().auth.signOut();
    } catch {
      /* not configured */
    }
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-16">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            max
          </Link>
          <div className="flex items-center gap-4">
            {userEmail && (
              <span className="text-[13px] text-muted hidden sm:inline">
                {userEmail}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="text-[13px] text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              {configError ? "Back" : "Sign out"}
            </button>
          </div>
        </div>

        {configError && (
          <div className="mb-10 rounded-2xl bg-amber-50 border border-amber-100 px-6 py-5 text-center">
            <p className="text-amber-800 font-medium">
              Supabase is not configured yet.
            </p>
            <p className="text-amber-600 text-sm mt-1">
              Add your credentials to{" "}
              <code className="font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">
                .env.local
              </code>{" "}
              to enable authentication and payments.
            </p>
          </div>
        )}

        {success && (
          <div className="mb-10 rounded-2xl bg-green-50 border border-green-100 px-6 py-5 text-center">
            <p className="text-green-800 font-medium">
              Welcome to Max! Your subscription is active.
            </p>
            <p className="text-green-600 text-sm mt-1">
              You now have full access to all features.
            </p>
          </div>
        )}

        {canceled && (
          <div className="mb-10 rounded-2xl bg-amber-50 border border-amber-100 px-6 py-5 text-center">
            <p className="text-amber-800 font-medium">
              Payment was canceled.
            </p>
            <p className="text-amber-600 text-sm mt-1">
              No worries — you can subscribe whenever you&apos;re ready.
            </p>
          </div>
        )}

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Choose your plan
          </h1>
          <p className="mt-4 text-muted text-lg">
            Unlock the full power of Max.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <PricingCard
            name="Monthly"
            price="$19"
            period="month"
            priceId={
              process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID ||
              "price_monthly"
            }
            features={[
              "Unlimited AI queries",
              "All integrations",
              "Priority support",
              "Custom workflows",
            ]}
          />
          <PricingCard
            name="Yearly"
            price="$149"
            period="year"
            priceId={
              process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID ||
              "price_yearly"
            }
            popular
            features={[
              "Everything in Monthly",
              "Save $79 per year",
              "Early access to features",
              "Dedicated support",
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
