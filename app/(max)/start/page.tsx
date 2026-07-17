"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMaxAuth } from "@/context/MaxAuthContext";
import { Button } from "@/components/max/ui";

export default function StartPage() {
  const { startAnon } = useMaxAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function begin() {
    setBusy(true);
    setError(null);
    try {
      await startAnon();
      router.push("/start/scan");
    } catch {
      setError("Couldn't start — the server may be waking up. Try again.");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
      <h1 className="font-mx-serif text-mx-ink text-[46px] leading-[1.04] tracking-[-1.5px]">
        Your looks,
        <br />
        maxed.
      </h1>
      <p className="mt-4 max-w-[340px] text-[15px] leading-relaxed text-[#6b6b6b]">
        Scan your face. Get your plan. Glow up.
      </p>

      <div className="mt-9 w-full max-w-[320px]">
        <Button full size="lg" onClick={begin} disabled={busy}>
          {busy ? "Setting up…" : "Get started"}
        </Button>
      </div>

      {error ? <p className="text-mx-error mt-3 text-[13px]">{error}</p> : null}

      <p className="text-mx-muted mt-6 text-[13px]">
        Already have an account?{" "}
        <Link href="/login" className="text-mx-accent font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
