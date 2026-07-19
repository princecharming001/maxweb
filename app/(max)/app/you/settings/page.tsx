"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/max/api";
import { useMaxAuth } from "@/context/MaxAuthContext";
import SubPageHeader from "@/components/max/SubPageHeader";
import { Button, Input } from "@/components/max/ui";
import { Icon } from "@/components/max/icons";

/** Canonical support contact — mirrors iOS legalConstants.LEGAL_SUPPORT_EMAIL. */
const SUPPORT_EMAIL = "mog.max123@gmail.com";

/** Same set + order as iOS LEGAL_ROWS. */
const LEGAL_ROWS = [
  { href: "/legal/privacy", label: "Privacy policy" },
  { href: "/legal/terms", label: "Terms of service" },
  { href: "/legal/community-guidelines", label: "Community guidelines" },
  { href: "/legal/cookies", label: "Cookie notice" },
];

/** Settings — mirrors iOS SettingsScreen: borderless sections (label + rows
 *  with hairline dividers, no cards), serif header, version footer. Coaching
 *  tone + response length intentionally live in the chat drawer, not here.
 *  "Rate us on the App Store" is iOS-only and stays off the web build. */
export default function SettingsPage() {
  const { user, isPaid, logout, deleteAccount } = useMaxAuth();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const isOAuth = !!user?.auth_provider && user.auth_provider !== "password";

  const googleQ = useQuery({
    queryKey: ["googleStatus"],
    queryFn: () => api.getGoogleStatus(),
    staleTime: 60_000,
  });
  const showCalendar = googleQ.data?.calendar_link_enabled === true;

  function confirmSignOut() {
    // iOS uses window.confirm on its web build for the same dialog.
    if (window.confirm("Sign out?")) {
      logout();
      router.replace("/login");
    }
  }

  async function doDelete() {
    // Google/OAuth accounts have no password — authorize via session instead.
    if (!isOAuth && !password.trim()) {
      alert("Enter your password to delete your account.");
      return;
    }
    setBusy(true);
    try {
      await deleteAccount(isOAuth ? undefined : password.trim());
      setPassword("");
      setConfirming(false);
      router.replace("/");
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      alert(detail || "Could not delete account");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-[460px]">
      <SubPageHeader title="Settings" />

      {/* ── Membership ─────────────────────────────────────────── */}
      {isPaid ? (
        <Group title="Membership">
          <LinkRow href="/app/you/subscription" label="Manage subscription" hint="Manage your plan" />
        </Group>
      ) : null}

      {/* ── Coaching ───────────────────────────────────────────── */}
      <Group title="Coaching">
        <LinkRow href="/app/you/lifestyle" label="Edit lifestyle" hint="Your goals & habits" />
        <LinkRow href="/app/you/products" label="My products" />
        {showCalendar ? (
          <LinkRow
            href="/app/you/settings"
            label="Google Calendar"
            hint={googleQ.data?.connected ? "Connected" : "Link your calendar"}
          />
        ) : null}
      </Group>

      {/* ── Profile ────────────────────────────────────────────── */}
      <Group title="Profile">
        <LinkRow href="/app/you/personal" label="Edit personal info" />
      </Group>

      {/* ── Support ────────────────────────────────────────────── */}
      <Group title="Support">
        <a
          href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Max support")}`}
          className="transition-opacity hover:opacity-60"
        >
          <RowShell
            label="Contact support"
            hint={SUPPORT_EMAIL}
            trailing={
              /* open-outline equivalent, 14px at 40% like iOS */
              <svg
                viewBox="0 0 24 24"
                className="text-mx-muted size-3.5 shrink-0 opacity-40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 4h6v6M20 4l-9 9M18 13v6a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 19V8a1.5 1.5 0 0 1 1.5-1.5H11" />
              </svg>
            }
          />
        </a>
        {LEGAL_ROWS.map((row) => (
          <LinkRow key={row.href} href={row.href} label={row.label} />
        ))}
      </Group>

      {/* ── Account & Data ─────────────────────────────────────── */}
      <Group title="Account & Data">
        <button type="button" onClick={confirmSignOut} className="w-full text-left transition-opacity hover:opacity-60">
          {/* iOS: secondary ink, no chevron / no icon */}
          <RowShell label="Sign out" labelClassName="text-mx-ink-2" trailing={null} />
        </button>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="w-full text-left transition-opacity hover:opacity-60"
        >
          <RowShell
            label="Delete account"
            hint="Permanently erase your account and data"
            labelClassName="text-[#D7263D]"
            trailing={<Icon name="trash" className="size-4 shrink-0 text-[#D7263D] opacity-70" />}
          />
        </button>
      </Group>

      {/* Version footer — iOS shows `v{version} ({build})` */}
      <p className="text-mx-muted mt-12 text-center text-[11px] tracking-[0.3px] opacity-45">v0.1.0 · web</p>
      <div className="h-10" />

      {/* ── Delete modal ───────────────────────────────────────── */}
      {confirming ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirming(false)} />
          <div className="bg-mx-card border-mx-border shadow-mx-sm relative w-full max-w-[380px] rounded-mx-xl border p-8">
            <p className="font-mx-serif text-mx-ink text-[20px]">Delete account</p>
            <p className="text-mx-ink-2 mt-2 text-[14px] leading-5">
              This permanently removes your account and all personal data. This cannot be undone.
            </p>
            {!isOAuth ? (
              <div className="mt-6">
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={busy}
                  autoCapitalize="none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void doDelete();
                  }}
                />
              </div>
            ) : null}
            <div className="mt-8 flex items-center justify-end gap-4">
              <Button variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={busy}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={() => void doDelete()} disabled={busy}>
                {busy ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ── Primitives — iOS parity: no cards, label + rows + hairline dividers ── */

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <div className="mx-label mb-1">{title}</div>
      {children}
    </section>
  );
}

/** Row body: 15px label + 12px hint, hairline bottom divider, default 16px
 *  chevron at 40% — matches iOS `st.row` exactly. */
function RowShell({
  label,
  hint,
  trailing,
  labelClassName = "text-mx-ink",
}: {
  label: string;
  hint?: string;
  trailing?: React.ReactNode;
  labelClassName?: string;
}) {
  return (
    <div className="border-mx-border-light flex items-center border-b py-[15px]">
      <div className="min-w-0 flex-1">
        <div className={`text-[15px] ${labelClassName}`}>{label}</div>
        {hint ? <div className="text-mx-muted mt-[2px] text-[12px]">{hint}</div> : null}
      </div>
      {trailing === undefined ? (
        <Icon name="chevron" className="text-mx-muted size-4 shrink-0 opacity-40" />
      ) : (
        trailing
      )}
    </div>
  );
}

function LinkRow({ href, label, hint }: { href: string; label: string; hint?: string }) {
  return (
    <Link href={href} className="block transition-opacity hover:opacity-60">
      <RowShell label={label} hint={hint} />
    </Link>
  );
}
