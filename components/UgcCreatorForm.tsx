"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

const PLATFORMS = [
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "facebook", label: "Facebook" },
  { value: "other", label: "Other" },
] as const;

/** Stored values must match API + DB */
const VIDEOS_PER_WEEK_RANGES = [
  { value: "1-2", label: "1–2 videos" },
  { value: "3-5", label: "3–5 videos" },
  { value: "6-10", label: "6–10 videos" },
  { value: "11-15", label: "11–15 videos" },
  { value: "16+", label: "16+ videos" },
] as const;

const PHONE_RE = /^\+\d{1,4}\d{7,15}$/;

export default function UgcCreatorForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [primaryPlatform, setPrimaryPlatform] = useState("tiktok");
  const [videosPerWeek, setVideosPerWeek] = useState("3-5");
  const [socialHandle, setSocialHandle] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [experienceNotes, setExperienceNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (phone.trim() && !PHONE_RE.test(phone.trim())) {
      setError(
        "Phone must include country code (e.g. +14155551234), or leave blank."
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/ugc-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          primary_platform: primaryPlatform,
          videos_per_week: videosPerWeek,
          social_handle: socialHandle.trim(),
          portfolio_url: portfolioUrl.trim() || undefined,
          experience_notes: experienceNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setSuccess(true);
      setFullName("");
      setEmail("");
      setPhone("");
      setPrimaryPlatform("tiktok");
      setVideosPerWeek("3-5");
      setSocialHandle("");
      setPortfolioUrl("");
      setExperienceNotes("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 md:p-10 shadow-sm text-center max-w-lg mx-auto">
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
        <h2 className="text-xl font-semibold text-foreground">
          Application received
        </h2>
        <p className="mt-2 text-muted text-[15px] leading-relaxed">
          Thanks for applying. If it&apos;s a fit, we&apos;ll reach out by email.
        </p>
        <Link
          href="/"
          className="inline-block mt-8 bg-foreground text-background px-6 py-2.5 rounded-full text-[14px] font-medium hover:bg-foreground/85 transition-colors"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-8 md:p-10 shadow-sm max-w-lg mx-auto space-y-4 text-left"
    >
      <div>
        <label
          htmlFor="ugc-full-name"
          className="block text-[13px] font-medium text-foreground mb-1.5"
        >
          Full name
        </label>
        <input
          id="ugc-full-name"
          type="text"
          required
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-[14px] text-foreground placeholder:text-muted/60 outline-none focus:ring-2 focus:ring-accent/30 transition-all"
          placeholder="Jane Creator"
        />
      </div>

      <div>
        <label
          htmlFor="ugc-email"
          className="block text-[13px] font-medium text-foreground mb-1.5"
        >
          Email
        </label>
        <input
          id="ugc-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-[14px] text-foreground placeholder:text-muted/60 outline-none focus:ring-2 focus:ring-accent/30 transition-all"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="ugc-phone"
          className="block text-[13px] font-medium text-foreground mb-1.5"
        >
          Phone <span className="text-muted font-normal">(optional)</span>
        </label>
        <input
          id="ugc-phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-[14px] text-foreground placeholder:text-muted/60 outline-none focus:ring-2 focus:ring-accent/30 transition-all"
          placeholder="+1 415 555 1234"
        />
        <p className="mt-1 text-[12px] text-muted">
          Include country code (e.g. +1 for US).
        </p>
      </div>

      <div>
        <label
          htmlFor="ugc-platform"
          className="block text-[13px] font-medium text-foreground mb-1.5"
        >
          Primary platform
        </label>
        <select
          id="ugc-platform"
          required
          value={primaryPlatform}
          onChange={(e) => setPrimaryPlatform(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-[14px] text-foreground outline-none focus:ring-2 focus:ring-accent/30 transition-all"
        >
          {PLATFORMS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="ugc-videos-per-week"
          className="block text-[13px] font-medium text-foreground mb-1.5"
        >
          How many videos can you deliver per week?
        </label>
        <select
          id="ugc-videos-per-week"
          required
          value={videosPerWeek}
          onChange={(e) => setVideosPerWeek(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-[14px] text-foreground outline-none focus:ring-2 focus:ring-accent/30 transition-all"
        >
          {VIDEOS_PER_WEEK_RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="ugc-handle"
          className="block text-[13px] font-medium text-foreground mb-1.5"
        >
          Main social handle or profile URL
        </label>
        <input
          id="ugc-handle"
          type="text"
          required
          value={socialHandle}
          onChange={(e) => setSocialHandle(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-[14px] text-foreground placeholder:text-muted/60 outline-none focus:ring-2 focus:ring-accent/30 transition-all"
          placeholder="@yourhandle or full profile link"
        />
      </div>

      <div>
        <label
          htmlFor="ugc-portfolio"
          className="block text-[13px] font-medium text-foreground mb-1.5"
        >
          Portfolio or sample link{" "}
          <span className="text-muted font-normal">(optional)</span>
        </label>
        <input
          id="ugc-portfolio"
          type="url"
          value={portfolioUrl}
          onChange={(e) => setPortfolioUrl(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-[14px] text-foreground placeholder:text-muted/60 outline-none focus:ring-2 focus:ring-accent/30 transition-all"
          placeholder="https://"
        />
      </div>

      <div>
        <label
          htmlFor="ugc-notes"
          className="block text-[13px] font-medium text-foreground mb-1.5"
        >
          Experience &amp; why Max{" "}
          <span className="text-muted font-normal">(optional)</span>
        </label>
        <textarea
          id="ugc-notes"
          rows={4}
          value={experienceNotes}
          onChange={(e) => setExperienceNotes(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-[14px] text-foreground placeholder:text-muted/60 outline-none focus:ring-2 focus:ring-accent/30 transition-all resize-y min-h-[100px]"
          placeholder="Brief UGC experience, niche, and what you would like to create for Max."
        />
      </div>

      {error && (
        <p className="text-red-600 text-[13px]" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-foreground text-background px-8 py-3 rounded-full text-[14px] font-medium hover:bg-foreground/85 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {submitting ? "Submitting…" : "Submit Application"}
      </button>
    </form>
  );
}
