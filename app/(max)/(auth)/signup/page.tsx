"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMaxAuth } from "@/context/MaxAuthContext";
import { GoogleAuthButton } from "@/components/max/GoogleAuthButton";
import { EyeIcon } from "@/components/max/authFields";

function friendlyValidation(items: { loc?: unknown[]; type?: string }[]): {
  message: string;
  field?: string;
} {
  for (const it of items) {
    const loc = Array.isArray(it?.loc) ? it.loc : [];
    const field = String(loc[loc.length - 1] || "").toLowerCase();
    const type = String(it?.type || "");
    if (field === "email") return { message: "Please enter a valid email address.", field: "email" };
    if (field === "password")
      return { message: "Your password needs to be at least 8 characters.", field: "password" };
    if (field === "username")
      return {
        message: type.includes("pattern")
          ? "Usernames can only use letters, numbers, and underscores."
          : "Your username needs to be at least 3 characters.",
        field: "username",
      };
    if (field === "first_name" || field === "name")
      return { message: "Please enter your name.", field: "firstName" };
  }
  return { message: "Please check your details and try again." };
}

export default function SignupPage() {
  const { signup } = useMaxAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const clearErr = (field: string) => {
    setFieldErrors((p) => ({ ...p, [field]: "" }));
    setApiError(null);
  };

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    const msgs: Record<string, string> = {};
    if (!firstName.trim()) msgs.firstName = "Name is required.";
    if (!username.trim()) msgs.username = "Username is required.";
    else if (username.length < 3) msgs.username = "Username needs at least 3 characters.";
    else if (!/^[a-zA-Z0-9_]+$/.test(username)) msgs.username = "Letters, numbers, and underscores only.";
    if (!email.trim()) msgs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) msgs.email = "Enter a valid email address.";
    if (!password) msgs.password = "Password is required.";
    else if (password.length < 8) msgs.password = "Password needs at least 8 characters.";

    setFieldErrors(msgs);
    setApiError(null);
    if (Object.keys(msgs).some((k) => msgs[k])) return;

    setLoading(true);
    try {
      const parts = firstName.trim().split(/\s+/);
      const fn = parts[0] || firstName.trim();
      const ln = parts.slice(1).join(" ") || fn;
      await signup(email.trim(), password, fn, ln, username.trim(), phone.trim() || undefined);
      router.replace("/app/today");
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
      if (Array.isArray(detail) && detail.length) {
        const { message, field } = friendlyValidation(detail);
        if (field) setFieldErrors((p) => ({ ...p, [field]: message }));
        else setApiError(message);
      } else {
        const msg = typeof detail === "string" ? detail : "Could not create account";
        const lower = msg.toLowerCase();
        if (lower.includes("username") && lower.includes("taken"))
          setFieldErrors((p) => ({ ...p, username: "That username is already taken." }));
        else if (lower.includes("email") && lower.includes("registered"))
          setFieldErrors((p) => ({ ...p, email: "That email is already registered." }));
        else setApiError(msg);
      }
      setLoading(false);
    }
  }

  const inputBase =
    "h-14 w-full rounded-[14px] border bg-white px-4 text-[15px] text-mx-ink placeholder:text-[#A0A0A0] outline-none transition";
  const borderFor = (field: string) =>
    fieldErrors[field] ? "border-[#C0452C]" : focused === field ? "border-[#111113]" : "border-[#E2E2E2]";

  return (
    <div>
      <h1 className="text-mx-ink mb-7 text-center text-[22px] font-semibold tracking-[-0.3px]">
        Create your account
      </h1>

      <form onSubmit={handleSignup} className="flex flex-col gap-3">
        {/* Full name */}
        <Field err={fieldErrors.firstName}>
          <input
            className={`${inputBase} ${borderFor("firstName")}`}
            placeholder="Full name"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              clearErr("firstName");
            }}
            autoComplete="name"
            onFocus={() => setFocused("firstName")}
            onBlur={() => setFocused(null)}
          />
        </Field>

        {/* Username */}
        <Field err={fieldErrors.username}>
          <input
            className={`${inputBase} ${borderFor("username")}`}
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              clearErr("username");
            }}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="username"
            onFocus={() => setFocused("username")}
            onBlur={() => setFocused(null)}
          />
        </Field>

        {/* Email */}
        <Field err={fieldErrors.email}>
          <input
            className={`${inputBase} ${borderFor("email")}`}
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearErr("email");
            }}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="email"
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
          />
        </Field>

        {/* Phone — optional */}
        <Field>
          <input
            className={`${inputBase} ${borderFor("phone")}`}
            placeholder="Phone number (optional)"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              clearErr("phone");
            }}
            inputMode="tel"
            autoComplete="tel"
            onFocus={() => setFocused("phone")}
            onBlur={() => setFocused(null)}
          />
        </Field>

        {/* Password + eye toggle */}
        <Field err={fieldErrors.password}>
          <div className={`flex items-center rounded-[14px] border bg-white ${borderFor("password")}`}>
            <input
              className="h-[54px] flex-1 bg-transparent px-4 text-[15px] text-mx-ink placeholder:text-[#A0A0A0] outline-none"
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearErr("password");
              }}
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="new-password"
              onFocus={() => setFocused("password")}
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
        </Field>

        {/* API-level error */}
        {apiError ? (
          <div className="mt-1 rounded-[12px] border border-[#F5C6C2] bg-[#FEF2F0] p-3 text-[13px] leading-[18px] text-[#C0452C]">
            {apiError}
          </div>
        ) : null}

        {/* Continue CTA */}
        <button
          type="submit"
          disabled={loading}
          className="mt-5 h-14 w-full rounded-full bg-mx-ink text-[16px] font-semibold tracking-[0.2px] text-white transition disabled:opacity-45"
        >
          {loading ? "Creating account…" : "Continue"}
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
        onDone={() => router.replace("/app/today")}
        onError={(m) => setApiError(m || null)}
      />

      {/* Terms */}
      <p className="mt-[22px] px-2 text-center text-[12px] leading-[18px] text-[#AAAAAA]">
        By tapping Continue, you agree to our{" "}
        <Link href="/legal/terms" className="text-[#6B6B6B] underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/legal/privacy" className="text-[#6B6B6B] underline">
          Privacy Policy
        </Link>
        .
      </p>

      {/* Sign in link */}
      <div className="mt-[18px] text-center">
        <Link href="/login" className="text-[14px] text-[#6B6B6B]">
          Already have an account? <span className="font-semibold text-mx-ink">Sign in</span>
        </Link>
      </div>
    </div>
  );
}

function Field({ err, children }: { err?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      {children}
      {err ? <span className="ml-1 text-[12px] text-[#C0452C]">{err}</span> : null}
    </div>
  );
}
