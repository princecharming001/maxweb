"use client";

import { useCallback, useRef, useState } from "react";
import { useMaxAuth } from "@/context/MaxAuthContext";

/**
 * "Continue with Google" — web port of the native GoogleSignInButton used on the
 * iOS Login/Signup screens. Real Sign-In-With-Google credential flow, gated on a
 * NEXT_PUBLIC_GOOGLE_CLIENT_ID; degrades to an inline note when unconfigured so
 * the button always renders (visual parity) and never throws.
 */

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

interface GsiId {
  initialize: (opts: {
    client_id: string;
    callback: (resp: { credential?: string }) => void;
  }) => void;
  prompt: () => void;
}
declare global {
  interface Window {
    google?: { accounts?: { id?: GsiId } };
  }
}

function loadGis(): Promise<GsiId> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("no window"));
    const ready = () => {
      const id = window.google?.accounts?.id;
      if (id) resolve(id);
      else reject(new Error("Google Identity unavailable"));
    };
    if (window.google?.accounts?.id) return ready();
    const existing = document.getElementById("gsi-client");
    if (existing) {
      existing.addEventListener("load", ready);
      existing.addEventListener("error", () => reject(new Error("load failed")));
      return;
    }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.id = "gsi-client";
    s.async = true;
    s.defer = true;
    s.onload = ready;
    s.onerror = () => reject(new Error("Failed to load Google"));
    document.head.appendChild(s);
  });
}

export function GoogleAuthButton({
  label,
  onDone,
  onError,
}: {
  label: string;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const { signInWithGoogle } = useMaxAuth();
  const [busy, setBusy] = useState(false);
  const inited = useRef(false);

  const handleClick = useCallback(async () => {
    if (!CLIENT_ID) {
      onError("Google sign-in isn't available right now.");
      return;
    }
    onError("");
    setBusy(true);
    try {
      const gsi = await loadGis();
      if (!inited.current) {
        gsi.initialize({
          client_id: CLIENT_ID,
          callback: (resp) => {
            void (async () => {
              try {
                if (!resp?.credential) throw new Error("No credential");
                await signInWithGoogle(resp.credential);
                onDone();
              } catch {
                onError("Google sign-in didn't complete. Try again.");
              } finally {
                setBusy(false);
              }
            })();
          },
        });
        inited.current = true;
      }
      gsi.prompt();
    } catch {
      onError("Couldn't start Google sign-in.");
    } finally {
      // The credential arrives via the async callback above; release the click
      // spinner once the prompt has been shown.
      setBusy(false);
    }
  }, [onDone, onError, signInWithGoogle]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="flex h-[54px] w-full items-center justify-center gap-2.5 rounded-full border border-[#E2E2E2] bg-white text-[15px] font-semibold tracking-[0.3px] text-mx-ink transition hover:bg-[#FAFAFA] disabled:opacity-60"
      aria-label={label}
    >
      <GoogleGlyph />
      {busy ? "Connecting…" : label}
    </button>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 18 18" className="size-[18px]" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}
