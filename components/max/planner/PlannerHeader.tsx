"use client";

/**
 * Planner top bar — a white "Today" pill (jumps the strip back to today) plus
 * four circular white icon buttons, mirroring the iOS reference. On iOS these
 * open sheets (Google Calendar, the usual-day editor, commitments). Those sheets
 * aren't ported to the web yet, so only the chat bubble is wired — it routes to
 * the coach chat, the web's "ask Max". The rest are faithful visual chrome.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { CalendarIcon, RepeatIcon, ChatIcon, PlusIcon } from "./icons";

const CHIP =
  "flex size-10 items-center justify-center rounded-full border border-mx-border bg-mx-card text-mx-ink shadow-mx-sm transition hover:bg-mx-surface";

function IconButton({
  label,
  href,
  children,
}: {
  label: string;
  href?: string;
  children: ReactNode;
}) {
  if (href) {
    return (
      <Link href={href} aria-label={label} className={CHIP}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" aria-label={label} className={CHIP}>
      {children}
    </button>
  );
}

export default function PlannerHeader({ onToday }: { onToday: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={onToday}
        className="inline-flex h-10 items-center rounded-full border border-mx-border bg-mx-card px-[18px] text-[14.5px] font-semibold text-mx-ink shadow-mx-sm transition hover:bg-mx-surface"
      >
        Today
      </button>
      <div className="flex items-center gap-2">
        <IconButton label="Calendar">
          <CalendarIcon />
        </IconButton>
        <IconButton label="Your usual day">
          <RepeatIcon />
        </IconButton>
        <IconButton label="Ask Max" href="/app/coach">
          <ChatIcon />
        </IconButton>
        <IconButton label="Commitments">
          <PlusIcon />
        </IconButton>
      </div>
    </div>
  );
}
