"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/max/api";
import { Button, Field, Input } from "@/components/max/ui";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "confirm">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.requestPasswordResetSms(phone.trim());
      setNote("We texted you a reset code.");
      setStep("confirm");
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      setError(detail || "Couldn't send a code. Check the number.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmReset(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.confirmPasswordResetSms(phone.trim(), code.trim(), password);
      router.replace("/login");
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail;
      setError(detail || "That code didn't work. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="font-mx-serif text-mx-ink text-[28px] leading-tight">
        Reset password
      </h1>
      <p className="text-mx-muted mt-1 text-[14px]">
        We reset via SMS to the phone on your account.
      </p>

      {step === "phone" ? (
        <form onSubmit={requestCode} className="mt-7 space-y-4">
          <Field label="Phone number">
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 555 5555"
              required
            />
          </Field>
          {error ? <p className="text-mx-error text-[13px]">{error}</p> : null}
          <Button type="submit" full size="lg" disabled={busy}>
            {busy ? "Sending…" : "Send reset code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={confirmReset} className="mt-7 space-y-4">
          {note ? <p className="text-mx-success text-[13px]">{note}</p> : null}
          <Field label="Reset code">
            <Input value={code} onChange={(e) => setCode(e.target.value)} required />
          </Field>
          <Field label="New password" hint="At least 8 characters.">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </Field>
          {error ? <p className="text-mx-error text-[13px]">{error}</p> : null}
          <Button type="submit" full size="lg" disabled={busy}>
            {busy ? "Resetting…" : "Reset password"}
          </Button>
        </form>
      )}

      <div className="mt-5 text-center text-[13px]">
        <Link href="/login" className="text-mx-muted hover:text-mx-ink">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
