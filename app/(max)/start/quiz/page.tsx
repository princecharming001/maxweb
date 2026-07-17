"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMaxAuth } from "@/context/MaxAuthContext";
import api from "@/lib/max/api";
import {
  INTRO_STEPS,
  loadAnswers,
  saveAnswers,
  type OnboardingAnswers,
} from "@/lib/max/onboarding";
import { ContinueButton, FunnelHeader, Icon, StepHead } from "../_ui";

const AGE_TO_YEARS: Record<string, number> = {
  under_18: 16,
  "18_24": 21,
  "25_34": 30,
  "35_plus": 40,
};

// Per-max leading glyph on the goals tiles (iOS shows the glossy maxx thumb;
// the web port uses the matching line icon).
const GOAL_ICON: Record<string, string> = {
  skinmax: "sparkles",
  fitmax: "barbell",
  hairmax: "cut",
  heightmax: "resize",
  bonemax: "body",
};

export default function IntroQuizPage() {
  const router = useRouter();
  const { isAuthenticated, bootResolved } = useMaxAuth();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [otherText, setOtherText] = useState("");
  const [saving, setSaving] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const a = loadAnswers();
    setAnswers(a);
    setOtherText((a.motivation_other as string) || "");
  }, []);

  useEffect(() => {
    if (bootResolved && !isAuthenticated) router.replace("/start");
  }, [bootResolved, isAuthenticated, router]);

  useEffect(
    () => () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    },
    [],
  );

  const step = INTRO_STEPS[idx];
  const value = answers[step.field];
  const progress = ((idx + 1) / INTRO_STEPS.length) * 100;

  function persist(next: OnboardingAnswers) {
    setAnswers(next);
    saveAnswers(next);
  }
  function setField(v: unknown) {
    persist({ ...answers, [step.field]: v });
  }

  // Single-choice steps auto-advance a beat after the tap (like iOS).
  function autoNext() {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(goNext, 260);
  }

  function pickSingle(id: string) {
    setField(id);
    autoNext();
  }
  function pickMotivation(id: string) {
    setField(id);
    if (id !== "other") autoNext();
  }
  function toggleGoal(id: string) {
    const arr = Array.isArray(value) ? [...(value as string[])] : [];
    const at = arr.indexOf(id);
    if (at >= 0) arr.splice(at, 1);
    else if (arr.length < (step.max ?? 3)) arr.push(id);
    setField(arr);
  }

  const answered =
    step.kind === "ranked"
      ? Array.isArray(value) && value.length > 0
      : step.kind === "motivation"
        ? !!value && (value !== "other" || otherText.trim().length > 0)
        : !!value;

  async function goNext() {
    if (idx < INTRO_STEPS.length - 1) {
      setIdx(idx + 1);
      return;
    }
    // Last intro step → persist identity+goals, then to the reveal gate.
    setSaving(true);
    const a: OnboardingAnswers = { ...answers, motivation_other: otherText.trim() };
    saveAnswers(a);
    const payload: Record<string, unknown> = {
      goals: a.goals ?? [],
      gender: a.gender,
      intensity_preference: a.intensity_preference,
      motivation: a.motivation,
      motivation_other: a.motivation_other,
      age: AGE_TO_YEARS[a.age_band as string] ?? undefined,
      unit_system: "imperial",
      completed: false,
    };
    try {
      await api.saveOnboarding(payload).catch(() => undefined);
    } finally {
      router.push("/start/reveal");
    }
  }

  function goBack() {
    if (idx > 0) setIdx(idx - 1);
    else router.replace("/start/scan");
  }

  const showContinue =
    step.kind === "ranked" ||
    (step.kind === "motivation" && value === "other");

  return (
    <div className="flex min-h-[86vh] flex-col">
      <FunnelHeader progress={progress} showBack onBack={goBack} />

      <div className="mt-12 flex flex-1 flex-col justify-center">
        <StepHead title={step.title} sub={step.sub} />

        <div className="mt-8 space-y-2.5">
          {step.kind === "ranked"
            ? step.options.map((o) => {
                const arr = Array.isArray(value) ? (value as string[]) : [];
                const rank = arr.indexOf(o.id);
                const active = rank >= 0;
                return (
                  <button
                    key={o.id}
                    onClick={() => toggleGoal(o.id)}
                    className={`flex min-h-[66px] w-full items-center gap-3.5 rounded-mx-xl px-4 py-[15px] text-left shadow-mx-md transition ${
                      active ? "bg-mx-ink" : "bg-white"
                    }`}
                  >
                    <span className="grid size-[38px] shrink-0 place-items-center rounded-full bg-mx-surface text-mx-ink">
                      <Icon name={GOAL_ICON[o.id] ?? "sparkles"} size={19} />
                    </span>
                    <span className="flex-1">
                      <span
                        className={`block text-[16px] font-semibold ${active ? "text-white" : "text-mx-ink"}`}
                      >
                        {o.label}
                      </span>
                      {o.sub ? (
                        <span
                          className={`block text-[12.5px] ${active ? "text-white/60" : "text-mx-muted"}`}
                        >
                          {o.sub}
                        </span>
                      ) : null}
                    </span>
                    {active ? (
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-[12px] font-semibold text-mx-ink">
                        {rank + 1}
                      </span>
                    ) : null}
                  </button>
                );
              })
            : step.options.map((o) => {
                const active = value === o.id;
                const hasSub = !!o.sub;
                const onClick =
                  step.kind === "motivation"
                    ? () => pickMotivation(o.id)
                    : () => pickSingle(o.id);
                return (
                  <button
                    key={o.id}
                    onClick={onClick}
                    className={`flex min-h-[66px] w-full items-center rounded-mx-xl px-4 py-[15px] shadow-mx-md transition ${
                      hasSub ? "text-left" : "justify-center text-center"
                    } ${active ? "bg-mx-ink" : "bg-white"}`}
                  >
                    <span className={hasSub ? "flex-1" : ""}>
                      <span
                        className={`block text-[16px] font-semibold ${active ? "text-white" : "text-mx-ink"}`}
                      >
                        {o.label}
                      </span>
                      {o.sub ? (
                        <span
                          className={`block text-[12.5px] ${active ? "text-white/60" : "text-mx-muted"}`}
                        >
                          {o.sub}
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}

          {step.kind === "motivation" && value === "other" ? (
            <textarea
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              placeholder="Tell Max in your own words…"
              maxLength={140}
              autoFocus
              rows={2}
              className="min-h-[66px] w-full resize-none rounded-mx-xl bg-white px-4 py-[15px] text-[16px] text-mx-ink shadow-mx-md outline-none placeholder:text-mx-muted"
            />
          ) : null}
        </div>
      </div>

      {/* Continue — shown for ranked/other; single steps auto-advance on tap. */}
      <div className="pt-6">
        {showContinue ? (
          <ContinueButton
            label="Continue"
            onClick={goNext}
            disabled={!answered}
            loading={saving}
          />
        ) : (
          <div className="h-14" />
        )}
      </div>
    </div>
  );
}
