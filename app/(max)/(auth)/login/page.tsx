"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMaxAuth } from "@/context/MaxAuthContext";
import { GoogleAuthButton } from "@/components/max/GoogleAuthButton";
import { EyeIcon } from "@/components/max/authFields";

// Map an auth failure to a clean, human message (never echo a raw 5xx detail).
function loginErrorMessage(error: unknown): string {
  const res = (error as { response?: { status?: number; data?: { detail?: unknown } } })?.response;
  if (!res) {
    const msg = String((error as { message?: string })?.message || "");
    if (/Network Error|Failed to fetch|timeout/i.test(msg))
      return "Can't reach the server. Check your connection and try again in a moment.";
    return "Could not sign in. Please try again.";
  }
  const status = res.status ?? 0;
  if (status >= 500) return "We're having trouble reaching our servers. Please try again in a moment.";
  const d = res.data?.detail;
  if (typeof d === "string" && d) return d;
  return "Invalid credentials";
}

function LoginForm() {
  const { login, isAuthenticated, bootResolved } = useMaxAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/app/today";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Already signed in → skip the form.
  useEffect(() => {
    if (bootResolved && isAuthenticated) router.replace(next);
  }, [bootResolved, isAuthenticated, next, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setApiError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setApiError(null);
    try {
      await login(identifier.trim(), password);
      router.replace(next);
    } catch (err: unknown) {
      setApiError(loginErrorMessage(err));
      setLoading(false);
    }
  }

  const inputBase =
    "h-14 w-full rounded-[14px] border bg-white px-4 text-[15px] text-mx-ink placeholder:text-[#A0A0A0] outline-none transition";
  const borderFor = (field: string) =>
    apiError ? "border-[#C0452C]" : focused === field ? "border-[#111113]" : "border-[#E2E2E2]";

  return (
    <div>
      <h1 className="text-mx-ink mb-7 text-center text-[22px] tracking-[-0.3px]">welcome back</h1>

      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        {/* Identifier */}
        <input
          className={`${inputBase} ${borderFor("id")}`}
          placeholder="Email or username"
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            setApiError(null);
          }}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="username"
          onFocus={() => setFocused("id")}
          onBlur={() => setFocused(null)}
        />

        {/* Password + eye toggle */}
        <div className={`flex items-center rounded-[14px] border bg-white ${borderFor("pw")}`}>
          <input
            className="h-[54px] flex-1 bg-transparent px-4 text-[15px] text-mx-ink placeholder:text-[#A0A0A0] outline-none"
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setApiError(null);
            }}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="current-password"
            onFocus={() => setFocused("pw")}
            onBlur={() => setFocused(null)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="px-3.5 text-[#6B6B6B]"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <EyeIcon off={showPassword} />
          </button>
        </div>

        {/* Forgot password */}
        <div className="mb-1 mt-2.5 text-right">
          <Link href="/forgot-password" className="text-[13px] font-medium text-[#6B6B6B]">
            Forgot password?
          </Link>
        </div>

        {/* API error */}
        {apiError ? (
          <div className="rounded-[12px] border border-[#F5C6C2] bg-[#FEF2F0] p-3 text-[13px] leading-[18px] text-[#C0452C]">
            {apiError}
          </div>
        ) : null}

        {/* Continue CTA */}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 h-14 w-full rounded-full bg-mx-ink text-[16px] font-semibold tracking-[0.2px] text-white transition disabled:opacity-45"
        >
          {loading ? "Signing in…" : "Continue"}
        </button>
      </form>

      {/* OR divider */}
      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-[#EBEBEB]" />
        <span className="text-[11px] font-medium tracking-[1.2px] text-[#BBBBBB]">OR</span>
        <span className="h-px flex-1 bg-[#EBEBEB]" />
      </div>

      {/* Google */}
      <GoogleAuthButton
        label="Continue with Google"
        onDone={() => router.replace(next)}
        onError={(m) => setApiError(m || null)}
      />

      {/* Create account */}
      <div className="mt-[22px] text-center">
        <Link href="/signup" className="text-[14px] text-[#6B6B6B]">
          New here? <span className="text-mx-ink">create account</span>
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
