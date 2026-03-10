"use client";

import { useState, useRef, useEffect, FormEvent } from "react";

const COUNTRY_CODES = [
  { code: "+1", country: "US", label: "USA" },
  { code: "+1", country: "CA", label: "Canada" },
  { code: "+44", country: "GB", label: "UK" },
  { code: "+61", country: "AU", label: "Australia" },
  { code: "+91", country: "IN", label: "India" },
  { code: "+49", country: "DE", label: "Germany" },
  { code: "+33", country: "FR", label: "France" },
  { code: "+81", country: "JP", label: "Japan" },
  { code: "+82", country: "KR", label: "S. Korea" },
  { code: "+55", country: "BR", label: "Brazil" },
  { code: "+52", country: "MX", label: "Mexico" },
  { code: "+86", country: "CN", label: "China" },
  { code: "+234", country: "NG", label: "Nigeria" },
  { code: "+27", country: "ZA", label: "S. Africa" },
  { code: "+971", country: "AE", label: "UAE" },
  { code: "+966", country: "SA", label: "Saudi Arabia" },
  { code: "+65", country: "SG", label: "Singapore" },
  { code: "+64", country: "NZ", label: "New Zealand" },
  { code: "+353", country: "IE", label: "Ireland" },
  { code: "+31", country: "NL", label: "Netherlands" },
  { code: "+39", country: "IT", label: "Italy" },
  { code: "+34", country: "ES", label: "Spain" },
  { code: "+46", country: "SE", label: "Sweden" },
  { code: "+47", country: "NO", label: "Norway" },
  { code: "+48", country: "PL", label: "Poland" },
  { code: "+7", country: "RU", label: "Russia" },
  { code: "+90", country: "TR", label: "Turkey" },
  { code: "+62", country: "ID", label: "Indonesia" },
  { code: "+63", country: "PH", label: "Philippines" },
  { code: "+66", country: "TH", label: "Thailand" },
] as const;

const PHONE_LENGTH: Record<string, { min: number; max: number }> = {
  "+1": { min: 10, max: 10 },
  "+44": { min: 10, max: 10 },
  "+61": { min: 9, max: 9 },
  "+91": { min: 10, max: 10 },
  "+49": { min: 10, max: 11 },
  "+33": { min: 9, max: 9 },
  "+81": { min: 10, max: 10 },
  "+82": { min: 9, max: 10 },
  "+55": { min: 10, max: 11 },
  "+52": { min: 10, max: 10 },
  "+86": { min: 11, max: 11 },
  "+234": { min: 10, max: 10 },
  "+27": { min: 9, max: 9 },
  "+971": { min: 9, max: 9 },
  "+966": { min: 9, max: 9 },
  "+65": { min: 8, max: 8 },
  "+64": { min: 8, max: 10 },
  "+353": { min: 9, max: 9 },
  "+31": { min: 9, max: 9 },
  "+39": { min: 9, max: 10 },
  "+34": { min: 9, max: 9 },
  "+46": { min: 9, max: 9 },
  "+47": { min: 8, max: 8 },
  "+48": { min: 9, max: 9 },
  "+7": { min: 10, max: 10 },
  "+90": { min: 10, max: 10 },
  "+62": { min: 9, max: 12 },
  "+63": { min: 10, max: 10 },
  "+66": { min: 9, max: 9 },
};

function stripNonDigits(value: string) {
  return value.replace(/\D/g, "");
}

function validatePhone(digits: string, countryCode: string): string | null {
  if (!digits) return "Phone number is required";

  const rules = PHONE_LENGTH[countryCode] ?? { min: 7, max: 15 };

  if (digits.length < rules.min || digits.length > rules.max) {
    if (rules.min === rules.max) {
      return `Phone number must be ${rules.min} digits for this country`;
    }
    return `Phone number must be ${rules.min}–${rules.max} digits for this country`;
  }

  return null;
}

export default function WaitlistCTA() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryIdx, setCountryIdx] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = COUNTRY_CODES[countryIdx];

  function handlePhoneChange(value: string) {
    setPhone(stripNonDigits(value));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const phoneError = validatePhone(phone, selected.code);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setSubmitting(true);

    try {
      const fullPhone = `${selected.code}${phone}`;

      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim().toLowerCase(),
          phone: fullPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setShowSuccess(true);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setCountryIdx(0);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section id="waitlist" className="py-24 sm:py-32 px-6">
        <div className="max-w-md mx-auto text-center">
          <div className="w-8 h-px bg-border mx-auto mb-10" />
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            Get early access
          </h2>
          <p className="mt-3 text-muted text-[15px] max-w-xs mx-auto leading-relaxed">
            Join the waitlist. Be first in line when Max starts texting.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-3 text-left">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-[14px] text-foreground placeholder:text-muted/60 outline-none focus:ring-2 focus:ring-accent/30 transition-all"
              />
              <input
                type="text"
                required
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-[14px] text-foreground placeholder:text-muted/60 outline-none focus:ring-2 focus:ring-accent/30 transition-all"
              />
            </div>
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-[14px] text-foreground placeholder:text-muted/60 outline-none focus:ring-2 focus:ring-accent/30 transition-all"
            />

            {/* Phone with country code selector */}
            <div className="relative flex gap-0">
              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 rounded-l-xl border border-r-0 border-border bg-card px-3 py-3 text-[13px] text-foreground hover:bg-background transition-colors h-full whitespace-nowrap"
                >
                  <span>{selected.country}</span>
                  <span className="text-muted">{selected.code}</span>
                  <svg
                    className={`w-3 h-3 text-muted transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute z-50 top-full left-0 mt-1 w-52 max-h-56 overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
                    {COUNTRY_CODES.map((cc, i) => (
                      <button
                        key={`${cc.country}-${cc.code}`}
                        type="button"
                        onClick={() => {
                          setCountryIdx(i);
                          setDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-[13px] hover:bg-background transition-colors ${
                          i === countryIdx
                            ? "text-accent font-medium"
                            : "text-foreground"
                        }`}
                      >
                        <span>
                          {cc.country} — {cc.label}
                        </span>
                        <span className="text-muted">{cc.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input
                type="tel"
                required
                placeholder="Phone number"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="w-full rounded-r-xl border border-border bg-card px-4 py-3 text-[14px] text-foreground placeholder:text-muted/60 outline-none focus:ring-2 focus:ring-accent/30 transition-all"
              />
            </div>

            {error && (
              <p className="text-red-500 text-[13px] text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-foreground text-background px-8 py-3 rounded-full text-[14px] font-medium hover:bg-foreground/85 active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Joining…" : "Join Waitlist"}
            </button>
          </form>
        </div>
      </section>

      {showSuccess && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]"
          onClick={() => setShowSuccess(false)}
        >
          <div
            className="bg-card rounded-2xl shadow-xl p-8 max-w-sm mx-6 text-center animate-[fade-in-up_0.3s_ease-out]"
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
            <h3 className="text-xl font-semibold text-foreground">
              You&apos;re on the waitlist!
            </h3>
            <p className="mt-2 text-muted text-[14px] leading-relaxed">
              We&apos;ll contact you when we release. Stay tuned!
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="mt-6 bg-foreground text-background px-6 py-2.5 rounded-full text-[14px] font-medium hover:bg-foreground/85 active:scale-[0.97] transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
