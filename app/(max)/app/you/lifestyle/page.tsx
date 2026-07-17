"use client";

import { useState } from "react";
import api from "@/lib/max/api";
import { useMaxAuth } from "@/context/MaxAuthContext";
import SubPageHeader from "@/components/max/SubPageHeader";
import { Button, Card } from "@/components/max/ui";
import { MAXX_TILES } from "@/lib/max/onboarding";

const EFFORTS = [
  { id: "light", label: "Light touch", sub: "some tips and tricks" },
  { id: "steady", label: "Steady", sub: "tweaking my daily routine" },
  { id: "all_in", label: "All in", sub: "becoming a new person" },
];

export default function LifestylePage() {
  const { user, refreshUser } = useMaxAuth();
  const u = user as { onboarding?: { goals?: string[]; intensity_preference?: string } } | null;

  const [goals, setGoals] = useState<string[]>(u?.onboarding?.goals ?? []);
  const [effort, setEffort] = useState(u?.onboarding?.intensity_preference ?? "steady");
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  function toggleGoal(id: string) {
    setGoals((g) => (g.includes(id) ? g.filter((x) => x !== id) : g.length < 3 ? [...g, id] : g));
  }

  async function save() {
    setSaving(true);
    setNote(null);
    try {
      await api.saveOnboarding({ goals, intensity_preference: effort, completed: true });
      await refreshUser();
      setNote("Saved. Your plan will adjust.");
    } catch {
      setNote("Couldn't save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[560px]">
      <SubPageHeader title="Edit lifestyle" />

      <Card className="p-5">
        <div className="mx-label mb-3">What you&apos;re working on</div>
        <div className="space-y-2">
          {MAXX_TILES.map((t) => {
            const on = goals.includes(t.id);
            return (
              <button
                key={t.id}
                onClick={() => toggleGoal(t.id)}
                className={`flex w-full items-center justify-between rounded-mx-md border px-4 py-3 text-left transition ${
                  on ? "border-mx-ink bg-mx-ink/[0.03]" : "border-mx-border hover:border-mx-ink/25"
                }`}
              >
                <div>
                  <div className="text-mx-ink text-[15px] font-medium">{t.label}</div>
                  {t.sub ? <div className="text-mx-muted text-[13px]">{t.sub}</div> : null}
                </div>
                {on ? <span className="text-mx-accent">✓</span> : null}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <div className="mx-label mb-3">How hard you want to go</div>
        <div className="space-y-2">
          {EFFORTS.map((e) => {
            const on = effort === e.id;
            return (
              <button
                key={e.id}
                onClick={() => setEffort(e.id)}
                className={`flex w-full items-center justify-between rounded-mx-md border px-4 py-3 text-left transition ${
                  on ? "border-mx-ink bg-mx-ink/[0.03]" : "border-mx-border hover:border-mx-ink/25"
                }`}
              >
                <div>
                  <div className="text-mx-ink text-[15px] font-medium">{e.label}</div>
                  <div className="text-mx-muted text-[13px]">{e.sub}</div>
                </div>
                {on ? <span className="text-mx-accent">✓</span> : null}
              </button>
            );
          })}
        </div>
      </Card>

      <div className="mt-5 flex items-center gap-3">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
        {note ? <span className="text-mx-muted text-[13px]">{note}</span> : null}
      </div>
    </div>
  );
}
