"use client";

import Link from "next/link";
import api from "@/lib/max/api";
import { Card, MetricRing } from "@/components/max/ui";

export interface ScanAnalysis {
  overall_score?: number;
  appeal_score?: number;
  potential_score?: number;
  sex_appeal?: number;
  trust_appeal?: number;
  dimorphism?: number;
  archetype?: string;
  psl_tier?: string;
  halo?: string;
  bottleneck?: string;
  first_move?: string;
  suggested_modules?: string[];
  features?: Record<string, number>;
  scores?: Record<string, number>;
}
export interface Scan {
  id: string;
  created_at?: string;
  front_image_url?: string;
  analysis?: ScanAnalysis;
}

const to10 = (v?: number | null) =>
  v == null || !Number.isFinite(v) ? null : v > 10 ? v / 10 : v;
const fmt = (v?: number | null) => {
  const x = to10(v);
  return x == null ? "—" : x.toFixed(1);
};

// Feature mosaic grouped like the iOS FaceScanResults breakdown. The labels
// ALWAYS render (locked → a lock tile) so the user sees exactly which metrics
// exist behind the paywall.
const MOSAIC: { section: string; tiles: [string, string][] }[] = [
  { section: "Bone structure", tiles: [["Jawline", "jawline"], ["Chin", "chin"], ["Cheekbones", "cheekbones"], ["Midface", "midface"]] },
  { section: "Eyes", tiles: [["Eye area", "eye_area"], ["Canthal tilt", "canthal_tilt"], ["Symmetry", "symmetry"]] },
  { section: "Nose & mouth", tiles: [["Nose", "nose"], ["Lips", "lips"], ["Philtrum", "philtrum"]] },
  { section: "Side profile", tiles: [["Gonial angle", "gonial_angle"], ["Neck angle", "neck_angle"], ["E-line", "eline"]] },
  { section: "Skin", tiles: [["Clarity", "skin_clarity"], ["Texture", "skin_texture"], ["Under-eye", "under_eye"]] },
  { section: "Frame", tiles: [["Masculinity", "masculinity"], ["Hairline", "hairline"], ["Hair density", "hair_density"]] },
];

/**
 * Full scan breakdown, faithful to iOS FaceScanResults. Every card renders in
 * both locked and unlocked states; locked shows "—" / lock (never hidden).
 */
