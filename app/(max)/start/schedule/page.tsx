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
import { ContinueButton, FunnelHeader, Icon, StepHead, Toggle } from "../_ui";

// Leading glyphs (iOS Cal-AI icon per choice / recap row).
const WEEKEND_ICON: Record<string, string> = { sleep_in: "bed", same: "repeat" };
const SHOWER_ICON: Record<string, string> = {
  morning: "sun",
  night: "moon",
  both: "water",
};
const RECAP_ICON: Record<string, string> = {
  Wake: "sun",
  "Get ready": "water",
  Work: "briefcase",
  Workout: "barbell",
  Breakfast: "cafe",
  Lunch: "restaurant",
  Dinner: "wine",
  "Wind down": "moon",
};

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

  const isRecap = step === "recap";

  return (
    <div className="flex min-h-[86vh] flex-col">
      <FunnelHeader progress={progress} showBack onBack={back} />

      <div className="mt-12 flex flex-1 flex-col justify-center">
        <StepHead title={META[step].title} sub={META[step].sub} />

        <div className="mt-8">
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
                className={`flex w-full items-center gap-2.5 rounded-mx-xl px-[18px] py-4 shadow-mx-md transition ${s.works ? "bg-mx-ink" : "bg-white"}`}
              >
                <Icon
                  name={s.works ? "check-circle" : "circle"}
                  size={18}
                  className={s.works ? "text-white" : "text-mx-muted"}
                />
                <span className={`text-[15px] font-semibold ${s.works ? "text-white" : "text-mx-ink"}`}>
                  I have set weekday hours
                </span>
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
              <div className="flex gap-1.5 rounded-mx-lg bg-white p-1.5 shadow-mx-md">
                {WORK_LOCATIONS.map((l) => {
                  const active = s.workLocation === l.id;
                  return (
                    <button
                      key={l.id}
                      onClick={() => set("workLocation", l.id)}
                      className={`flex-1 rounded-mx-md py-3 text-[14px] transition ${active ? "bg-mx-ink font-medium text-white" : "text-[#6b6b6b]"}`}
                    >
                      {l.label}
                    </button>
                  );
                })}
              </div>
              {s.workLocation !== "home" && (
                <div className="mt-6">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="mx-label">Commute each way</span>
                    <span className="text-mx-ink text-[15px] font-semibold">
                      {s.commute >= 60 ? "60+ min" : `${s.commute} min`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={60}
                    step={5}
                    value={s.commute}
                    onChange={(e) => set("commute", Number(e.target.value))}
                    className="w-full accent-mx-ink"
                  />
                  <div className="mt-2 flex justify-between text-[11px] text-mx-muted">
                    <span>15 min</span>
                    <span>60+ min</span>
                  </div>
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
              <p className="mt-3.5 text-center text-[13px] leading-[18px] text-mx-muted">
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
              <OptionCard
                key={w.id}
                icon={WEEKEND_ICON[w.id]}
                label={w.label}
                active={s.weekend === w.id}
                onClick={() => {
                  set("weekend", w.id);
                  setTimeout(next, 240);
                }}
              />
            ))}

          {step === "shower" &&
            SHOWER_TIMES.map((w) => (
              <OptionCard
                key={w.id}
                icon={SHOWER_ICON[w.id]}
                label={w.label}
                active={s.shower === w.id}
                onClick={() => {
                  set("shower", w.id);
                  setTimeout(next, 240);
                }}
              />
            ))}

          {step === "recap" && (
            <>
              <div className="overflow-hidden rounded-mx-xl bg-white shadow-mx-md">
                {recap.map(([label, val], i) => (
                  <div
                    key={label}
                    className={`flex items-center gap-3.5 px-[18px] py-[15px] ${i > 0 ? "border-t border-mx-border" : ""}`}
                  >
                    <span className="w-6 shrink-0 text-mx-muted">
                      <Icon name={RECAP_ICON[label] ?? "sun"} size={17} />
                    </span>
                    <span className="flex-1 text-[15.5px] text-[#6b6b6b]">{label}</span>
                    <span className="text-[15.5px] font-medium text-mx-ink tabular-nums">{val}</span>
                  </div>
                ))}
              </div>
              <p className="mx-auto mt-4 max-w-[320px] text-center text-[11px] leading-[15px] text-mx-muted">
                General wellness only — not medical advice. Follow routines at your own risk.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="pt-6">
        {step !== "weekends" && step !== "shower" ? (
          <ContinueButton
            label={isRecap ? "Build my day" : "Continue"}
            onClick={next}
            loading={saving}
          />
        ) : (
          <div className="h-14" />
        )}
      </div>
    </div>
  );
}

function Shape({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-mx-xl bg-white px-[18px] shadow-mx-md ${className}`}>
      {children}
    </div>
  );
}

function OptionCard({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`mb-2.5 flex min-h-[66px] w-full items-center gap-3.5 rounded-mx-xl px-4 py-[15px] text-left shadow-mx-md transition ${active ? "bg-mx-ink" : "bg-white"}`}
    >
      <span className="grid size-[38px] shrink-0 place-items-center rounded-full bg-mx-surface text-mx-ink">
        <Icon name={icon} size={19} />
      </span>
      <span className={`flex-1 text-[16px] font-semibold ${active ? "text-white" : "text-mx-ink"}`}>
        {label}
      </span>
      {active ? <Icon name="check-circle" size={22} className="text-white" /> : null}
    </button>
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
    <div className={`flex items-center justify-between py-3.5 ${last ? "" : "border-b border-[rgba(0,0,0,0.06)]"}`}>
      <div>
        <div className="text-[13px] font-medium text-[#6b6b6b]">{label}</div>
        {caption ? <div className="text-[11.5px] text-mx-muted">{caption}</div> : null}
      </div>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-right text-[18px] font-semibold text-mx-ink outline-none"
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
    <div className={`flex items-center justify-between py-3 ${last ? "" : "border-b border-[rgba(0,0,0,0.06)]"}`}>
      <div className="flex-1">
        <div className="text-[13px] font-medium text-[#6b6b6b]">{label}</div>
        {skipped ? (
          <div className="text-[18px] font-medium text-mx-muted">Skipped</div>
        ) : (
          <input
            type="time"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-transparent text-[18px] font-semibold text-mx-ink outline-none"
          />
        )}
      </div>
      <Toggle on={!skipped} onToggle={onToggle} label={`Eat ${label.toLowerCase()}`} />
    </div>
  );
}
