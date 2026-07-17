"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMaxAuth } from "@/context/MaxAuthContext";
import { Button, Field, Input } from "@/components/max/ui";

function LoginForm() {
  const { login, isAuthenticated, bootResolved } = useMaxAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/app/today";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already signed in → skip the form.
  useEffect(() => {
    if (bootResolved && isAuthenticated) router.replace(next);
  }, [bootResolved, isAuthenticated, next, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(identifier.trim(), password);
      router.replace(next);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      setError(detail || "Couldn't sign in. Check your details and try again.");
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="font-mx-serif text-mx-ink text-[28px] leading-tight">
        Welcome back
      </h1>
      <p className="text-mx-muted mt-1 text-[14px]">
        Sign in to pick up your plan.
      </p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <Field label="Email, username, or phone">
          <Input
            type="text"
            autoComplete="username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </Field>

        {error ? (
          <p className="text-mx-error text-[13px]">{error}</p>
        ) : null}

        <Button type="submit" full size="lg" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="mt-5 flex items-center justify-between text-[13px]">
        <Link href="/forgot-password" className="text-mx-muted hover:text-mx-ink">
          Forgot password?
        </Link>
        <Link href="/start" className="text-mx-accent font-medium">
          Create account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
