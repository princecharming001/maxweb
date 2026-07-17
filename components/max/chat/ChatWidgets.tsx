"use client";

/**
 * Inline chat widgets — the web port of the iOS answer-chooser row that sits
 * ABOVE the composer (MaxChatScreen `outerInputContainer`): single/multi choice
 * chips, the numeric slider (ChatSliderInput), the per-max habit picker
 * (ChatHabitPicker), and the schedule-change Yes/No confirm. Values/paddings
 * reproduce the iOS StyleSheets.
 */

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/max/icons";
import { ChatIcon } from "./chatIcons";

/* Chips whose text means "my answer isn't here" — tapping one focuses the
   composer instead of sending the chip. Verbatim from iOS CUSTOM_CHIP_LABELS. */
export const CUSTOM_CHIPS = new Set([
  "something else",
  "other",
  "none of these",
  "type my own",
  "type your own",
]);
export const isCustomChip = (c: string) => CUSTOM_CHIPS.has(c.trim().toLowerCase());

/* ── Widget specs (ChatResponse.input_widget shapes) ─────────────────────── */
export interface SliderSpec {
  type: "slider";
  min: number;
  max: number;
  step: number;
  default: number;
  label: string;
  unit?: string;
}
export interface OfferedHabit {
  id: string;
  label: string;
  area: string;
}
export interface HabitPickerSpec {
  type: "habit_picker";
  maxx_id?: string;
  schedule_id?: string;
  label?: string;
  offered?: OfferedHabit[];
  version?: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/* ── Typing indicator — three bouncing dots on an assistant row ───────────── */
export function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-1.5" aria-label="Max is typing">
      <span className="bg-mx-muted size-1.5 animate-bounce rounded-full [animation-delay:-0.3s]" />
      <span className="bg-mx-muted size-1.5 animate-bounce rounded-full [animation-delay:-0.15s]" />
      <span className="bg-mx-muted size-1.5 animate-bounce rounded-full" />
    </div>
  );
}

/* ── Single-select chips — vertical settings-list rows (iOS quickReplyButton).
   A custom chip renders "something else…" + pencil and focuses the input. ── */
