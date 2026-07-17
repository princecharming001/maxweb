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

const AGE_TO_YEARS: Record<string, number> = {
  under_18: 16,
  "18_24": 21,
  "25_34": 30,
  "35_plus": 40,
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

  return (
    <div className="flex min-h-[86vh] flex-col">
      {/* Progress */}
      <div className="flex items-center gap-3 pt-2">
        <button onClick={goBack} className="text-mx-muted hover:text-mx-ink text-[14px]">
          Back
        </button>
        <div className="bg-mx-surface h-1.5 flex-1 overflow-hidden rounded-full">
          <div
            className="bg-mx-ink h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-mx-muted text-[12px]">
          {idx + 1}/{INTRO_STEPS.length}
        </span>
      </div>

      <div className="mt-12 flex-1">
        <h1 className="font-mx-serif text-mx-ink text-center text-[30px] leading-[1.15] whitespace-pre-line">
          {step.title}
        </h1>
        <p className="text-mx-muted mt-2.5 text-center text-[14px]">{step.sub}</p>

        <div className="mx-auto mt-8 max-w-[420px] space-y-2.5">
          {step.kind === "ranked"
            ? step.options.map((o) => {
                const arr = Array.isArray(value) ? (value as string[]) : [];
                const rank = arr.indexOf(o.id);
                const active = rank >= 0;
                return (
                  <button
                    key={o.id}
                    onClick={() => toggleGoal(o.id)}
                    className={`flex w-full items-center gap-3 rounded-mx-lg border px-4 py-3.5 text-left transition ${
                      active
                        ? "border-mx-ink bg-mx-ink/[0.03]"
                        : "border-mx-border hover:border-mx-ink/25"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="text-mx-ink text-[16px] font-medium">
                        {o.label}
                      </div>
                      {o.sub ? (
                        <div className="text-mx-muted text-[13px]">{o.sub}</div>
                      ) : null}
                    </div>
                    {active ? (
                      <span className="bg-mx-ink flex size-6 items-center justify-center rounded-full text-[12px] font-semibold text-white">
                        {rank + 1}
                      </span>
                    ) : null}
                  </button>
                );
              })
            : step.options.map((o) => {
                const active = value === o.id;
                const onClick =
                  step.kind === "motivation"
                    ? () => pickMotivation(o.id)
                    : () => pickSingle(o.id);
                return (
                  <button
                    key={o.id}
                    onClick={onClick}
                    className={`w-full rounded-mx-lg border px-4 py-3.5 text-center transition ${
                      active
                        ? "border-mx-ink bg-mx-ink/[0.03]"
                        : "border-mx-border hover:border-mx-ink/25"
                    }`}
                  >
                    <div className="text-mx-ink text-[16px] font-medium">
                      {o.label}
                    </div>
                    {o.sub ? (
                      <div className="text-mx-muted text-[13px]">{o.sub}</div>
                    ) : null}
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
              className="bg-mx-surface-light text-mx-ink placeholder:text-mx-muted focus:border-mx-accent w-full resize-none rounded-mx-md border border-mx-border px-3.5 py-2.5 text-[15px] outline-none"
            />
          ) : null}
        </div>
      </div>

      {/* Continue — shown for ranked/other (single steps auto-advance) */}
      {(step.kind === "ranked" ||
        (step.kind === "motivation" && value === "other")) && (
        <div className="mx-auto mt-6 w-full max-w-[420px]">
          <button
            onClick={goNext}
            disabled={!answered || saving}
            className="bg-mx-ink h-12 w-full rounded-mx-md text-[15px] font-medium text-white disabled:opacity-40"
          >
            {saving ? "…" : "Continue"}
          </button>
        </div>
      )}
    </div>
  );
}
