"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AuthFormProps {
  mode: "signup" | "login";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      getSupabase();
    } catch {
      setConfigured(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = getSupabase();

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        router.push("/payment");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/payment");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-40%] left-[-20%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-foreground/[0.02] to-transparent blur-3xl" />
        <div className="absolute bottom-[-30%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tl from-foreground/[0.03] to-transparent blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-12">
          <Link
            href="/"
            className="inline-block text-xl font-bold tracking-tighter text-foreground hover:opacity-70 transition-opacity"
          >
            max
          </Link>
        </div>

        <div className="bg-card/80 backdrop-blur-sm border border-border/60 rounded-2xl px-8 py-10 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">
              {mode === "signup" ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-2 text-muted text-[14px]">
              {mode === "signup"
                ? "Start your journey with Max today."
                : "Sign in to continue to Max."}
            </p>
          </div>

          {!configured && (
            <div className="rounded-xl bg-amber-50 border border-amber-100 px-5 py-4 mb-6 text-sm text-amber-700">
              Supabase is not configured yet. Add your credentials to{" "}
              <code className="font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">
                .env.local
              </code>{" "}
              to enable authentication.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-[13px] font-medium text-foreground/70 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-border/80 bg-background text-foreground text-[14px] focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/20 transition-all placeholder:text-muted/50"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-[13px] font-medium text-foreground/70 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-border/80 bg-background text-foreground text-[14px] focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/20 transition-all placeholder:text-muted/50"
                placeholder="At least 6 characters"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !configured}
              className="w-full bg-foreground text-background py-3 rounded-xl text-[14px] font-medium hover:bg-foreground/85 transition-all disabled:opacity-50 cursor-pointer mt-1"
            >
              {loading
                ? mode === "signup"
                  ? "Creating account..."
                  : "Signing in..."
                : mode === "signup"
                  ? "Create Account"
                  : "Sign In"}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-[13px] text-muted">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-foreground font-medium hover:opacity-70 transition-opacity"
              >
                Sign in
              </Link>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-foreground font-medium hover:opacity-70 transition-opacity"
              >
                Sign up
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