export function SingleSelectChips({
  choices,
  onPick,
}: {
  choices: string[];
  onPick: (label: string) => void;
}) {
  return (
    <div className="mb-2.5 max-h-[226px] space-y-2 overflow-y-auto px-0.5">
      {choices.map((choice) => {
        const custom = isCustomChip(choice);
        return (
          <button
            key={choice}
            onClick={() => onPick(choice)}
            className="border-mx-border bg-mx-card text-mx-ink hover:border-mx-ink/25 shadow-mx-sm rounded-mx-lg flex w-full items-center justify-between gap-2.5 border px-3.5 py-2.5 text-left transition"
          >
            <span className="truncate text-[14px] font-medium">
              {custom ? "something else…" : choice}
            </span>
            {custom ? (
              <ChatIcon name="compose" className="text-mx-muted size-3.5 shrink-0" />
            ) : (
              <Icon name="chevron" className="text-mx-muted size-3.5 shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── Multi-select chips — vertical toggle rows + Submit (iOS multiChoice). ── */
export function MultiSelectChips({
  choices,
  selected,
  onToggle,
  onSubmit,
  onCustomFocus,
}: {
  choices: string[];
  selected: string[];
  onToggle: (label: string) => void;
  onSubmit: () => void;
  onCustomFocus: () => void;
}) {
  const count = selected.length;
  return (
    <div className="mb-2.5 space-y-2 px-0.5">
      <div className="max-h-[186px] space-y-2 overflow-y-auto">
        {choices.map((choice) => {
          const custom = isCustomChip(choice);
          if (custom) {
            return (
              <button
                key={choice}
                onClick={onCustomFocus}
                className="border-mx-border bg-mx-card text-mx-ink hover:border-mx-ink/25 shadow-mx-sm rounded-mx-lg flex w-full items-center gap-2 border px-3.5 py-2.5 text-left transition"
              >
                <ChatIcon name="compose" className="text-mx-muted size-4 shrink-0" />
                <span className="truncate text-[14px] font-medium">something else…</span>
              </button>
            );
          }
          const on = selected.includes(choice);
          return (
            <button
              key={choice}
              onClick={() => onToggle(choice)}
              className={`shadow-mx-sm rounded-mx-lg flex w-full items-center gap-2 border px-3.5 py-2.5 text-left transition ${
                on
                  ? "border-mx-ink bg-mx-surface text-mx-ink"
                  : "border-mx-border bg-mx-card text-mx-ink-2 hover:border-mx-ink/25"
              }`}
            >
              {on ? (
                <span className="bg-mx-ink flex size-4 shrink-0 items-center justify-center rounded-full">
                  <Icon name="check" className="size-3 text-white" />
                </span>
              ) : (
                <span className="border-mx-muted size-4 shrink-0 rounded-full border" />
              )}
              <span className={`truncate text-[14px] ${on ? "font-semibold" : "font-medium"}`}>
                {choice}
              </span>
            </button>
          );
        })}
      </div>
      <button
        disabled={count === 0}
        onClick={onSubmit}
        className={`w-full rounded-full py-2.5 text-[13px] font-semibold tracking-wide transition ${
          count === 0 ? "bg-mx-border text-mx-muted" : "bg-mx-ink text-white"
        }`}
      >
        {count === 0 ? "pick any that apply" : `submit ${count} ${count === 1 ? "pick" : "picks"}`}
      </button>
    </div>
  );
}

/* ── Schedule-change confirm (iOS pendingConfirm Yes/No). ─────────────────── */
export function ConfirmChange({
  onYes,
  onNo,
  busy,
}: {
  onYes: () => void;
  onNo: () => void;
  busy?: boolean;
}) {
  return (
    <div className="mb-2.5 flex gap-2.5 px-0.5">
      <button
        onClick={onYes}
        disabled={busy}
        className="bg-mx-ink rounded-mx-lg flex flex-1 items-center justify-center py-3 text-[15px] font-bold text-white disabled:opacity-50"
      >
        {busy ? (
          <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        ) : (
          "Yes, do it"
        )}
      </button>
      <button
        onClick={onNo}
        disabled={busy}
        className="border-mx-border bg-mx-card text-mx-ink rounded-mx-lg border px-6 py-3 text-[15px] font-semibold disabled:opacity-50"
      >
        No
      </button>
    </div>
  );
}

/* ── Numeric slider (iOS ChatSliderInput). ────────────────────────────────── */
export function SliderInput({
  spec,
  onSubmit,
  disabled,
}: {
  spec: SliderSpec;
  onSubmit: (value: number) => void;
  disabled?: boolean;
}) {
  const initial = clamp(spec.default ?? Math.round((spec.min + spec.max) / 2), spec.min, spec.max);
  const [value, setValue] = useState(initial);
  useEffect(() => {
    setValue(clamp(spec.default ?? Math.round((spec.min + spec.max) / 2), spec.min, spec.max));
  }, [spec.min, spec.max, spec.default]);

  return (
    <div className="border-mx-border bg-mx-card mb-2.5 rounded-2xl border px-4 py-4">
      {spec.label ? (
        <div className="text-mx-muted text-center text-[11px] font-medium uppercase tracking-[0.12em]">
          {spec.label.toLowerCase()}
        </div>
      ) : null}
      <div className="mt-1 flex items-baseline justify-center gap-1.5">
        <span className="font-mx-serif text-mx-ink text-[44px] leading-[50px] tracking-[-1.4px]">
          {value}
        </span>
        {spec.unit ? (
          <span className="text-mx-muted text-[12px] font-medium lowercase tracking-wide">
            {spec.unit}
          </span>
        ) : null}
      </div>
      <input
        type="range"
        min={spec.min}
        max={spec.max}
        step={spec.step}
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(Number(e.target.value))}
        className="mt-2 h-9 w-full cursor-pointer"
        style={{ accentColor: "var(--mx-ink)" }}
      />
      <div className="text-mx-muted flex justify-between px-0.5 text-[11px] opacity-70">
        <span>{spec.min}</span>
        <span>{spec.max}</span>
      </div>
      <div className="mt-2 flex justify-center">
        <button
          onClick={() => onSubmit(value)}
          disabled={disabled}
          className="bg-mx-ink flex min-w-[140px] items-center justify-center gap-1.5 rounded-full py-2.5 text-[13px] font-semibold tracking-wide text-white disabled:opacity-40"
        >
          confirm
          <ChatIcon name="arrowRight" className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ── Habit picker (iOS ChatHabitPicker). ──────────────────────────────────
   v2 payloads carry `offered` (chips built from the user's real schedule),
   grouped by focus area; selecting = keep (want), deselecting = drop (avoid).
   Older payloads without `offered` fall back to two comma-separated fields. */
export function HabitPicker({
  spec,
  onSubmit,
  onSkip,
  disabled,
}: {
  spec: HabitPickerSpec;
  onSubmit: (wanted: string[], avoided: string[]) => void;
  onSkip: () => void;
  disabled?: boolean;
}) {
  const offered = useMemo(() => spec.offered ?? [], [spec.offered]);
  const hasOffered = offered.length > 0;

  // Select model: default all offered selected → "Looks good" keeps everything.
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(offered.map((o) => o.id)),
  );
  useEffect(() => {
    setSelected(new Set(offered.map((o) => o.id)));
  }, [offered]);

  // Fallback (no offered set): free-text want/avoid.
  const [wantedText, setWantedText] = useState("");
  const [avoidedText, setAvoidedText] = useState("");

  const groups = useMemo(() => {
    const order: string[] = [];
    const byArea: Record<string, OfferedHabit[]> = {};
    for (const h of offered) {
      const area = h.area || "Other";
      if (!byArea[area]) {
        byArea[area] = [];
        order.push(area);
      }
      byArea[area].push({ ...h, area });
    }
    return order.map((area) => ({ area, habits: byArea[area] }));
  }, [offered]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const submitOffered = () => {
    const wanted = offered.filter((o) => selected.has(o.id)).map((o) => o.id);
    const avoided = offered.filter((o) => !selected.has(o.id)).map((o) => o.id);
    onSubmit(wanted, avoided);
  };
  const submitText = () =>
    onSubmit(
      wantedText.split(",").map((s) => s.trim()).filter(Boolean),
      avoidedText.split(",").map((s) => s.trim()).filter(Boolean),
    );

  const count = selected.size;

  return (
    <div className="border-mx-border bg-mx-card mb-2.5 space-y-2.5 rounded-2xl border px-4 py-4">
      {spec.label ? (
        <div className="text-mx-ink text-center text-[13px] font-semibold">{spec.label}</div>
      ) : null}

      {hasOffered ? (
        <>
          <div className="text-mx-muted text-center text-[11.5px]">
            Tap to remove any you don&apos;t want
          </div>
          {groups.map((g) => (
            <div key={g.area} className="space-y-1.5">
              <div className="text-mx-muted text-[10px] font-semibold uppercase tracking-[0.12em]">
                {g.area}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {g.habits.map((h) => {
                  const want = selected.has(h.id);
                  return (
                    <button
                      key={h.id}
                      onClick={() => toggle(h.id)}
                      disabled={disabled}
                      className={`flex items-center gap-1 rounded-full border px-3 py-2 text-[13px] font-medium transition ${
                        want
                          ? "bg-mx-ink border-mx-ink text-white"
                          : "bg-mx-surface border-mx-border text-mx-ink"
                      }`}
                    >
                      {want ? <Icon name="check" className="size-3.5" /> : null}
                      {h.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={submitOffered}
              disabled={disabled}
              className="bg-mx-ink flex min-w-[150px] items-center justify-center gap-1.5 rounded-full py-2.5 text-[13.5px] font-semibold tracking-wide text-white disabled:opacity-40"
            >
              {count > 0 ? `Apply ${count}` : "Looks good"}
              <ChatIcon name="arrowRight" className="size-3.5" />
            </button>
            <button onClick={onSkip} className="text-mx-muted py-1 text-[12px] underline">
              Skip for now
            </button>
          </div>
        </>
      ) : (
        <>
          <input
            value={wantedText}
            onChange={(e) => setWantedText(e.target.value)}
            placeholder="Habits you want (comma-separated)"
            className="bg-mx-surface-light text-mx-ink placeholder:text-mx-muted border-mx-border rounded-mx-md w-full border px-3 py-2 text-[13px] outline-none"
          />
          <input
            value={avoidedText}
            onChange={(e) => setAvoidedText(e.target.value)}
            placeholder="Habits to avoid"
            className="bg-mx-surface-light text-mx-ink placeholder:text-mx-muted border-mx-border rounded-mx-md w-full border px-3 py-2 text-[13px] outline-none"
          />
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={submitText}
              disabled={disabled}
              className="bg-mx-ink rounded-full px-6 py-2.5 text-[13px] font-semibold text-white disabled:opacity-40"
            >
              Save
            </button>
            <button onClick={onSkip} className="text-mx-muted text-[12px] underline">
              Skip for now
            </button>
          </div>
        </>
      )}
    </div>
  );
}
