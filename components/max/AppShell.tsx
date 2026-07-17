"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useMaxAuth } from "@/context/MaxAuthContext";
import { Icon } from "./icons";

const NAV = [
  { href: "/app/today", label: "Today", icon: "today" as const },
  { href: "/app/coach", label: "Coach", icon: "coach" as const },
  { href: "/app/scan", label: "Scan", icon: "scan" as const },
  { href: "/app/explore", label: "Explore", icon: "explore" as const },
  { href: "/app/you", label: "You", icon: "you" as const },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, isPaid, logout } = useMaxAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

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

        {/* User chip */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="hover:bg-mx-surface rounded-mx-md flex w-full items-center gap-3 px-2 py-2 text-left transition"
          >
            <span className="bg-mx-accent flex size-9 items-center justify-center rounded-full text-[13px] font-semibold text-white">
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
          </button>
          {menuOpen ? (
            <div className="border-mx-border bg-mx-card rounded-mx-md absolute bottom-full left-0 mb-2 w-full overflow-hidden border shadow-mx-md">
              <Link
                href="/app/you/settings"
                onClick={() => setMenuOpen(false)}
                className="hover:bg-mx-surface flex items-center gap-2.5 px-3 py-2.5 text-[14px]"
              >
                <Icon name="settings" className="size-4" /> Settings
              </Link>
              <button
                onClick={() => {
                  logout();
                  router.replace("/login");
                }}
                className="hover:bg-mx-surface text-mx-error flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[14px]"
              >
                <Icon name="logout" className="size-4" /> Log out
              </button>
            </div>
          ) : null}
        </div>
      </aside>

      {/* ── Content — phone-width column, centered like the iOS app ──── */}
      <main className="flex-1 pb-24 lg:pb-0">
        <div className="mx-auto w-full max-w-[460px] px-5 py-6">{children}</div>
      </main>

      {/* ── Mobile bottom tabs ──────────────────────────────────────── */}
      <nav className="border-mx-border bg-mx-card/95 fixed inset-x-0 bottom-0 z-30 flex border-t backdrop-blur lg:hidden">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
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