export default function ScanResults({
  scan,
  locked,
  onUnlock,
  ctaLabel = "Unlock full results",
}: {
  scan: Scan;
  locked: boolean;
  onUnlock?: () => void;
  ctaLabel?: string;
}) {
  const a = scan.analysis ?? {};
  const feat = (a.features ?? a.scores ?? {}) as Record<string, number>;
  const firstMove = a.first_move || a.suggested_modules?.[0];
  const glowUp =
    to10(a.potential_score) != null && to10(a.overall_score) != null
      ? `+${(to10(a.potential_score)! - to10(a.overall_score)!).toFixed(1)}`
      : "—";

  return (
    <div className="space-y-3">
      {/* Ring trio */}
      <Card className="flex items-start justify-around gap-2 px-4 py-6">
        <Ring label="Rating" value={a.overall_score} />
        <Ring label="Appeal" value={a.appeal_score} />
        <Ring label="Potential" value={a.potential_score} locked={locked} />
      </Card>

      {/* Archetype */}
      <Card className="px-5 py-4">
        <div className="mx-label">Your archetype</div>
        <div className="font-mx-serif text-mx-ink mt-1 text-[24px]">
          {locked ? "—" : a.archetype || "Not measured"}
        </div>
        <p className="text-mx-muted mt-1 text-[13px]">
          {locked
            ? "Unlock to reveal which archetype your face reads as."
            : a.psl_tier
              ? `PSL tier · ${a.psl_tier}`
              : "How your face reads at a glance."}
        </p>
      </Card>

      {/* First move — dark */}
      <div className="bg-mx-ink rounded-mx-lg p-4 text-white">
        <div className="mx-label text-white/50">Your first move</div>
        <div className="mt-1 text-[18px] font-medium capitalize">
          {locked ? "Locked" : (firstMove || "—").replace(/_/g, " ")}
        </div>
        <p className="mt-1 text-[13px] text-white/50">
          {locked
            ? "Unlock to see exactly where to start."
            : "Start here. The one move that moves the needle most."}
        </p>
      </div>

      {/* Halo / Bottleneck */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="px-4 py-3.5">
          <div className="flex items-center gap-1.5">
            <span className="bg-mx-success size-2 rounded-full" />
            <span className="mx-label">Your halo</span>
          </div>
          <div className="text-mx-ink mt-1.5 text-[14px] font-medium capitalize">
            {locked ? "—" : (a.halo || "—").replace(/_/g, " ")}
          </div>
          <p className="text-mx-muted mt-0.5 text-[12px]">Your biggest natural edge.</p>
        </Card>
        <Card className="px-4 py-3.5">
          <div className="flex items-center gap-1.5">
            <span className="bg-mx-error size-2 rounded-full" />
            <span className="mx-label">Bottleneck</span>
          </div>
          <div className="text-mx-ink mt-1.5 text-[14px] font-medium capitalize">
            {locked ? "—" : (a.bottleneck || "—").replace(/_/g, " ")}
          </div>
          <p className="text-mx-muted mt-0.5 text-[12px]">What&apos;s holding you back.</p>
        </Card>
      </div>

      {/* Sex vs Trust appeal */}
      <Card className="px-5 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="mx-label">Sex appeal</div>
            <div className="font-mx-serif text-mx-ink mt-1 text-[26px]">
              {locked ? "—" : fmt(a.sex_appeal)}
            </div>
          </div>
          <div>
            <div className="mx-label">Trust appeal</div>
            <div className="font-mx-serif text-mx-ink mt-1 text-[26px]">
              {locked ? "—" : fmt(a.trust_appeal)}
            </div>
          </div>
        </div>
      </Card>

      {/* Dimorphism / Glow-up */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="px-4 py-3.5">
          <div className="mx-label">Dimorphism</div>
          <div className="font-mx-serif text-mx-ink mt-1 text-[22px]">
            {locked ? "—" : fmt(a.dimorphism)}
          </div>
          <p className="text-mx-muted mt-0.5 text-[12px]">Masculine vs soft balance.</p>
        </Card>
        <Card className="px-4 py-3.5">
          <div className="mx-label">Glow-up potential</div>
          <div className="font-mx-serif text-mx-ink mt-1 text-[22px]">
            {locked ? "—" : glowUp}
          </div>
          <p className="text-mx-muted mt-0.5 text-[12px]">How much is in your control.</p>
        </Card>
      </div>

      {/* Feature mosaic — labels always shown; locked → lock tile */}
      {MOSAIC.map((sec) => (
        <div key={sec.section} className="pt-2">
          <div className="mx-label mb-2">{sec.section}</div>
          <div className="grid grid-cols-3 gap-2">
            {sec.tiles.map(([label, key]) => {
              const val = to10(feat[key]);
              const show = !locked && val != null;
              return (
                <div key={key} className="bg-mx-surface rounded-mx-md px-2 py-2.5 text-center">
                  <div className="text-mx-ink text-[16px] font-semibold leading-none">
                    {show ? val!.toFixed(1) : locked ? "🔒" : "—"}
                  </div>
                  <div className="text-mx-muted mt-1 text-[10px] leading-tight">{label}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <p className="text-mx-muted pt-2 text-center text-[11px]">
        For general wellness only. Not medical advice.
      </p>

      {/* Unlock CTA */}
      {locked ? (
        onUnlock ? (
          <button
            onClick={onUnlock}
            className="bg-mx-ink mt-2 h-12 w-full rounded-full text-[15px] font-semibold text-white"
          >
            {ctaLabel}
          </button>
        ) : (
          <Link
            href="/subscribe?src=scan"
            className="bg-mx-ink mt-2 flex h-12 w-full items-center justify-center rounded-full text-[15px] font-semibold text-white"
          >
            {ctaLabel}
          </Link>
        )
      ) : null}
    </div>
  );
}

function Ring({
  label,
  value,
  locked: ringLocked,
}: {
  label: string;
  value?: number;
  locked?: boolean;
}) {
  const v = to10(value);
  return (
    <div className="text-center">
      <div className={ringLocked ? "blur-[6px]" : ""}>
        <MetricRing
          value={v ?? 0}
          max={10}
          size={84}
          label={ringLocked ? "" : v != null ? v.toFixed(0) : "—"}
        />
      </div>
      <div className="mx-label mt-1">{label}</div>
    </div>
  );
}

/** Convenience: pull the front image URL for a scan (already resolved). */
export function scanImage(scan: Scan): string | undefined {
  return api.resolveAttachmentUrl(scan.front_image_url);
}
