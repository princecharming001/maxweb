"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMaxAuth } from "@/context/MaxAuthContext";
import { Button, Field, Input } from "@/components/max/ui";

export default function StartAccountPage() {
  const { claimAccount, isAnonymous, isAuthenticated } = useMaxAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await claimAccount(
        form.email.trim(),
        form.password,
        form.first_name.trim(),
        form.last_name.trim(),
        form.username.trim(),
      );
      router.replace("/start/referral");
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      setError(detail || "Couldn't save your account. Try again.");
      setBusy(false);
    }
  }

  // Only bounce a user who arrived here ALREADY a full account (e.g. hit the
  // URL directly). A claim made on this page (anon → full) must NOT trigger
  // this — the claim's own redirect to /subscribe should win.
  const fullOnMount = useRef<boolean | null>(null);
  useEffect(() => {
    if (fullOnMount.current === null) {
      fullOnMount.current = isAuthenticated && !isAnonymous;
    }
    if (fullOnMount.current) router.replace("/app/today");
  }, [isAuthenticated, isAnonymous, router]);

  return (
    <div className="py-4">
      <h1 className="font-mx-serif text-mx-ink text-[28px] leading-tight">
        Save your plan
      </h1>
      <p className="text-mx-muted mt-1.5 text-[14px]">
        Create an account so you don&apos;t lose your progress.
      </p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name">
            <Input value={form.first_name} onChange={set("first_name")} required />
          </Field>
          <Field label="Last name">
            <Input value={form.last_name} onChange={set("last_name")} required />
          </Field>
        </div>
        <Field label="Username">
          <Input value={form.username} onChange={set("username")} required />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={set("email")}
            required
          />
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          <Input
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={set("password")}
            minLength={8}
            required
          />
        </Field>

        {error ? <p className="text-mx-error text-[13px]">{error}</p> : null}

        <Button type="submit" full size="lg" disabled={busy}>
          {busy ? "Saving…" : "Create account"}
        </Button>
      </form>

      <p className="text-mx-muted mt-5 text-center text-[13px]">
        Already have an account?{" "}
        <Link href="/login" className="text-mx-accent font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
