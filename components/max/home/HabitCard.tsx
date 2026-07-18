"use client";

import { Icon } from "@/components/max/icons";
import {
  formatTimeTo12Hour,
  shade,
  type MergedScheduleTask,
} from "./schedule";

/**
 * The iOS Home "GradientHabit" row, ported to the web. Unchecked = white card
 * with an open circle. Checked = the program's brand-colour gradient fill with
 * white text and a filled check. Tapping the card opens the guide sheet; the
 * circle toggles completion (stopping propagation so it never opens the sheet).
 */
export default function HabitCard({
  row,
  done,
  busy,
  onToggle,
  onOpen,
}: {
  row: MergedScheduleTask;
  done: boolean;
  busy: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const c = /^#/.test(row.moduleColor || "") ? row.moduleColor : "#8E8E93";
  const txt = done ? "#FFFFFF" : "#111113";
  const sub = done ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.45)";

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={row.title}
      className="shadow-mx-md rounded-mx-xl relative mb-3 flex min-h-[88px] w-full items-center gap-4 overflow-hidden px-4 py-[18px] text-left"
      style={
        done
          ? { backgroundImage: `linear-gradient(135deg, ${shade(c, 0.3)}, ${c}, ${shade(c, -0.14)})` }
          : { backgroundColor: "#FFFFFF" }
      }
    >
      {done ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to bottom right, rgba(255,255,255,0.22), rgba(255,255,255,0) 70%)",
          }}
        />
      ) : null}

      {/* Checkbox — separate hit target, never bubbles to the card */}
      <span
        role="checkbox"
        aria-checked={done}
        aria-disabled={busy}
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          if (!busy) onToggle();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            if (!busy) onToggle();
          }
        }}
        className="relative z-10 flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full"
        style={
          done
            ? { backgroundColor: "rgba(255,255,255,0.28)" }
            : { border: "2px solid rgba(0,0,0,0.18)" }
        }
      >
        {done ? (
          <span style={{ color: c }}>
            <Icon name="check" className="size-5" />
          </span>
        ) : null}
      </span>

      <span className="relative z-10 min-w-0 flex-1">
        <span
          className="font-mx-sans block truncate text-[17px] font-semibold tracking-[-0.01em]"
          style={{ color: txt }}
        >
          {row.title}
        </span>
        <span className="mt-[3px] block truncate text-[13.5px]" style={{ color: sub }}>
          {row.moduleLabel || formatTimeTo12Hour(row.time)}
        </span>
      </span>
    </button>
  );
}
