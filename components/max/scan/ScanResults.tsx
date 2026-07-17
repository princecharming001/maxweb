"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import api from "@/lib/max/api";
import { Card, MetricRing } from "@/components/max/ui";

// ─── Types ──────────────────────────────────────────────────────────────────
// The web app is a thin client on the SAME backend as iOS, so the analysis
// payload can arrive either flat (overall_score, features{}, …) OR in the
// nested iOS shape (psl_rating.feature_scores{}, profile_insights, …). Every
// read below is defensive across both.
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
  first_move?: string | string[];
  suggested_modules?: string[];
  features?: Record<string, number>;
  scores?: Record<string, number>;
  // Nested iOS payload (all optional) — read via defensive casts below.
  psl_rating?: Record<string, unknown>;
  profile_insights?: Record<string, unknown>;
  [k: string]: unknown;
}
export interface Scan {
  id: string;
  created_at?: string;
  front_image_url?: string;
  analysis?: ScanAnalysis;
}

// ─── Pure helpers (ported from FaceScanResultsScreen) ────────────────────────

const obj = (v: unknown): Record<string, unknown> =>
  v != null && typeof v === "object" ? (v as Record<string, unknown>) : {};

const num = (v: unknown): number | null => {
  const n = parseFloat(String(v ?? ""));
  return Number.isNaN(n) ? null : n;
};

/** Coerce a score onto a 0–10 scale (values >10 are treated as a /100 scale). */
const to10 = (v: unknown): number | null => {
  const n = num(v);
  if (n == null) return null;
  const x = n > 10 ? n / 10 : n;
  return Math.max(0, Math.min(10, x));
};

const one = (n: number) => `${Math.round(n * 10) / 10}`;

const RATING_DISPLAY_MIN = 2.5;
const clampRating = (o: number | null): number | null =>
  o == null || Number.isNaN(o)
    ? null
    : Math.round(Math.max(RATING_DISPLAY_MIN, Math.min(10, o)) * 10) / 10;

function inferPslTierFromScore(score: number | null): string {
  if (score == null || Number.isNaN(score)) return "";
  const s = Math.max(0, Math.min(10, score));
  if (s < 3.0) return "Sub 3";
  if (s < 5.0) return "Sub 5";
  if (s < 6.0) return "LTN";
  if (s < 7.0) return "MTN";
  if (s < 8.0) return "HTN";
  if (s < 9.0) return "Chadlite";
  return "Chad";
}

