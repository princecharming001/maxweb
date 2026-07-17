"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMaxAuth } from "@/context/MaxAuthContext";
import api from "@/lib/max/api";
import {
  SHOWER_TIMES,
  WEEKENDS,
  WORK_LOCATIONS,
  clearAnswers,
  loadAnswers,
  saveAnswers,
} from "@/lib/max/onboarding";

function fmt12(hhmm: string): string {
  const m = hhmm.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return hhmm;
  let h = parseInt(m[1], 10);
  const min = m[2];
  const s = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${min} ${s}`;
}

interface State {
  wake: string;
  getReady: string;
  windDown: string;
  works: boolean;
  workStart: string;
  workEnd: string;
  workLocation: string;
  commute: number;
  breakfast: string;
  lunch: string;
  dinner: string;
  skipBreakfast: boolean;
  skipLunch: boolean;
  skipDinner: boolean;
  workout: string;
  weekend: string;
  shower: string;
}

const DEFAULTS: State = {
  wake: "07:00",
  getReady: "07:15",
  windDown: "22:00",
  works: true,
  workStart: "09:00",
  workEnd: "17:00",
  workLocation: "office",
  commute: 20,
  breakfast: "08:00",
  lunch: "12:30",
  dinner: "19:00",
  skipBreakfast: false,
  skipLunch: false,
  skipDinner: false,
  workout: "18:00",
  weekend: "sleep_in",
  shower: "morning",
};

// Steps that exist unconditionally; "where you work" is inserted when works.
type StepId =
  | "day"
  | "work"
  | "where"
  | "meals"
  | "workout"
  | "weekends"
  | "shower"
  | "recap";

export default function SchedulePage() {
  const router = useRouter();
  const { isAuthenticated, bootResolved, chooseFreeTier, isPaid } = useMaxAuth();
  const [s, setS] = useState<State>(DEFAULTS);
  const [idx, setIdx] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const a = loadAnswers();
    if (a.schedule) setS({ ...DEFAULTS, ...(a.schedule as Partial<State>) });
  }, []);
  useEffect(() => {
    if (bootResolved && !isAuthenticated) router.replace("/start");
  }, [bootResolved, isAuthenticated, router]);

  const steps: StepId[] = useMemo(
    () =>
      (
        ["day", "work", "where", "meals", "workout", "weekends", "shower", "recap"] as StepId[]
      ).filter((id) => id !== "where" || s.works),
    [s.works],
  );
  const step = steps[idx];
  const progress = ((idx + 1) / steps.length) * 100;

  function set<K extends keyof State>(k: K, v: State[K]) {
    setS((prev) => {
      const next = { ...prev, [k]: v };
      saveAnswers({ ...loadAnswers(), schedule: next });
      return next;
    });
  }

  function next() {
    if (idx < steps.length - 1) setIdx(idx + 1);
    else finish();
  }
  function back() {
    if (idx > 0) setIdx(idx - 1);
    else router.replace("/subscribe?funnel=1");
  }

  async function finish() {
    setSaving(true);
    const a = loadAnswers();
    const payload: Record<string, unknown> = {
      goals: a.goals ?? [],
      gender: a.gender,
      intensity_preference: a.intensity_preference,
      motivation: a.motivation,
      wake_time: s.wake,
      sleep_time: s.windDown,
      shower_time: s.shower,
      work_schedule: s.works ? "fixed" : "flexible",
      work_start: s.works ? s.workStart : undefined,
      work_end: s.works ? s.workEnd : undefined,
      work_location: s.works ? s.workLocation : undefined,
      commute_minutes: s.works && s.workLocation !== "home" ? s.commute : undefined,
      breakfast_time: s.skipBreakfast ? undefined : s.breakfast,
      lunch_time: s.skipLunch ? undefined : s.lunch,
      dinner_time: s.skipDinner ? undefined : s.dinner,
      meals_skipped: [
        s.skipBreakfast && "breakfast",
        s.skipLunch && "lunch",
        s.skipDinner && "dinner",
      ].filter(Boolean),
      unit_system: "imperial",
      completed: true,
    };
    try {
      await api.saveOnboarding(payload).catch(() => undefined);
      // If they never paid, browse-only free tier lets them into the app.
      if (!isPaid) chooseFreeTier();
    } finally {
      clearAnswers();
      router.replace("/app/today");
    }
  }

  const recap = useMemo(() => {
    const rows: [string, string][] = [
      ["Wake", fmt12(s.wake)],
      ["Get ready", fmt12(s.getReady)],
    ];
    if (s.works) rows.push(["Work", `${fmt12(s.workStart)} – ${fmt12(s.workEnd)}`]);
    if (!s.skipBreakfast) rows.push(["Breakfast", fmt12(s.breakfast)]);
    rows.push(["Workout", fmt12(s.workout)]);
    if (!s.skipLunch) rows.push(["Lunch", fmt12(s.lunch)]);
    if (!s.skipDinner) rows.push(["Dinner", fmt12(s.dinner)]);
    rows.push(["Wind down", fmt12(s.windDown)]);
    return rows.sort((a, b) => {
      const t = (x: string) => {
        const m = x.match(/(\d+):(\d+)\s*(AM|PM)/);
        if (!m) return 0;
        let h = parseInt(m[1]) % 12;
        if (m[3] === "PM") h += 12;
        return h * 60 + parseInt(m[2]);
      };
      return t(a[1]) - t(b[1]);
    });
  }, [s]);

  const META: Record<StepId, { title: string; sub: string }> = {
    day: { title: "The shape of\nyour day", sub: "Max builds around your real hours, not over them." },
    work: { title: "Work or\nschool?", sub: "So nothing ever gets scheduled over it." },
    where: { title: "Where do\nyou work?", sub: "Your commute becomes real protected time, not a guess." },
    meals: { title: "When do\nyou eat?", sub: "Max keeps your routines clear of the meals you keep." },
    workout: { title: "When do you\nwork out?", sub: "So things land when they actually happen." },
    weekends: { title: "Weekends?", sub: "Do you keep the same schedule, or shift things later?" },
    shower: { title: "When do you\nusually shower?", sub: "So Max anchors your skin and hygiene routines at the right time." },
    recap: { title: "Here's\nyour day", sub: "Max fits your routines into the gaps. You can drag any of this later in Plan." },
  };

  return (
    <div className="flex min-h-[86vh] flex-col">
      <div className="flex items-center gap-3 pt-2">
        <button onClick={back} className="text-mx-muted hover:text-mx-ink text-[14px]">
          Back
        </button>
        <div className="bg-mx-surface h-1.5 flex-1 overflow-hidden rounded-full">
          <div className="bg-mx-ink h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-mx-muted text-[12px]">
          {idx + 1}/{steps.length}
        </span>
      </div>

      <div className="mt-12 flex-1">
        <h1 className="font-mx-serif text-mx-ink text-center text-[30px] leading-[1.15] whitespace-pre-line">
          {META[step].title}
        </h1>
        <p className="text-mx-muted mt-2.5 text-center text-[14px]">{META[step].sub}</p>

        <div className="mx-auto mt-8 max-w-[420px]">
          {step === "day" && (
            <Shape>
              <TimeRow label="Wake around" value={s.wake} onChange={(v) => set("wake", v)} />
              <TimeRow label="Get ready" caption="When your morning routine starts" value={s.getReady} onChange={(v) => set("getReady", v)} />
              <TimeRow label="Wind down" caption="When your nighttime routine starts" value={s.windDown} onChange={(v) => set("windDown", v)} last />
            </Shape>
          )}

          {step === "work" && (
            <div>
              <button
                onClick={() => set("works", !s.works)}
                className={`flex w-full items-center gap-3 rounded-mx-md border px-4 py-3.5 ${s.works ? "border-mx-ink bg-mx-ink/[0.03]" : "border-mx-border"}`}
              >
                <span className={`flex size-5 items-center justify-center rounded-full border ${s.works ? "border-mx-ink bg-mx-ink text-white" : "border-mx-muted"}`}>
                  {s.works ? "✓" : ""}
                </span>
                <span className="text-mx-ink text-[15px]">I have set weekday hours</span>
              </button>
              {s.works && (
                <Shape className="mt-3">
                  <TimeRow label="Starts" value={s.workStart} onChange={(v) => set("workStart", v)} />
                  <TimeRow label="Ends" value={s.workEnd} onChange={(v) => set("workEnd", v)} last />
                </Shape>
              )}
            </div>
          )}

          {step === "where" && (
            <div>
              <div className="grid grid-cols-3 gap-2">
                {WORK_LOCATIONS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => set("workLocation", l.id)}
                    className={`rounded-mx-md border py-2.5 text-[14px] ${s.workLocation === l.id ? "border-mx-ink bg-mx-ink/[0.03] text-mx-ink font-medium" : "border-mx-border text-mx-ink-2"}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              {s.workLocation !== "home" && (
                <div className="mt-6">
                  <div className="mb-2 flex justify-between text-[13px]">
                    <span className="mx-label">Commute each way</span>
                    <span className="text-mx-ink">{s.commute >= 60 ? "60+ min" : `${s.commute} min`}</span>
                  </div>
                  <input type="range" min={15} max={60} step={5} value={s.commute} onChange={(e) => set("commute", Number(e.target.value))} className="w-full" />
                </div>
              )}
            </div>
          )}

          {step === "meals" && (
            <div>
              <Shape>
                <MealRow label="Breakfast" value={s.breakfast} skipped={s.skipBreakfast} onChange={(v) => set("breakfast", v)} onToggle={() => set("skipBreakfast", !s.skipBreakfast)} />
                <MealRow label="Lunch" value={s.lunch} skipped={s.skipLunch} onChange={(v) => set("lunch", v)} onToggle={() => set("skipLunch", !s.skipLunch)} />
                <MealRow label="Dinner" value={s.dinner} skipped={s.skipDinner} onChange={(v) => set("dinner", v)} onToggle={() => set("skipDinner", !s.skipDinner)} last />
              </Shape>
              <p className="text-mx-muted mt-3 text-[13px]">
                Toggle off any meal you don&apos;t eat — that frees the time for your routines.
              </p>
            </div>
          )}

          {step === "workout" && (
            <Shape>
              <TimeRow label="Workout" value={s.workout} onChange={(v) => set("workout", v)} last />
            </Shape>
          )}

          {step === "weekends" &&
            WEEKENDS.map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  set("weekend", w.id);
                  setTimeout(next, 240);
                }}
                className={`mb-2.5 w-full rounded-mx-lg border px-4 py-3.5 text-center text-[16px] ${s.weekend === w.id ? "border-mx-ink bg-mx-ink/[0.03] font-medium" : "border-mx-border"}`}
              >
                {w.label}
              </button>
            ))}

          {step === "shower" &&
            SHOWER_TIMES.map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  set("shower", w.id);
                  setTimeout(next, 240);
                }}
                className={`mb-2.5 w-full rounded-mx-lg border px-4 py-3.5 text-center text-[16px] ${s.shower === w.id ? "border-mx-ink bg-mx-ink/[0.03] font-medium" : "border-mx-border"}`}
              >
                {w.label}
              </button>
            ))}

          {step === "recap" && (
            <div className="overflow-hidden rounded-mx-lg border border-mx-border">
              {recap.map(([label, val], i) => (
                <div
                  key={label}
                  className={`flex items-center justify-between px-4 py-3 ${i > 0 ? "border-mx-border border-t" : ""}`}
                >
                  <span className="text-mx-ink text-[14px]">{label}</span>
                  <span className="text-mx-muted text-[14px] tabular-nums">{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {step !== "weekends" && step !== "shower" && (
        <div className="mx-auto mt-6 w-full max-w-[420px]">
          <button
            onClick={next}
            disabled={saving}
            className="bg-mx-ink h-12 w-full rounded-mx-md text-[15px] font-medium text-white disabled:opacity-50"
          >
            {step === "recap" ? (saving ? "Finishing…" : "Start using Max") : "Continue"}
          </button>
        </div>
      )}
    </div>
  );
}

function Shape({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-mx-surface-light rounded-mx-lg border border-mx-border overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
function TimeRow({
  label,
  caption,
  value,
  onChange,
  last,
}: {
  label: string;
  caption?: string;
  value: string;
  onChange: (v: string) => void;
  last?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between px-4 py-3.5 ${last ? "" : "border-mx-border border-b"}`}>
      <div>
        <div className="text-mx-ink text-[15px]">{label}</div>
        {caption ? <div className="text-mx-muted text-[12px]">{caption}</div> : null}
      </div>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-mx-card text-mx-ink rounded-mx-sm border border-mx-border px-2 py-1 text-[15px]"
      />
    </div>
  );
}
function MealRow({
  label,
  value,
  skipped,
  onChange,
  onToggle,
  last,
}: {
  label: string;
  value: string;
  skipped: boolean;
  onChange: (v: string) => void;
  onToggle: () => void;
  last?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between px-4 py-3 ${last ? "" : "border-mx-border border-b"}`}>
      <button onClick={onToggle} className="flex items-center gap-2.5">
        <span className={`flex size-5 items-center justify-center rounded-full border ${!skipped ? "border-mx-ink bg-mx-ink text-white" : "border-mx-muted"}`}>
          {!skipped ? "✓" : ""}
        </span>
        <span className={`text-[15px] ${skipped ? "text-mx-muted line-through" : "text-mx-ink"}`}>{label}</span>
      </button>
      {!skipped ? (
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-mx-card text-mx-ink rounded-mx-sm border border-mx-border px-2 py-1 text-[15px]"
        />
      ) : (
        <span className="text-mx-muted text-[13px]">Skipped</span>
      )}
    </div>
  );
}
