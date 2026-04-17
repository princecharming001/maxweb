"use client";

import { useSyncExternalStore, useState, useEffect } from "react";

function subscribe() {
  return () => {};
}

function getSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return (
    new URL(window.location.href).searchParams.get("early_access") === "success"
  );
}

function getServerSnapshot(): boolean {
  return false;
}

export default function EarlyAccessSuccessModal() {
  const showFromUrl = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [dismissed, setDismissed] = useState(false);
  const open = showFromUrl && !dismissed;

  useEffect(() => {
    if (!showFromUrl || typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.delete("early_access");
    url.searchParams.delete("payment_intent");
    url.searchParams.delete("payment_intent_client_secret");
    url.searchParams.delete("redirect_status");
    window.history.replaceState(
      {},
      "",
      url.pathname + (url.search ? url.search : "") + url.hash,
    );
  }, [showFromUrl]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-[fade-in_0.2s_ease-out] px-6"
      onClick={() => setDismissed(true)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-card rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-8 max-w-sm w-full text-center animate-[fade-in-up_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-7 h-7 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold tracking-tight text-foreground">
          You&apos;re in.
        </h3>
        <p className="mt-2 text-muted text-[14px] leading-relaxed">
          Payment received. Your Max early access is active for the next month —
          we&apos;ll email you the moment texts start.
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="mt-6 w-full bg-foreground text-background px-6 py-3 rounded-full text-[14px] font-medium hover:bg-foreground/85 active:scale-[0.97] transition-all cursor-pointer"
        >
          Back to home
        </button>
      </div>
    </div>
  );
}