function titleize(id: string): string {
  const t = String(id || "")
    .replace(/[_-]+/g, " ")
    .trim();
  if (!t) return id;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function archetypeLine(a: string, rating: number | null): string | undefined {
  if (!a) return undefined;
  if (rating != null && Number.isFinite(rating)) {
    return `Your features read closest to ${a} — that's the look your ${rating.toFixed(
      1,
    )}/10 is built on.`;
  }
  return `Your features read closest to ${a}.`;
}

function parseOverall(a: Record<string, unknown>): number | null {
  const pr = obj(a.psl_rating);
  if (pr.psl_score != null && pr.psl_score !== "") {
    const n = num(pr.psl_score);
    if (n != null) return n;
  }
  const o =
    a.overall_score ??
    obj(a.scan_summary).overall_score ??
    obj(a.metrics).overall_score;
  if (o != null) {
    const n = num(o);
    if (n != null) return n;
  }
  const m = a.umax_metrics;
  if (Array.isArray(m) && m.length > 0) {
    const sum = m.reduce(
      (acc: number, x: unknown) => acc + (num(obj(x).score) || 0),
      0,
    );
    const avg = sum / m.length;
    if (!Number.isNaN(avg)) return Math.round(avg * 10) / 10;
  }
  return null;
}

function parseAppeal(a: Record<string, unknown>, fallback: number): number {
  const pr = obj(a.psl_rating);
  if (pr.appeal != null && pr.appeal !== "") {
    const n = to10(pr.appeal);
    if (n != null) return n;
  }
  if (a.appeal_score != null) {
    const n = to10(a.appeal_score);
    if (n != null) return n;
  }
  return fallback;
}

function parsePotential(a: Record<string, unknown>, fallback: number): number {
  const pr = obj(a.psl_rating);
  if (pr.potential != null && pr.potential !== "") {
    const n = to10(pr.potential);
    if (n != null) return n;
  }
  if (a.potential_score != null) {
    const n = to10(a.potential_score);
    if (n != null) return n;
  }
  return fallback;
}

/** Green → amber → red by 0–10 score (the looksmax good/mid/weak read). */
function scoreColor(score?: number | null): string {
  if (score == null || Number.isNaN(score)) return "#8E8AA0";
  if (score >= 7.5) return "#2F9E60";
  if (score >= 6) return "#5FA86B";
  if (score >= 5) return "#B5871C";
  if (score >= 4) return "#C9772E";
  return "#C0452C";
}

const MOSAIC_PALETTE = [
  "#6E5BA8", "#5F6CC4", "#CC6F73", "#4E8C82", "#BC8B57", "#C06A85",
  "#4A6FA5", "#7FA86B", "#A06A9C", "#5E8C6A", "#C2803E", "#5AA0A8",
];

type Tile = {
  key: string;
  label: string;
  value: string;
  unit?: string;
  score?: number | null;
  accent: string;
  tag?: string;
  present: boolean;
};
type Section = { key: string; title: string; tiles: Tile[] };

/**
 * The comprehensive looksmax breakdown → named sections of /10 tiles. Ported
 * from buildMosaicSections. When locked we keep the FULL structure (paywall
 * tease); when unlocked we drop tiles/sections that returned no data.
 */
function buildMosaic(
  a: Record<string, unknown>,
  locked: boolean,
  archetype: string,
  pslTier: string,
): Section[] {
  const pr = obj(a.psl_rating);
  const fsPr = obj(pr.feature_scores);
  const fs = Object.keys(fsPr).length ? fsPr : obj(a.feature_scores);
  const flatF = obj(a.features);
  const flat = Object.keys(flatF).length ? flatF : obj(a.scores);
  const prop = obj(pr.proportions);
  const side = obj(pr.side_profile);

  let ai = 0;
  const accent = () => MOSAIC_PALETTE[ai++ % MOSAIC_PALETTE.length];

  // /10 feature tile — first hit across the nested feature_scores and the flat
  // features/scores maps, trying each alias in turn.
  const feat = (label: string, keys: string[]): Tile => {
    let sc: number | null = null;
    let tag: string | undefined;
    for (const k of keys) {
      const cell = fs[k];
      if (cell != null && typeof cell === "object") {
        const s = to10(obj(cell).score);
        if (s != null) {
          sc = s;
          const t = obj(cell).tag;
          tag = typeof t === "string" && t ? t : undefined;
          break;
        }
      } else if (cell != null) {
        const s = to10(cell);
        if (s != null) {
          sc = s;
          break;
        }
      }
      const fv = flat[k];
      if (fv != null) {
        const s = to10(fv);
        if (s != null) {
          sc = s;
          break;
        }
      }
    }
    const present = sc != null;
    return {
      key: `m-${keys[0]}`,
      label,
      accent: accent(),
      value: present ? one(sc as number) : "—",
      unit: present ? "/10" : undefined,
      score: present ? sc : undefined,
      tag,
      present,
    };
  };

  // Natural-unit / qualitative tile (no /10): tier, archetype, angles, etc.
  const meas = (
    key: string,
    label: string,
    raw: string | number | boolean | null | undefined,
  ): Tile => {
    let v = "";
    if (typeof raw === "boolean") v = raw ? "Yes" : "No";
    else if (raw != null) v = String(raw).trim();
    const present = v.length > 0 && v !== "0";
    return {
      key: `m-${key}`,
      label,
      accent: accent(),
      value: present ? v : "—",
      present,
    };
  };

  // A /10 tile from a bare numeric field (masculinity index, etc.).
  const num10 = (key: string, label: string, raw: unknown): Tile => {
    const n = to10(raw);
    const present = n != null;
    return {
      key: `m-${key}`,
      label,
      accent: accent(),
      value: present ? one(n as number) : "—",
      unit: present ? "/10" : undefined,
      score: present ? n : undefined,
      present,
    };
  };

  const mogP = num(pr.mog_percentile);
  const mogVal =
    mogP != null ? `Top ${Math.max(1, Math.min(99, Math.round(100 - mogP)))}%` : null;
  const upsideN = num(pr.glow_up_potential);
  const upside: Tile = {
    key: "m-upside",
    label: "Upside",
    accent: accent(),
    value: upsideN != null ? one(Math.max(0, Math.min(100, upsideN))) : "—",
    unit: upsideN != null ? "/100" : undefined,
    present: upsideN != null,
  };
  const fwhr = num(prop.fwhr);

  const section = (key: string, title: string, tiles: Tile[]): Section | null => {
    const kept = locked ? tiles : tiles.filter((t) => t.present);
    if (!kept.length) return null;
    return { key, title, tiles: kept };
  };

  const sections: (Section | null)[] = [
    section("verdict", "The verdict", [
      meas("tier", "PSL tier", pslTier || null),
      meas("archetype", "Archetype", archetype || null),
      meas("mog", "Mogs", mogVal),
      upside,
    ]),
    section("bone", "Bone structure", [
      feat("Jawline", ["jaw", "jawline"]),
      feat("Chin", ["chin"]),
      feat("Cheekbones", ["cheekbones"]),
      feat("Midface", ["midface"]),
      feat("Brow ridge", ["brow_ridge", "brow"]),
      feat("Symmetry", ["symmetry"]),
      meas(
        "fwhr",
        "FWHR",
        fwhr != null ? (Math.round(fwhr * 100) / 100).toFixed(2) : null,
      ),
    ]),
    section("eyes", "Eyes", [
      feat("Eye area", ["eyes", "eye_area"]),
      feat("Canthal tilt", ["canthal_tilt"]),
      feat("Hunter eyes", ["hunter_eyes"]),
    ]),
    section("mouth", "Nose & mouth", [
      feat("Nose", ["nose"]),
      feat("Lips", ["lips"]),
      feat("Philtrum", ["philtrum"]),
    ]),
    section("side", "Side profile", [
      meas("maxilla", "Maxilla", (side.maxillary_projection as string) ?? null),
      meas("mandible", "Mandible", (side.mandibular_projection as string) ?? null),
      meas("gonial", "Gonial angle", (side.gonial_angle as string) ?? null),
      meas("submental", "Neck angle", (side.submental_angle as string) ?? null),
      meas("eline", "E-line", (side.ricketts_e_line as string) ?? null),
      meas(
        "fhp",
        "Head posture",
        typeof side.forward_head_posture === "boolean"
          ? side.forward_head_posture
            ? "Forward"
            : "Neutral"
          : null,
      ),
    ]),
    section("skin", "Skin", [
      feat("Clarity", ["skin", "skin_clarity"]),
      feat("Texture", ["skin_texture", "texture"]),
      feat("Under-eye", ["under_eye"]),
    ]),
    section("frame", "Frame & dimorphism", [
      num10("masculinity", "Masculinity", pr.masculinity_index),
      feat("Hairline", ["hairline"]),
      feat("Hair density", ["hair_density"]),
      feat("Facial hair", ["facial_hair"]),
    ]),
  ];

  return sections.filter((x): x is Section => x !== null);
}

// ─── Inline icons (no emoji — Max design rule) ───────────────────────────────
function LockIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.4" fill="currentColor" />
      <path
        d="M7.75 10.5V8a4.25 4.25 0 0 1 8.5 0v2.5"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
function LockOpenIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.4" fill="currentColor" />
      <path
        d="M7.75 10.5V8a4.25 4.25 0 0 1 8.35-1"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

// A dark glassy window floating over the hero photo: 72px ring + centered score
// + label. `locked` blurs the ring and stamps a lock in the middle (the paywall
// tease for Potential).
function RingWindow({
  label,
  value,
  color,
  locked,
}: {
  label: string;
  value: number | null;
  color: string;
  locked?: boolean;
}) {
  return (
    <div className="flex flex-col items-center rounded-mx-lg bg-black/35 px-2 py-4 shadow-mx-md ring-1 ring-inset ring-white/15 backdrop-blur-md">
      <div className="relative">
        <div className={locked ? "blur-[5px]" : ""}>
          <MetricRing
            value={locked ? 0 : value ?? 0}
            max={10}
            size={72}
            stroke={6}
            color={color}
            track="rgba(255,255,255,0.18)"
            label={
              locked ? null : (
                <span className="font-mx-sans text-[17px] font-semibold tracking-tight text-white">
                  {value != null ? value.toFixed(1) : "—"}
                </span>
              )
            }
          />
        </div>
        {locked ? (
          <span className="absolute inset-0 flex items-center justify-center text-white/65">
            <LockIcon size={18} />
          </span>
        ) : null}
      </div>
      <div className="mt-2 text-[11px] font-medium tracking-wide text-white/65">
        {label}
      </div>
    </div>
  );
}

// A small verdict stat card: accent dot + uppercase label + serif value + sub.
function StatCard({
  dot,
  label,
  value,
  sub,
}: {
  dot: string;
  label: string;
  value: ReactNode;
  sub: string;
}) {
  return (
    <Card className="flex flex-col p-4">
      <span className="size-2 rounded-full" style={{ background: dot }} />
      <div className="mx-label mt-2.5 text-[10.5px]">{label}</div>
      <div className="font-mx-serif text-mx-ink mt-1.5 text-[20px] leading-tight -tracking-[0.01em]">
        {value}
      </div>
      <p className="text-mx-muted mt-1.5 text-[11.5px] leading-[15px]">{sub}</p>
    </Card>
  );
}

// One mosaic tile — /10 value colored by score (or a natural-unit measure).
function MosaicTile({ tile }: { tile: Tile }) {
  return (
    <div className="bg-mx-card rounded-mx-lg border-mx-border flex min-h-[92px] flex-col justify-between border p-3.5 shadow-mx-sm">
      <span className="size-[7px] rounded-full" style={{ background: tile.accent }} />
      <div>
        <div className="text-mx-ink truncate text-[12.5px] font-medium -tracking-[0.01em]">
          {tile.label}
        </div>
        <div className="mt-0.5 flex items-baseline gap-0.5">
          <span
            className="font-mx-serif text-[20px] -tracking-[0.02em]"
            style={{ color: tile.score != null ? scoreColor(tile.score) : "#16131F" }}
          >
            {tile.value}
          </span>
          {tile.unit ? (
            <span className="text-mx-muted text-[11px] font-medium">{tile.unit}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// Locked tile: label + a blurred "•.•" ghost with a lock badge (paywall tease).
function MosaicTileLocked({ tile }: { tile: Tile }) {
  return (
    <div className="bg-mx-card rounded-mx-lg border-mx-border flex min-h-[92px] flex-col justify-between border p-3.5 shadow-mx-sm">
      <span className="size-[7px] rounded-full" style={{ background: tile.accent }} />
      <div>
        <div className="text-mx-ink truncate text-[12.5px] font-medium -tracking-[0.01em]">
          {tile.label}
        </div>
        <div className="relative mt-0.5 flex h-6 items-center">
          <span className="font-mx-serif select-none text-[20px] tracking-[0.15em] text-[#C8C4D2] blur-[1px]">
            •.•
          </span>
          <span className="text-mx-muted absolute bottom-0.5 right-0">
            <LockIcon size={11} />
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

/**
 * Full scan breakdown, a faithful web port of iOS FaceScanResults. A photo hero
 * (front image + corner brackets + three floating metric rings) sits above a
 * white "Your Analysis" sheet. Every card + tile renders its LABEL in both
 * states; locked shows "—"/a lock (never hidden) as the paywall tease.
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
  const a = obj(scan.analysis);
  const pr = obj(a.psl_rating);
  const pi = obj(a.profile_insights);
  const img = scanImage(scan);

  const pick = (...vals: unknown[]): string => {
    for (const v of vals) {
      if (typeof v === "string") {
        const s = v.trim();
        if (s) return s;
      }
    }
    return "";
  };

  // Headline scores.
  const overall = to10(parseOverall(a));
  const base = overall ?? 5;
  const ratingDisplay = clampRating(overall);
  const appealScore = parseAppeal(a, base);
  const rawPotential = parsePotential(
    a,
    Math.min(10, Math.round((base + 0.6) * 10) / 10),
  );
  const potentialDisplay = Math.round(Math.max(0, Math.min(10, rawPotential)) * 10) / 10;
  const glowUpGain =
    ratingDisplay != null
      ? Math.max(0, Math.round((potentialDisplay - ratingDisplay) * 10) / 10)
      : null;

  // Identity / viral read.
  const archetype = pick(pr.archetype, pi.archetype, a.archetype);
  const pslTier =
    pick(pr.psl_tier, a.psl_tier, obj(a.facial_scan_summary).psl_tier) ||
    inferPslTierFromScore(overall);
  const halo = pick(pr.halo_feature, pi.halo_feature, a.halo_feature, a.halo);
  const bottleneck = pick(pr.bottleneck, pi.bottleneck, a.bottleneck);
  const bottleneckMax = pick(pr.bottleneck_max, pi.bottleneck_max, a.bottleneck_max);
  const appealQuadrant = pick(pr.appeal_quadrant, pi.appeal_quadrant, a.appeal_quadrant);
  const dimorphismNote = pick(pr.dimorphism_note, pi.dimorphism_note, a.dimorphism_note);
  const glowUpLabel = pick(pr.glow_up_label, pi.glow_up_label, a.glow_up_label);
  const sexAppeal = to10(pr.sex_appeal ?? pi.sex_appeal ?? a.sex_appeal);
  const trustAppeal = to10(pr.trust_appeal ?? pi.trust_appeal ?? a.trust_appeal);
  const dimorphism = to10(pr.dimorphism ?? pi.dimorphism ?? a.dimorphism);

  const fmSrc: unknown = Array.isArray(pr.first_move)
    ? pr.first_move
    : Array.isArray(pi.first_move)
      ? pi.first_move
      : Array.isArray(a.first_move)
        ? a.first_move
        : typeof a.first_move === "string" && a.first_move.trim()
          ? [a.first_move]
          : Array.isArray(a.suggested_modules)
            ? a.suggested_modules
            : [];
  const firstMoveArr = (fmSrc as unknown[])
    .map((x) => String(x).trim())
    .filter(Boolean)
    .slice(0, 2);
  const firstMoveTitle = firstMoveArr.length ? titleize(firstMoveArr[0]) : "";

  const archLine = archetypeLine(archetype, ratingDisplay);
  const sections = buildMosaic(a, locked, archetype, pslTier);

  return (
    <div className="mx-auto w-full max-w-[460px]">
      {/* ── Photo hero ──────────────────────────────────────────────────── */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-mx-xl bg-[#141414]">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt="Your scan"
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        {/* subtle dark gradient — lighter up top, seats the rings at the base */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-black/5 to-black/50" />

        {/* four white corner brackets framing the face */}
        <div className="pointer-events-none absolute bottom-[32%] left-[23%] right-[23%] top-[24%]">
          <span className="absolute left-0 top-0 size-9 rounded-tl-[14px] border-l-2 border-t-2 border-white/50" />
          <span className="absolute right-0 top-0 size-9 rounded-tr-[14px] border-r-2 border-t-2 border-white/50" />
          <span className="absolute bottom-0 left-0 size-9 rounded-bl-[14px] border-b-2 border-l-2 border-white/50" />
          <span className="absolute bottom-0 right-0 size-9 rounded-br-[14px] border-b-2 border-r-2 border-white/50" />
        </div>
      </div>

      {/* ── Floating ring windows (straddle the hero → sheet seam) ───────── */}
      <div className="relative z-10 -mt-[68px] grid grid-cols-3 gap-2.5 px-2">
        <RingWindow label="Rating" value={ratingDisplay} color="#7C4DFF" />
        <RingWindow label="Appeal" value={appealScore} color="#2F9E60" />
        <RingWindow label="Potential" value={potentialDisplay} color="#4DA3FF" locked={locked} />
      </div>

      {/* ── "Your Analysis" sheet ───────────────────────────────────────── */}
      <div className="space-y-3 pt-8">
        <h2 className="font-mx-serif text-mx-ink text-[28px] -tracking-[0.03em]">
          Your Analysis
        </h2>

        {/* Archetype */}
        <Card className="px-5 py-4">
          <div className="mx-label text-[10.5px]">Your archetype</div>
          {locked ? (
            <>
              <div className="font-mx-serif text-mx-ink mt-2 text-[30px] leading-[34px] -tracking-[0.02em]">
                —
              </div>
              <p className="text-mx-muted mt-2 text-[13px] leading-[19px]">
                Unlock to reveal which archetype your face reads as.
              </p>
            </>
          ) : archetype ? (
            <>
              <div className="font-mx-serif text-mx-ink mt-2 text-[30px] leading-[34px] -tracking-[0.02em]">
                {archetype}
              </div>
              {archLine ? (
                <p className="text-mx-muted mt-2 text-[13px] leading-[19px]">{archLine}</p>
              ) : null}
            </>
          ) : (
            <>
              <div className="font-mx-serif text-mx-ink mt-2 text-[30px] leading-[34px] -tracking-[0.02em]">
                Not measured
              </div>
              <p className="text-mx-muted mt-2 text-[13px] leading-[19px]">
                This scan didn&apos;t return an archetype.
              </p>
            </>
          )}
        </Card>

        {/* Your first move — dark */}
        <div className="bg-mx-ink rounded-mx-xl p-5 text-white">
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/55">
            Your first move
          </div>
          {locked ? (
            <div className="mt-1.5 flex items-center gap-2">
              <LockIcon size={19} className="text-white" />
              <span className="font-mx-serif text-[28px] leading-none -tracking-[0.02em]">
                Locked
              </span>
            </div>
          ) : (
            <div className="font-mx-serif mt-1.5 text-[28px] leading-none -tracking-[0.02em]">
              {firstMoveTitle || "Not measured"}
            </div>
          )}
          <p className="mt-2 text-[12.5px] text-white/50">
            {locked
              ? "Unlock to see exactly where to start."
              : "Start here. The one move that moves the needle most."}
          </p>
        </div>

        {/* Halo / Bottleneck */}
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard
            dot="#2F6B4E"
            label="Your halo"
            value={locked ? "—" : halo || "Not measured"}
            sub="Your biggest natural edge."
          />
          <StatCard
            dot="#C0452C"
            label="Bottleneck"
            value={locked ? "—" : bottleneck || "Not measured"}
            sub={
              !locked && bottleneckMax
                ? `Fix it with ${titleize(bottleneckMax)}.`
                : "What is holding you back."
            }
          />
        </div>

        {/* Sex appeal vs Trust appeal */}
        <Card className="px-[18px] py-[18px]">
          <div className="mx-label text-[10.5px]">Sex appeal vs Trust appeal</div>
          <div className="mt-3 flex items-center">
            <div className="flex-1 text-center">
              <div className="font-mx-serif text-mx-ink text-[30px] -tracking-[0.02em]">
                {locked ? "—" : (sexAppeal ?? 0).toFixed(1)}
              </div>
              <div className="text-mx-muted mt-0.5 text-[11.5px] font-medium">Sex appeal</div>
            </div>
            <div className="h-10 w-px self-stretch bg-black/10" />
            <div className="flex-1 text-center">
              <div className="font-mx-serif text-mx-ink text-[30px] -tracking-[0.02em]">
                {locked ? "—" : (trustAppeal ?? 0).toFixed(1)}
              </div>
              <div className="text-mx-muted mt-0.5 text-[11.5px] font-medium">Trust appeal</div>
            </div>
          </div>
          {!locked && appealQuadrant ? (
            <div className="mt-3.5 text-center text-[13.5px] font-semibold text-[#B0556F]">
              {appealQuadrant}
            </div>
          ) : null}
        </Card>

        {/* Dimorphism / Glow-up potential */}
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard
            dot="#4A4A70"
            label="Dimorphism"
            value={
              locked
                ? "—"
                : dimorphism == null
                  ? "Not measured"
                  : `${dimorphism.toFixed(1)}/10`
            }
            sub={locked || !dimorphismNote ? "Masculine vs soft balance." : dimorphismNote}
          />
          <StatCard
            dot="#BC8B57"
            label="Glow-up potential"
            value={locked ? "—" : glowUpLabel || "Not measured"}
            sub={
              !locked && glowUpGain
                ? `Est. +${glowUpGain.toFixed(1)} points`
                : "How much is in your control."
            }
          />
        </div>

        {/* ── Feature mosaic ─────────────────────────────────────────────── */}
        {sections.map((sec) => (
          <div key={sec.key} className="pt-2">
            <div className="mx-label mb-2.5">{sec.title}</div>
            <div className="grid grid-cols-3 gap-2.5">
              {sec.tiles.map((tile) =>
                locked ? (
                  <MosaicTileLocked key={tile.key} tile={tile} />
                ) : (
                  <MosaicTile key={tile.key} tile={tile} />
                ),
              )}
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
              className="bg-mx-ink mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold text-white transition hover:opacity-90"
            >
              <LockOpenIcon size={16} className="text-white" />
              {ctaLabel}
            </button>
          ) : (
            <Link
              href="/subscribe?src=scan"
              className="bg-mx-ink mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold text-white transition hover:opacity-90"
            >
              <LockOpenIcon size={16} className="text-white" />
              {ctaLabel}
            </Link>
          )
        ) : null}
      </div>
    </div>
  );
}

/** Convenience: pull the front image URL for a scan (already resolved). */
export function scanImage(scan: Scan): string | undefined {
  return api.resolveAttachmentUrl(scan.front_image_url);
}
