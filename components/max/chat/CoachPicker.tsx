"use client";

import Image from "next/image";
import { useState } from "react";
import { useMaxAuth } from "@/context/MaxAuthContext";
import api from "@/lib/max/api";

// Verbatim from iOS ChatConversationsDrawer PERSONAS.
type Tone = "hardcore" | "influencer" | "gentle";
const PERSONAS: {
  id: string;
  label: string;
  tone: Tone;
  glow: string;
  desc: string;
}[] = [
  { id: "goggins", label: "Goggins", tone: "hardcore", glow: "#EC7E5C", desc: "no excuses, pure accountability" },
  { id: "clavicular", label: "Clavicular", tone: "influencer", glow: "#5B8DEF", desc: "sharp, looksmaxxing-obsessed" },
  { id: "bigdaddy", label: "Big Daddy", tone: "gentle", glow: "#E0A15B", desc: "warm, always in your corner" },
];

const TONE_TO_ID: Record<string, string> = {
  hardcore: "goggins",
  influencer: "clavicular",
  gentle: "bigdaddy",
  default: "clavicular", // legacy fallback
};

const LENGTHS: { id: "concise" | "medium" | "detailed"; label: string; desc: string }[] = [
  { id: "concise", label: "Concise", desc: "one short sentence" },
  { id: "medium", label: "Medium", desc: "two or three sentences" },
  { id: "detailed", label: "Detailed", desc: "long, specific, numbered" },
];

export default function CoachPicker() {
  const { user, refreshUser } = useMaxAuth();
  const u = user as
    | { coaching_tone?: string; onboarding?: { response_length?: string } }
    | null;

  const [personaId, setPersonaId] = useState(
    () => TONE_TO_ID[u?.coaching_tone || "default"] || "clavicular",
  );
  const [length, setLength] = useState<"concise" | "medium" | "detailed">(
    () => (u?.onboarding?.response_length as "concise" | "medium" | "detailed") || "medium",
  );
  const [savingCoach, setSavingCoach] = useState(false);
  const [savingLen, setSavingLen] = useState(false);
  const active = PERSONAS.find((p) => p.id === personaId) ?? PERSONAS[1];

  async function pickPersona(p: (typeof PERSONAS)[number]) {
    if (savingCoach || p.id === personaId) return;
    const prev = personaId;
    setPersonaId(p.id); // optimistic
    setSavingCoach(true);
    try {
      await api.patchCoachingTone(p.tone);
      await refreshUser();
    } catch {
      setPersonaId(prev); // rollback
    } finally {
      setSavingCoach(false);
    }
  }

  async function pickLength(id: "concise" | "medium" | "detailed") {
    if (savingLen || id === length) return;
    const prev = length;
    setLength(id);
    setSavingLen(true);
    try {
      await api.patchResponseLength(id);
      await refreshUser();
    } catch {
      setLength(prev);
    } finally {
      setSavingLen(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Coach */}
      <div>
        <div className="mx-label mb-2">Coach</div>
        <div className="grid grid-cols-3 gap-2">
          {PERSONAS.map((p) => {
            const on = p.id === personaId;
            return (
              <button
                key={p.id}
                onClick={() => pickPersona(p)}
                aria-pressed={on}
                className={`relative flex flex-col items-center rounded-mx-md border px-1.5 py-2.5 transition ${
                  on ? "border-mx-ink bg-mx-ink/[0.03]" : "border-mx-border hover:border-mx-ink/25"
                }`}
              >
                <span
                  className="relative flex size-11 items-center justify-center rounded-full"
                  style={{ boxShadow: on ? `0 0 0 2px ${p.glow}55, 0 6px 16px ${p.glow}44` : "none" }}
                >
                  <Image
                    src={`/personas/${p.id}.png`}
                    alt={p.label}
                    width={44}
                    height={44}
                    className="size-11 rounded-full object-cover"
                  />
                  {on && savingCoach ? (
                    <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
                      <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    </span>
                  ) : null}
                </span>
                <span className="text-mx-ink mt-1.5 text-[12px] font-medium">{p.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-mx-muted mt-2 text-center text-[12px]">{active.desc}</p>
      </div>

      {/* Length */}
      <div>
        <div className="mx-label mb-2">Length</div>
        <div className="border-mx-border overflow-hidden rounded-mx-md border">
          {LENGTHS.map((l, i) => {
            const on = l.id === length;
            return (
              <button
                key={l.id}
                onClick={() => pickLength(l.id)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left transition ${
                  i > 0 ? "border-mx-border border-t" : ""
                } ${on ? "bg-mx-ink/[0.03]" : "hover:bg-mx-surface"}`}
              >
                <div>
                  <div className={`text-[13px] ${on ? "text-mx-ink font-medium" : "text-mx-ink-2"}`}>
                    {l.label}
                  </div>
                  <div className="text-mx-muted text-[11px]">{l.desc}</div>
                </div>
                {on ? <span className="text-mx-accent text-[13px]">✓</span> : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
