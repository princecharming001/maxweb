"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMaxAuth } from "@/context/MaxAuthContext";
import { Button, Spinner } from "@/components/max/ui";

export default function SubscribeSuccessPage() {
  const { refreshUser } = useMaxAuth();
  const router = useRouter();
  const [state, setState] = useState<"polling" | "active" | "pending">("polling");
  const startRef = useRef(0);

  // Poll for the webhook to flip is_paid (Stripe fulfillment is async).
  useEffect(() => {
    let active = true;
    startRef.current = performance.now();
    async function poll() {
      if (!active) return;
      try {
        const me = await refreshUser();
        if (me.is_paid) {
          setState("active");
          setTimeout(() => router.replace("/app/today"), 1500);
          return;
        }
      } catch {
        /* keep polling */
      }
      if (performance.now() - startRef.current > 30_000) {
        setState("pending");
        return;
      }
      if (active) setTimeout(poll, 2500);
    }
    poll();
    return () => {
      active = false;
    };
  }, [refreshUser, router]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[420px] flex-col items-center justify-center px-5 text-center">
      {state === "polling" ? (
        <>
          <Spinner className="size-8" />
          <div className="font-mx-serif text-mx-ink mt-6 text-[24px]">
            Activating your subscription
          </div>
          <p className="text-mx-muted mt-2 text-[14px]">
            Payment received — setting up your access.
          </p>
        </>
      ) : state === "active" ? (
        <>
          <div className="bg-mx-success/15 text-mx-success flex size-16 items-center justify-center rounded-full">
            <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5 10 17l9-10" />
            </svg>
          </div>
          <div className="font-mx-serif text-mx-ink mt-6 text-[28px]">
            You&apos;re Pro
          </div>
          <p className="text-mx-muted mt-2 text-[14px]">Taking you to your plan…</p>
        </>
      ) : (
        <>
          <div className="font-mx-serif text-mx-ink text-[24px]">
            Almost there
          </div>
          <p className="text-mx-muted mt-2 text-[14px]">
            Your payment went through — activation can take a minute. Head to
            your plan and it&apos;ll be ready shortly.
          </p>
          <Button className="mt-5" onClick={() => router.replace("/app/today")}>
            Go to my plan
          </Button>
        </>
      )}
    </div>
  );
}
