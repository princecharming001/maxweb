"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { ReactNode } from "react";
import api from "@/lib/max/api";
import { MetricRing } from "@/components/max/ui";

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

// iOS shows paid users an anchored, inflated Potential (never the raw model
// number) — computeDisplayPotential and friends are a 1:1 port.
function inflatePotentialForDisplay(raw: number): number {
  const headroom = Math.max(0, 10 - raw);
  const bumped = raw + 0.28 + headroom * 0.06;
  return Math.min(10, Math.round(bumped * 10) / 10);
}

function anchorPotentialFromRating(ratingDisplay: number | null): number {
  const r = ratingDisplay ?? 5;
  const x = Math.max(RATING_DISPLAY_MIN, Math.min(10, r));
  const pts: readonly [number, number][] = [
    [2.5, 7.55], [4.0, 8.32], [6.0, 8.95], [8.0, 9.35], [10.0, 9.85],
  ];
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    if (x <= x1) {
      const t = (x - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return pts[pts.length - 1][1];
}

function computeDisplayPotential(
  rawPotential: number,
  treatAsPaid: boolean,
  ratingDisplay: number | null,
): number {
  if (!treatAsPaid)
    return Math.round(Math.max(0, Math.min(10, rawPotential)) * 10) / 10;
  const anchor = anchorPotentialFromRating(ratingDisplay);
  const inflated = inflatePotentialForDisplay(rawPotential);
  const nudge = (inflated - 7) * 0.1;
  const v = anchor + nudge;
  return Math.round(Math.min(9.9, Math.max(6.4, v)) * 10) / 10;
}

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

/** Module id → display title, ported from formatSuggestedModuleTitle /
 *  getMaxxDisplayLabel (iOS): "skinmax" → "Skinmax", "coloringmax" →
 *  "Coloring Max", otherwise lowercase the trailing "Max" and capitalize. */
function formatModuleTitle(id: string): string {
  const key = String(id || "").toLowerCase().trim();
  if (!key) return id;
  if (key === "skinmax") return "Skinmax";
  if (key === "coloringmax") return "Coloring Max";
  let s = String(id).trim();
  s = s.replace(/Max$/i, "max");
  s = s.replace(/([A-Za-z0-9])Max(?=\s*[—\-–])/g, "$1max");
  if (!s) return id;
  return s.charAt(0).toUpperCase() + s.slice(1);
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

/** Green → amber → red by 0–10 score (matches iOS MosaicGrid.scoreColor). */
function scoreColor(score?: number | null): string {
  if (score == null || Number.isNaN(score)) return "#8E8AA0";
  if (score >= 7.5) return "#2F9E60";
  if (score >= 6) return "#5FA86B";
  if (score >= 5) return "#B5871C";
  if (score >= 4) return "#C9772E";
  return "#C0452C";
}

// ─── Shared style fragments (iOS glass-pane + label recipes) ─────────────────
// GlassCard light over the white sheet reads as a white pane with an invisible
// white rim and the planner float shadow — no gray hairline, no flat shadow.
const PANE =
  "bg-white ring-1 ring-inset ring-white/70 shadow-[0_6px_12px_rgba(58,53,43,0.13)]";
// iOS verdict/archetype kicker: 10.5px Matter-Medium, +0.8px tracking, BENTO_SUB.
const KICKER =
  "text-[10.5px] font-medium uppercase tracking-[0.8px] text-[#736F7E]";

const BENTO_INK = "#1B1822";

const MOSAIC_PALETTE = [
  "#6E5BA8", "#5F6CC4", "#CC6F73", "#4E8C82", "#BC8B57", "#C06A85",
  "#4A6FA5", "#7FA86B", "#A06A9C", "#5E8C6A", "#C2803E", "#5AA0A8",
];

// Ring gradients — the exact two-stop jewel tones from the iOS METRICS array.
const RING_METRICS = [
  { key: "rating", label: "Rating", from: "#A77BFF", to: "#5B2BB0" },
  { key: "appeal", label: "Appeal", from: "#4FD08A", to: "#157A45" },
  { key: "potential", label: "Potential", from: "#4DA3FF", to: "#6C5CE7" },
] as const;

// Per-metric elaborations shown in the expanded mosaic tile (iOS METRIC_DETAIL,
// verbatim).
const METRIC_DETAIL: Record<string, string> = {
  jaw: "Definition of the mandible and gonial angle — a wide jaw with a clean angle reads masculine and structured.",
  chin: "Projection and width of the chin. A forward, defined chin balances the lower third and strengthens the profile.",
  cheekbones: "Height and width of the zygomatic bones. High, wide cheekbones add shadowing and an angular midface.",
  midface: "Midface ratio — compactness from pupils to lip. A shorter, fuller midface is a strong harmony marker.",
  brow_ridge: "Brow-bone prominence and how it sets over the eyes. A developed, slightly forward brow deepens the eye area.",
  symmetry: "Left-vs-right balance across your features — the single biggest driver of perceived harmony.",
  fwhr: "Facial width-to-height ratio. Higher reads more dominant; the attractive male range sits around 1.9–2.0.",
  eyes: "Overall eye area — shape, size and spacing. The visual centre of the face and the first thing people read.",
  canthal_tilt: "Angle from inner to outer eye corner. A positive tilt (outer corner higher) is the coveted hunter-eye marker.",
  hunter_eyes: 'Positive canthal tilt + a low-set, hooded brow + low eyelid exposure — an intense, "sloaded" eye look.',
  under_eye: "Under-eye support: hollowing, dark circles and puffiness. Flat, bright under-eyes read healthy and rested.",
  nose: "Bridge, tip and proportion of the nose to the rest of the face. Straight and proportionate scores highest.",
  lips: "Fullness and shape of the lips. A balanced upper-to-lower ratio with defined borders is ideal.",
  philtrum: "Distance from nose to upper lip. A shorter philtrum keeps the lower third compact and youthful.",
  maxilla: "Forward growth of the upper jaw. Strong maxillary projection lifts the midface, cheekbones and eye area.",
  mandible: "Forward growth and strength of the lower jaw — drives jawline projection on the side profile.",
  gonial: "The jaw angle where the mandible turns up toward the ear. Around 120° with a defined corner is the sweet spot.",
  submental: "The neck-to-jaw (submental) angle. A crisp angle makes the jawline pop in profile.",
  eline: "Ricketts' E-line — nose tip to chin. Lips sitting just behind this line is the balanced-profile ideal.",
  fhp: "Forward head posture drops the chin and shortens the neck — postural, and very fixable.",
  skin: "Clarity and evenness — breakouts, redness and marks. The fastest-moving lever in any plan.",
  skin_texture: "Pore visibility and surface smoothness. Refined texture catches light evenly and reads premium.",
  masculinity: 'Sexual dimorphism — how strongly your features read masculine. Drives your "type" more than raw score.',
  hairline: "Hairline shape and maturity. A full, even hairline frames the upper third and supports every other feature.",
  hair_density: "Density and coverage of scalp hair. Thickness frames the face and responds fast to early action.",
  facial_hair: "Beard density and pattern — a strong frame for the lower third and a quick way to add jaw definition.",
  tier: "The PSL bracket your face falls into on the looksmaxxing scale — Sub 5 up through HTN, Chadlite and Chad.",
  archetype: 'The facial "type" your features map to most closely — the overall vibe your look reads as.',
  mog: 'Where you place against other men your age. "Top 15%" means you out-mog roughly 85 of every 100.',
  upside: "How much non-surgical headroom you have left. Higher means more to gain from a consistent plan.",
};

type Tile = {
  key: string;
  label: string;
  value: string;
  unit?: string;
  score?: number | null;
  accent: string;
  tag?: string;
  detail?: string;
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
  // features/scores maps, trying each alias in turn. `detailKey` picks the
  // METRIC_DETAIL blurb; per-scan notes on the cell win when present.
  const feat = (label: string, keys: string[], detailKey = keys[0]): Tile => {
    let sc: number | null = null;
    let tag: string | undefined;
    let notes: string | undefined;
    for (const k of keys) {
      const cell = fs[k];
      if (cell != null && typeof cell === "object") {
        const s = to10(obj(cell).score);
        if (s != null) {
          sc = s;
          const t = obj(cell).tag;
          tag = typeof t === "string" && t ? t : undefined;
          const nt = obj(cell).notes;
          notes = typeof nt === "string" && nt ? nt : undefined;
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
      detail: notes || METRIC_DETAIL[detailKey],
      present,
    };
  };

  // Natural-unit / qualitative tile (no /10): tier, archetype, angles, etc.
  const meas = (
    key: string,
    label: string,
    raw: string | number | boolean | null | undefined,
    detailKey = key,
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
      detail: METRIC_DETAIL[detailKey],
      present,
    };
  };

  // A /10 tile from a bare numeric field (masculinity index, etc.).
  const num10 = (key: string, label: string, raw: unknown, detailKey = key): Tile => {
    const n = to10(raw);
    const present = n != null;
    return {
      key: `m-${key}`,
      label,
      accent: accent(),
      value: present ? one(n as number) : "—",
      unit: present ? "/10" : undefined,
      score: present ? n : undefined,
      detail: METRIC_DETAIL[detailKey],
      present,
    };
  };

  const mogP = num(pr.mog_percentile);
  const mogVal =
    mogP != null ? `Top ${Math.max(1, Math.min(99, Math.round(100 - mogP)))}%` : null;
  // iOS renders Upside through the same 0–10 clamp then stamps "/100" — match
  // that formatting exactly rather than "fixing" it web-side.
  const upsideN = num(pr.glow_up_potential);
  const upside: Tile = {
    key: "m-upside",
    label: "Upside",
    accent: accent(),
    value: upsideN != null ? one(Math.max(0, Math.min(10, upsideN))) : "—",
    unit: upsideN != null ? "/100" : undefined,
    detail: METRIC_DETAIL.upside,
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
      meas("tier", "PSL tier", pslTier || null, "tier"),
      meas("archetype", "Archetype", archetype || null, "archetype"),
      meas("mog", "Mogs", mogVal, "mog"),
      upside,
    ]),
    section("bone", "Bone structure", [
      feat("Jawline", ["jaw", "jawline"], "jaw"),
      feat("Chin", ["chin"]),
      feat("Cheekbones", ["cheekbones"]),
      feat("Midface", ["midface"]),
      feat("Brow ridge", ["brow_ridge", "brow"], "brow_ridge"),
      feat("Symmetry", ["symmetry"]),
      meas(
        "fwhr",
        "FWHR",
        fwhr != null ? (Math.round(fwhr * 100) / 100).toFixed(2) : null,
      ),
    ]),
    section("eyes", "Eyes", [
      feat("Eye area", ["eyes", "eye_area"], "eyes"),
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
      feat("Clarity", ["skin", "skin_clarity"], "skin"),
      feat("Texture", ["skin_texture", "texture"], "skin_texture"),
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
function ChevronDownIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 9.5l7 7 7-7"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

// One floating ink-glass window over the hero photo: 72px gradient ring +
// centered score + label — the iOS GlassCard dark recipe (radius 22,
// rgba(18,16,24,0.28) wash, 0.24-white hairline rim, planner float shadow).
// When locked the ring sits at 0 with a lock stamped in the middle (iOS never
// blurs the ring).
function RingWindow({
  label,
  value,
  from,
  to,
  gid,
  locked,
}: {
  label: string;
  value: number | null;
  from: string;
  to: string;
  gid: string;
  locked?: boolean;
}) {
  return (
    <div className="flex flex-col items-center rounded-[22px] bg-[rgba(18,16,24,0.28)] px-2 py-4 shadow-[0_6px_12px_rgba(58,53,43,0.13)] ring-1 ring-inset ring-[rgba(255,255,255,0.24)] backdrop-blur-md">
      <svg width={0} height={0} className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={from} />
            <stop offset="1" stopColor={to} />
          </linearGradient>
        </defs>
      </svg>
      <div className="relative">
        <MetricRing
          value={locked ? 0 : value ?? 0}
          max={10}
          size={72}
          stroke={5}
          color={`url(#${gid})`}
          track="rgba(255,255,255,0.18)"
          label={
            locked ? null : (
              <span className="font-mx-sans text-[17px] font-semibold tracking-[-0.5px] text-white">
                {(value ?? 0).toFixed(1)}
              </span>
            )
          }
        />
        {locked ? (
          <span className="absolute inset-0 flex items-center justify-center text-white/60">
            <LockIcon size={18} />
          </span>
        ) : null}
      </div>
      <div className="mt-2 text-[11px] font-medium tracking-[0.3px] text-[rgba(255,255,255,0.65)]">
        {label}
      </div>
    </div>
  );
}

// A small verdict stat card: accent dot + uppercase label + serif value + sub
// (iOS verdictCard: radius 18, padding 16, minHeight 118).
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
    <div className={`flex min-h-[118px] flex-col rounded-mx-lg p-4 ${PANE}`}>
      <span className="size-2 rounded-full" style={{ background: dot }} />
      <div className={`mt-2.5 ${KICKER}`}>{label}</div>
      <div
        className="font-mx-serif mt-[5px] text-[20px] leading-tight tracking-[-0.3px]"
        style={{ color: BENTO_INK }}
      >
        {value}
      </div>
      <p className="mt-1.5 text-[11.5px] leading-[15px] text-[#736F7E]">{sub}</p>
    </div>
  );
}

// ─── Mosaic tiles (port of iOS MosaicGrid) ───────────────────────────────────
// Compact 92px tiles in justified wrap rows; tapping a tile expands it to a
// full-width pane with the big serif value, the tag chip and the detail blurb
// (locked tiles expand into the unlock tease instead).

function CompactTile({
  tile,
  locked,
  onToggle,
}: {
  tile: Tile;
  locked: boolean;
  onToggle: () => void;
}) {
  const sc = tile.score != null ? scoreColor(tile.score) : "#16131F";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={false}
      className="flex h-[92px] min-w-[96px] grow basis-[29%] flex-col justify-between overflow-hidden rounded-mx-lg border border-[rgba(20,16,30,0.08)] bg-white p-3.5 text-left shadow-[0_6px_14px_rgba(36,28,58,0.08)]"
    >
      <span className="size-[7px] rounded-full" style={{ background: tile.accent }} />
      <div className="mt-2 truncate text-[12.5px] font-medium tracking-[-0.1px] text-[#16131F]">
        {tile.label}
      </div>
      {locked ? (
        <div className="relative mt-0.5 flex h-6 items-center overflow-hidden rounded-md">
          <span className="font-mx-serif select-none text-[20px] tracking-[1px] text-[#C8C4D2] blur-[1px]">
            •.•
          </span>
          <span className="absolute bottom-0.5 right-0 text-[#6E6A78]">
            <LockIcon size={11} />
          </span>
        </div>
      ) : (
        <div className="mt-0.5 flex items-baseline">
          <span
            className="font-mx-serif truncate text-[20px] tracking-[-0.4px]"
            style={{ color: sc }}
          >
            {tile.value}
          </span>
          {tile.unit ? (
            <span className="ml-0.5 text-[11px] font-medium text-[#6E6A78]">
              {tile.unit}
            </span>
          ) : null}
        </div>
      )}
    </button>
  );
}

function ExpandedTile({
  tile,
  locked,
  onToggle,
  onUnlock,
}: {
  tile: Tile;
  locked: boolean;
  onToggle: () => void;
  onUnlock?: () => void;
}) {
  const sc = tile.score != null ? scoreColor(tile.score) : "#16131F";
  const unlockClasses =
    "mt-0.5 flex items-center gap-1.5 rounded-full bg-[#16131F] px-4 py-2.5 text-[13px] font-semibold tracking-[0.1px] text-white";
  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      className="min-h-[150px] grow basis-full cursor-pointer overflow-hidden rounded-mx-lg border bg-white p-3.5 text-left shadow-[0_6px_14px_rgba(36,28,58,0.08)]"
      style={{ borderColor: `${tile.accent}55` }}
    >
      <div className="flex items-center gap-2">
        <span className="size-[7px] rounded-full" style={{ background: tile.accent }} />
        <span className="text-[15px] font-semibold tracking-[-0.2px] text-[#16131F]">
          {tile.label}
        </span>
      </div>
      {locked ? (
        <div className="mt-4 flex flex-col items-start gap-3">
          <span style={{ color: tile.accent }}>
            <LockIcon size={26} />
          </span>
          <p className="text-[13.5px] leading-[19px] text-[#6E6A78]">
            Unlock your full scan to reveal this score.
          </p>
          {onUnlock ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUnlock();
              }}
              className={unlockClasses}
            >
              <LockOpenIcon size={14} className="text-white" />
              Unlock full results
            </button>
          ) : (
            <Link
              href="/subscribe?src=scan"
              onClick={(e) => e.stopPropagation()}
              className={unlockClasses}
            >
              <LockOpenIcon size={14} className="text-white" />
              Unlock full results
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="mt-3.5 flex flex-wrap items-baseline">
            <span
              className="font-mx-serif text-[40px] leading-[42px] tracking-[-1px]"
              style={{ color: sc }}
            >
              {tile.value}
            </span>
            {tile.unit ? (
              <span className="ml-[3px] text-[15px] font-medium text-[#6E6A78]">
                {tile.unit}
              </span>
            ) : null}
            {tile.tag ? (
              <span
                className="ml-2.5 self-center rounded-full px-2.5 py-1 text-[11.5px] font-semibold tracking-[0.2px]"
                style={{ background: `${tile.accent}1A`, color: tile.accent }}
              >
                {tile.tag}
              </span>
            ) : null}
          </div>
          {tile.detail ? (
            <p className="mt-3 text-[13px] leading-[19px] text-[#6E6A78]">
              {tile.detail}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

// One named mosaic section — its own expand state, like one iOS MosaicGrid.
function MosaicSectionBlock({
  section,
  locked,
  onUnlock,
}: {
  section: Section;
  locked: boolean;
  onUnlock?: () => void;
}) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  return (
    <div className="pt-3">
      <div className="mb-3 text-[13px] font-medium uppercase tracking-[0.6px] text-[#A2A0A8]">
        {section.title}
      </div>
      <div className="flex flex-wrap gap-2.5">
        {section.tiles.map((tile) => {
          const toggle = () =>
            setExpandedKey((cur) => (cur === tile.key ? null : tile.key));
          return expandedKey === tile.key ? (
            <ExpandedTile
              key={tile.key}
              tile={tile}
              locked={locked}
              onToggle={toggle}
              onUnlock={onUnlock}
            />
          ) : (
            <CompactTile key={tile.key} tile={tile} locked={locked} onToggle={toggle} />
          );
        })}
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

/**
 * Full scan breakdown, a faithful web port of iOS FaceScanResults: a
 * full-viewport photo hero (scan photo + corner brackets + dark grade) that
 * dissolves into the white sheet, three ink-glass ring windows floating in a
 * staggered triangle near the hero's base, then the "Your Analysis" sheet
 * (archetype, first move, halo/bottleneck, sex vs trust, dimorphism/glow-up)
 * and the per-feature mosaic. Every card + tile renders its LABEL in both
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
  const sheetRef = useRef<HTMLDivElement>(null);

  const pick = (...vals: unknown[]): string => {
    for (const v of vals) {
      if (typeof v === "string") {
        const s = v.trim();
        if (s) return s;
      }
    }
    return "";
  };

  // Headline scores. Paid users see the anchored/inflated Potential, exactly
  // like iOS (computeDisplayPotential with treatAsPaid).
  const overall = to10(parseOverall(a));
  const base = overall ?? 5;
  const ratingDisplay = clampRating(overall);
  const appealScore = parseAppeal(a, base);
  const rawPotential = parsePotential(
    a,
    Math.min(10, Math.round((base + 0.6) * 10) / 10),
  );
  const potentialDisplay = computeDisplayPotential(rawPotential, !locked, ratingDisplay);
  const glowUpGain =
    ratingDisplay != null
      ? Math.max(0, Math.round((potentialDisplay - ratingDisplay) * 10) / 10)
      : null;
  const ringValues: (number | null)[] = [ratingDisplay, appealScore, potentialDisplay];

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

  // First move — arrays only, like iOS (no suggested_modules fallback).
  const fmSrc: unknown[] = Array.isArray(pr.first_move)
    ? pr.first_move
    : Array.isArray(pi.first_move)
      ? pi.first_move
      : Array.isArray(a.first_move)
        ? a.first_move
        : [];
  const firstMoveArr = fmSrc
    .map((x) => String(x).trim())
    .filter(Boolean)
    .slice(0, 2);
  const firstMoveTitle = firstMoveArr.length ? formatModuleTitle(firstMoveArr[0]) : "";

  const archLine = archetypeLine(archetype, ratingDisplay);
  const sections = buildMosaic(a, locked, archetype, pslTier);

  return (
    <div className="mx-auto w-full max-w-[460px]">
      {/* Hover bop + scroll-cue bob (iOS HoverCard / ScrollCue). */}
      <style>{`
        @keyframes mxsr-bop { from { transform: translateY(-5px); } to { transform: translateY(5px); } }
        .mxsr-bop { animation: mxsr-bop 1.7s ease-in-out infinite alternate; }
        @keyframes mxsr-cue { from { transform: translateY(-3px); opacity: 0.85; } to { transform: translateY(6px); opacity: 0.35; } }
        .mxsr-cue { animation: mxsr-cue 0.95s ease-in-out infinite alternate; }
        @media (prefers-reduced-motion: reduce) { .mxsr-bop, .mxsr-cue { animation: none; } }
      `}</style>

      {/* ── Photo hero — full-viewport portrait, edge-to-edge (no corner
          radius on iOS), that melts into the white sheet below. ─────────── */}
      <div className="relative w-full overflow-hidden bg-[#1A1A1A] aspect-[9/19.5]">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt="Your scan"
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}

        {/* iOS 4-stop dark grade over the photo */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.06) 42%, rgba(0,0,0,0.16) 70%, rgba(0,0,0,0.30) 100%)",
          }}
        />

        {/* Face-framing corner brackets (40px arms, 2.5px, radius 12) */}
        <div className="pointer-events-none absolute left-[24%] right-[24%] top-[30%] h-[30%]">
          <span className="absolute left-0 top-0 size-10 rounded-tl-[12px] border-l-[2.5px] border-t-[2.5px] border-white/50" />
          <span className="absolute right-0 top-0 size-10 rounded-tr-[12px] border-r-[2.5px] border-t-[2.5px] border-white/50" />
          <span className="absolute bottom-0 left-0 size-10 rounded-bl-[12px] border-b-[2.5px] border-l-[2.5px] border-white/50" />
          <span className="absolute bottom-0 right-0 size-10 rounded-br-[12px] border-b-[2.5px] border-r-[2.5px] border-white/50" />
        </div>

        {/* White dissolve — long ramp into the sheet, pure white at the base */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.04) 18%, rgba(255,255,255,0.12) 34%, rgba(255,255,255,0.28) 48%, rgba(255,255,255,0.5) 60%, rgba(255,255,255,0.78) 70%, #FFFFFF 78%, #FFFFFF 100%)",
          }}
        />

        {/* 3 floating ring windows — downward triangle (center 18px lower),
            gently bopping out of phase. Locked = ALL rings locked (iOS). */}
        <div className="absolute inset-x-5 bottom-[17%] grid grid-cols-3 items-start gap-2.5">
          {RING_METRICS.map((m, i) => (
            <div key={m.key} style={i === 1 ? { transform: "translateY(18px)" } : undefined}>
              <div className="mxsr-bop" style={{ animationDelay: `${i * 260}ms` }}>
                <RingWindow
                  label={m.label}
                  value={ringValues[i]}
                  from={m.from}
                  to={m.to}
                  gid={`mxsr-ring-${m.key}`}
                  locked={locked}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Scroll cue — bobbing chevron in the white run at the hero's base */}
        <button
          type="button"
          aria-label="Scroll to your analysis"
          onClick={() =>
            sheetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
          className="absolute inset-x-0 bottom-[66px] flex justify-center text-[rgba(21,19,26,0.55)]"
        >
          <span className="mxsr-cue">
            <ChevronDownIcon size={26} />
          </span>
        </button>
      </div>

      {/* ── "Your Analysis" sheet (iOS: white, px 20, 16px above the title) ── */}
      <div ref={sheetRef} className="flex flex-col gap-3 bg-white px-5 pb-12 pt-4">
        <h2
          className="font-mx-serif mb-2 text-[28px] tracking-[-0.8px]"
          style={{ color: BENTO_INK }}
        >
          Your Analysis
        </h2>

        {/* Archetype (glass pane radius 20, padding 18) */}
        <div className={`rounded-[20px] p-[18px] ${PANE}`}>
          <div className={KICKER}>Your archetype</div>
          {locked ? (
            <>
              <div
                className="font-mx-serif mt-[7px] text-[30px] leading-[34px] tracking-[-0.6px]"
                style={{ color: BENTO_INK }}
              >
                —
              </div>
              <p className="mt-[9px] text-[13px] leading-[19px] text-[#736F7E]">
                Unlock to reveal which archetype your face reads as.
              </p>
            </>
          ) : archetype ? (
            <>
              <div
                className="font-mx-serif mt-[7px] text-[30px] leading-[34px] tracking-[-0.6px]"
                style={{ color: BENTO_INK }}
              >
                {archetype}
              </div>
              {archLine ? (
                <p className="mt-[9px] text-[13px] leading-[19px] text-[#736F7E]">
                  {archLine}
                </p>
              ) : null}
            </>
          ) : (
            <>
              <div
                className="font-mx-serif mt-[7px] text-[30px] leading-[34px] tracking-[-0.6px]"
                style={{ color: BENTO_INK }}
              >
                Not measured
              </div>
              <p className="mt-[9px] text-[13px] leading-[19px] text-[#736F7E]">
                This scan didn&apos;t return an archetype.
              </p>
            </>
          )}
        </div>

        {/* Your first move — dark ink pane, radius 22 (extra 6px above, iOS) */}
        <div className="bg-mx-ink mt-1.5 rounded-mx-xl p-5 text-white shadow-[0_6px_12px_rgba(58,53,43,0.13)]">
          <div className="text-[11px] font-semibold uppercase tracking-[1.2px] text-white/55">
            Your first move
          </div>
          {locked ? (
            <div className="mt-1.5 flex items-center gap-2">
              <LockIcon size={19} className="text-white" />
              <span className="font-mx-serif text-[28px] leading-none tracking-[-0.5px]">
                Locked
              </span>
            </div>
          ) : (
            <div className="font-mx-serif mt-1.5 text-[28px] leading-none tracking-[-0.5px]">
              {firstMoveTitle || "Not measured"}
            </div>
          )}
          <p className="mt-1.5 text-[12.5px] text-white/50">
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
                ? `Fix it with ${formatModuleTitle(bottleneckMax)}.`
                : "What is holding you back."
            }
          />
        </div>

        {/* Sex appeal vs Trust appeal (radius 18, padding 18) */}
        <div className={`rounded-mx-lg p-[18px] ${PANE}`}>
          <div className={KICKER}>Sex appeal vs Trust appeal</div>
          <div className="mt-3 flex items-center">
            <div className="flex-1 text-center">
              <div
                className="font-mx-serif text-[30px] tracking-[-0.5px]"
                style={{ color: BENTO_INK }}
              >
                {locked ? "—" : (sexAppeal ?? 0).toFixed(1)}
              </div>
              <div className="mt-0.5 text-[11.5px] font-medium text-[#736F7E]">
                Sex appeal
              </div>
            </div>
            <div className="w-px self-stretch bg-black/10" />
            <div className="flex-1 text-center">
              <div
                className="font-mx-serif text-[30px] tracking-[-0.5px]"
                style={{ color: BENTO_INK }}
              >
                {locked ? "—" : (trustAppeal ?? 0).toFixed(1)}
              </div>
              <div className="mt-0.5 text-[11.5px] font-medium text-[#736F7E]">
                Trust appeal
              </div>
            </div>
          </div>
          {!locked && appealQuadrant ? (
            <div className="mt-3.5 text-center text-[13.5px] font-semibold text-[#B0556F]">
              {appealQuadrant}
            </div>
          ) : null}
        </div>

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
          <MosaicSectionBlock
            key={sec.key}
            section={sec}
            locked={locked}
            onUnlock={locked ? onUnlock : undefined}
          />
        ))}

        <p className="text-mx-muted text-center text-[9px] opacity-30">
          For general wellness only. Not medical advice.
        </p>

        {/* Unlock CTA */}
        {locked ? (
          onUnlock ? (
            <button
              onClick={onUnlock}
              className="bg-mx-ink mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full text-[14px] font-semibold tracking-[0.3px] text-white transition hover:opacity-90"
            >
              <LockOpenIcon size={17} className="text-white" />
              {ctaLabel}
            </button>
          ) : (
            <Link
              href="/subscribe?src=scan"
              className="bg-mx-ink mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full text-[14px] font-semibold tracking-[0.3px] text-white transition hover:opacity-90"
            >
              <LockOpenIcon size={17} className="text-white" />
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
