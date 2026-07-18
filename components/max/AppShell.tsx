"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode } from "react";
import { useMaxAuth } from "@/context/MaxAuthContext";
import { Icon } from "./icons";

// Mirrors the iOS tab bar (TabNavigator active config): Home · Planner · Scan
// (elevated center disc) · Explore · Chat. Profile is NOT a tab — it's reached
// via the Home-header avatar and the desktop-sidebar user chip (→ /app/you).
const NAV = [
  { href: "/app/today", label: "Home", icon: "home" as const },
  { href: "/app/planner", label: "Planner", icon: "planner" as const },
  { href: "/app/scan", label: "Scan", icon: "scan" as const },
  { href: "/app/explore", label: "Explore", icon: "explore" as const },
  { href: "/app/coach", label: "Chat", icon: "chat" as const },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, isPaid, logout } = useMaxAuth();
  const router = useRouter();

  const streak = user?.profile?.master_schedule_streak ?? user?.profile?.streak_days ?? 0;
  const initials =
    (user?.first_name?.[0] ?? user?.username?.[0] ?? user?.email?.[0] ?? "M").toUpperCase();
  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.username ||
    "Your account";

  return (
    <div className="min-h-screen lg:flex">
      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <aside className="border-mx-border sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col border-r px-4 py-6 lg:flex">
        <Link href="/app/today" className="px-2">
          <span className="font-mx-serif text-mx-ink text-[30px] leading-none">
            Max
          </span>
        </Link>

        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-mx-md px-3 py-2.5 text-[15px] transition ${
                  active
                    ? "bg-mx-accent-muted text-mx-accent font-medium"
                    : "text-mx-ink-2 hover:bg-mx-surface"
                }`}
              >
                <Icon name={item.icon} className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Streak card */}
        <div className="bg-mx-surface rounded-mx-lg mt-6 flex items-center gap-3 px-3.5 py-3">
          <span className="text-mx-accent">
            <Icon name="flame" className="size-5" />
          </span>
          <div>
            <div className="text-mx-ink text-[17px] font-semibold leading-none">
              {streak}
            </div>
            <div className="text-mx-muted text-[11px]">day streak</div>
          </div>
        </div>

        <div className="mt-auto" />

        {/* User chip → Profile (/app/you). Profile isn't a tab, so this is the
            desktop entry point; the button beside it logs out. */}
        <div className="flex items-center gap-1">
          <Link
            href="/app/you"
            className="hover:bg-mx-surface rounded-mx-md flex min-w-0 flex-1 items-center gap-3 px-2 py-2 text-left transition"
          >
            <span className="bg-mx-ink flex size-9 items-center justify-center rounded-full text-[13px] font-semibold text-white">
              {initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-mx-ink block truncate text-[14px] font-medium">
                {displayName}
              </span>
              <span className="text-mx-muted block text-[11px]">
                {isPaid ? "Pro" : "Free"}
              </span>
            </span>
          </Link>
          <button
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            aria-label="Log out"
            className="hover:bg-mx-surface text-mx-muted hover:text-mx-error rounded-mx-md flex size-9 shrink-0 items-center justify-center transition"
          >
            <Icon name="logout" className="size-[18px]" />
          </button>
        </div>
      </aside>

      {/* ── Content — phone-width column, centered like the iOS app ──── */}
      <main className="flex-1 pb-24 lg:pb-0">
        <div className="mx-auto w-full max-w-[460px] px-5 py-6">{children}</div>
      </main>

      {/* ── Mobile bottom tabs ──────────────────────────────────────── */}
      {/* Center "Scan" is an elevated glass disc that floats above the bar,
          mirroring the iOS ScanCenterButton (no label, soft float shadow). */}
      <nav className="border-mx-border bg-mx-card/95 fixed inset-x-0 bottom-0 z-30 flex items-end border-t pb-[calc(env(safe-area-inset-bottom)+2px)] backdrop-blur lg:hidden">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          if (item.icon === "scan") {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label="Scan"
                className="flex flex-1 items-center justify-center"
              >
                <span
                  className={`-mt-7 flex size-[50px] items-center justify-center rounded-full border border-white/95 shadow-[0_8px_16px_rgba(28,30,38,0.3)] backdrop-blur ${
                    active ? "bg-mx-accent text-white" : "bg-white/75 text-mx-ink"
                  }`}
                >
                  <Icon name="scan" className="size-[22px]" />
                </span>
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] ${
                active ? "text-mx-accent" : "text-mx-muted"
              }`}
            >
              <Icon name={item.icon} className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
