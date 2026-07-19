"use client";

import Image from "next/image";
import { useState } from "react";
import { useMaxAuth } from "@/context/MaxAuthContext";
import api from "@/lib/max/api";

// Verbatim from iOS ChatConversationsDrawer PERSONA_OPTIONS.
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

/**
 * Coach persona + response-length controls — the bottom block of the iOS
 * ChatConversationsDrawer: three square persona tiles (gently-floating
 * avatars, signature-color border + bottom glow halo on the active coach,
 * dimmed inactive figures), a hint line, then a single row of three length
 * chips (active = ink fill) with the active length's hint below.
 */
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
    <div>
      {/* iOS FloatingAvatar: -5px bob over a 3s cycle, staggered per column. */}
      <style>{`@keyframes mxCoachFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}@media (prefers-reduced-motion:reduce){.mx-coach-float{animation:none!important}}`}</style>

      {/* Coach */}
      <div className="mx-label mb-2">Coach</div>
      <div className="flex gap-2">
        {PERSONAS.map((p, i) => {
          const on = p.id === personaId;
          const busy = on && savingCoach;
          return (
            <button
              key={p.id}
              onClick={() => pickPersona(p)}
              aria-pressed={on}
              aria-label={`Coach: ${p.label}`}
              disabled={savingCoach}
              className="flex min-w-0 flex-1 flex-col items-center"
            >
              <span
                className={`relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border transition ${
                  on ? "bg-white/[0.04]" : "border-mx-border bg-white/40"
                }`}
                style={on ? { borderColor: p.glow } : undefined}
              >
                {/* Soft signature-color halo behind the selected coach. */}
                {on ? (
                  <span
                    aria-hidden
                    className="absolute -bottom-7 h-[110%] w-[150%] rounded-full opacity-[0.22]"
                    style={{ backgroundColor: p.glow }}
                  />
                ) : null}
                <Image
                  src={`/personas/${p.id}.png`}
                  alt={p.label}
                  width={120}
                  height={120}
                  className={`mx-coach-float relative size-[94%] object-contain ${on ? "" : "opacity-[0.38]"}`}
                  style={{ animation: "mxCoachFloat 3s ease-in-out infinite", animationDelay: `${i * 240}ms` }}
                />
                {busy ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-white/45">
                    <span
                      className="size-4 animate-spin rounded-full border-2 border-black/10"
                      style={{ borderTopColor: p.glow }}
                    />
                  </span>
                ) : null}
              </span>
              <span
                className={`mt-[7px] w-full truncate text-center text-[11.5px] tracking-[0.1px] ${
                  on ? "text-mx-ink font-semibold" : "text-mx-ink/55 font-medium"
                }`}
              >
                {p.label}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-mx-ink/35 mt-2.5 text-center text-[11.5px] tracking-[0.1px]">{active.desc}</p>

      {/* Length — single-row segmented chips */}
      <div className="mx-label mb-2 mt-3.5">Length</div>
      <div className="flex gap-1.5">
        {LENGTHS.map((l) => {
          const on = l.id === length;
          const busy = on && savingLen;
          return (
            <button
              key={l.id}
              onClick={() => pickLength(l.id)}
              disabled={savingLen}
              className={`rounded-mx-sm flex min-w-0 flex-1 items-center justify-center border py-[9px] text-[12.5px] tracking-[0.1px] transition ${
                on
                  ? "border-mx-ink bg-mx-ink font-semibold text-white"
                  : "border-mx-border text-mx-ink bg-white/40 font-medium hover:bg-white/[0.58]"
              }`}
            >
              {busy ? (
                <span className="size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                l.label
              )}
            </button>
          );
        })}
      </div>
      <p className="text-mx-ink/35 mt-2 text-center text-[11px] tracking-[0.1px]">
        {LENGTHS.find((o) => o.id === length)?.desc}
      </p>
    </div>
  );
}
