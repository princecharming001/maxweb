"use client";

import type { VisualBlock } from "@/lib/max/api";

// Mirror of backend api/chat.py::_extract_visual_blocks. The prod backend
// normally strips [VISUAL_BLOCK]{json}[/VISUAL_BLOCK] markers out of the reply
// and returns a structured `visual_blocks[]`, but when the deployed backend
// lags (or the marker survives), the raw JSON leaks into the chat text. This
// client-side fallback parses + strips it so the web still renders the visual.
const ALLOWED_BLOCK_TYPES = new Set([
  "table",
  "comparison",
  "timeline",
  "flowchart",
  "stat_cards",
  "checklist",
]);
const VISUAL_BLOCK_RE = /\[visual_block\]\s*([\s\S]*?)\s*\[\/visual_block\]/gi;

/** Pull inline [visual_block] markers out of assistant text. Returns the clean
 *  prose (markers removed, incl. any truncated/unclosed one) and parsed blocks. */
export function extractVisualBlocks(text: string): {
  clean: string;
  blocks: VisualBlock[];
} {
  if (!text || !/\[visual_block\]/i.test(text)) return { clean: text, blocks: [] };
  const blocks: VisualBlock[] = [];
  VISUAL_BLOCK_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = VISUAL_BLOCK_RE.exec(text))) {
    const raw = (m[1] || "").trim();
    let obj: Record<string, unknown> | null = null;
    try {
      obj = JSON.parse(raw);
    } catch {
      // LLMs sometimes embed literal control chars inside JSON strings.
      try {
        obj = JSON.parse(
          raw
            // eslint-disable-next-line no-control-regex
            .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, " ")
            .replace(/[\n\r\t]/g, " "),
        );
      } catch {
        continue;
      }
    }
    const btype = String(obj?.type ?? "").trim().toLowerCase();
    const data = obj?.data;
    if (ALLOWED_BLOCK_TYPES.has(btype) && data && typeof data === "object") {
      blocks.push({
        type: btype,
        title: obj?.title ? String(obj.title).trim() : undefined,
        data,
      } as VisualBlock);
    }
  }
  let clean = text.replace(VISUAL_BLOCK_RE, "");
  // Drop any unclosed/truncated marker (streamed reply cut mid-JSON) + stray
  // method_confidence markers, then collapse the blank lines they leave behind.
  clean = clean.replace(/\[visual_block\][\s\S]*/i, "");
  clean = clean.replace(/\[\/?method_confidence\]/gi, "");
  clean = clean.replace(/\n{3,}/g, "\n\n").trim();
  return { clean, blocks: blocks.slice(0, 6) };
}

function Title({ title }: { title?: unknown }) {
  if (!title || typeof title !== "string") return null;
  // iOS blockTitle: Matter-SemiBold 13.5, ink, letterSpacing 0.2, mb 8.
  return (
    <div className="text-mx-ink mb-2 text-[13.5px] font-semibold tracking-[0.2px]">
      {title}
    </div>
  );
}

// iOS card: WHITE ground (not gray), radius 14 continuous, padding 12, hairline.
function CardWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-mx-card rounded-mx-md border border-mx-border mt-2 p-3">
      {children}
    </div>
  );
}

/* ── SVG stand-ins for the Ionicons the iOS renderer uses (no emojis). ────── */

// Ionicons add-circle / remove-circle: filled disc, white +/− glyph.
function CircleGlyph({ minus, className }: { minus?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="currentColor" />
      <path d="M4.7 8h6.6" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" fill="none" />
      {!minus ? (
        <path d="M8 4.7v6.6" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" fill="none" />
      ) : null}
    </svg>
  );
}

// Ionicons arrow-down: stem + chevron head.
function ArrowDownGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden="true">
      <path
        d="M8 2.8v10.4M3.9 9.4 8 13.4l4.1-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Ionicons checkmark-circle (filled, white check) / ellipse-outline (thin ring).
function CheckGlyph({ done, className }: { done?: boolean; className?: string }) {
  return done ? (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="currentColor" />
      <path
        d="M4.9 8.4 7 10.5l4.2-5"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="6.9" fill="none" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

export function VisualBlockRenderer({ block }: { block: VisualBlock }) {
  const data = (block.data ?? {}) as Record<string, unknown>;

  switch (block.type) {
    case "table": {
      const columns = (data.columns as string[]) ?? [];
      const rows = (data.rows as string[][]) ?? [];
      if (!columns.length || !rows.length) return null;
      // iOS: ink SEMIBOLD headers (not muted) over a 0.14 hairline, zebra rows
      // (no per-row borders), 12.5px text, body cells in secondary ink.
      return (
        <CardWrap>
          <Title title={block.title} />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr className="border-b border-black/[0.14]">
                  {columns.map((c, i) => (
                    <th
                      key={i}
                      className={`${i === 0 ? "min-w-[96px]" : "min-w-[84px]"} text-mx-ink px-2 pt-0 pb-1.5 text-left font-semibold`}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="[&>tr:first-child>td]:pt-[9px]">
                {rows.map((r, ri) => (
                  <tr key={ri} className="even:bg-black/[0.02]">
                    {columns.map((_, ci) => (
                      <td
                        key={ci}
                        className={`${ci === 0 ? "min-w-[96px]" : "min-w-[84px]"} text-mx-ink-2 px-2 py-[5px]`}
                      >
                        {r[ci] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardWrap>
      );
    }
    case "comparison": {
      const options =
        (data.options as { name?: string; pros?: string[]; cons?: string[] }[]) ??
        [];
      if (!options.length) return null;
      return (
        <CardWrap>
          <Title title={block.title} />
          {/* iOS: flexed columns, px 8 each, hairline divider from col 2 on;
              filled add/remove-circle icons; pros in ink, cons in secondary. */}
          <div className="grid" style={{ gridTemplateColumns: `repeat(${Math.min(options.length, 3)}, minmax(0,1fr))` }}>
            {options.slice(0, 3).map((o, i) => (
              <div
                key={i}
                className={`min-w-0 px-2 ${i > 0 ? "border-mx-border border-l" : ""}`}
              >
                <div className="text-mx-ink mb-1.5 text-[13px] font-semibold">
                  {o.name ?? `Option ${i + 1}`}
                </div>
                {(o.pros ?? []).map((p, pi) => (
                  <div key={`p${pi}`} className="mb-1 flex items-start gap-[5px] text-[12px] leading-4">
                    <CircleGlyph className="text-mx-success mt-[1.5px] size-[13px] shrink-0" />
                    <span className="text-mx-ink min-w-0 flex-1">{p}</span>
                  </div>
                ))}
                {(o.cons ?? []).map((c, ci) => (
                  <div key={`c${ci}`} className="mb-1 flex items-start gap-[5px] text-[12px] leading-4">
                    <CircleGlyph minus className="text-mx-muted mt-[1.5px] size-[13px] shrink-0" />
                    <span className="text-mx-ink-2 min-w-0 flex-1">{c}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardWrap>
      );
    }
    case "timeline": {
      const steps = (data.steps as { label?: string; detail?: string }[]) ?? [];
      if (!steps.length) return null;
      return (
        <CardWrap>
          <Title title={block.title} />
          {/* iOS: 18px centered rail, 9px GOLD dot (#C29A4E — not the blue
              accent), 2px hairline spine, body pl 4 / pb 12 on every row. */}
          <div>
            {steps.map((st, i) => (
              <div key={i} className="flex">
                <div className="flex w-[18px] shrink-0 flex-col items-center">
                  <span className="mt-[3px] size-[9px] shrink-0 rounded-full bg-[#C29A4E]" />
                  {i < steps.length - 1 ? (
                    <span className="bg-mx-border mt-[2px] w-[2px] flex-1" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 pb-3 pl-1">
                  <div className="text-mx-ink text-[13px] font-semibold">
                    {st.label}
                  </div>
                  {st.detail ? (
                    <div className="text-mx-ink-2 mt-0.5 text-[12.5px] leading-[17px]">
                      {st.detail}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </CardWrap>
      );
    }
    case "flowchart": {
      const raw = (data.steps as (string | { label?: string; note?: string })[]) ?? [];
      const steps = raw.map((st) => (typeof st === "string" ? { label: st } : st));
      if (!steps.length) return null;
      return (
        <CardWrap>
          <Title title={block.title} />
          {/* iOS: #F6F5F2 chip (radius 10, py 9 / px 12), CENTERED semibold
              label + 11.5px muted note, arrow-down icon between nodes. */}
          {steps.map((st, i) => (
            <div key={i}>
              <div className="rounded-mx-sm border-mx-border border bg-[#F6F5F2] px-3 py-[9px] text-center">
                <div className="text-mx-ink text-[13px] font-semibold">{st.label}</div>
                {st.note ? (
                  <div className="text-mx-muted mt-0.5 text-[11.5px]">{st.note}</div>
                ) : null}
              </div>
              {i < steps.length - 1 ? (
                <div className="text-mx-muted flex justify-center py-0.5">
                  <ArrowDownGlyph className="size-[15px]" />
                </div>
              ) : null}
            </div>
          ))}
        </CardWrap>
      );
    }
    case "stat_cards": {
      const cards =
        (data.cards as { value?: string; label?: string; hint?: string }[]) ?? [];
      if (!cards.length) return null;
      // iOS: NO opaque card — a vertical stack (gap 7) of one-line liquid-glass
      // pills (radius 13, py 9 / px 14) floating on the white chat surface.
      // Value leads at 16px/700 tabular-nums in CHAT ink #0D0D0D; the label
      // trails at 14px #8E8E93, baseline-aligned, single line.
      return (
        <div className="mt-2 flex flex-col gap-[7px]">
          {cards.slice(0, 4).map((c, i) => (
            <div
              key={i}
              className="flex items-baseline gap-2.5 rounded-[13px] border border-white/60 bg-[rgba(246,247,251,0.78)] px-3.5 py-[9px] shadow-[0_10px_24px_rgba(58,51,88,0.14)] backdrop-blur-md"
            >
              <span className="whitespace-nowrap text-[16px] font-bold tracking-[-0.2px] text-[#0D0D0D] tabular-nums">
                {c.value}
              </span>
              <span className="min-w-0 flex-1 truncate text-[14px] text-[#8E8E93]">
                {c.label}
                {c.hint ? ` · ${c.hint}` : ""}
              </span>
            </div>
          ))}
        </div>
      );
    }
    case "checklist": {
      const raw = (data.items as (string | { text?: string; done?: boolean })[]) ?? [];
      const items = raw.map((it) =>
        typeof it === "string" ? { text: it, done: false } : it,
      );
      if (!items.length) return null;
      return (
        <CardWrap>
          <Title title={block.title} />
          {/* iOS: 17px checkmark-circle (green, filled, white check) when done,
              thin muted outline ring otherwise; gap 9, py 4. */}
          {items.map((it, i) => (
            <div key={i} className="flex items-center gap-[9px] py-1">
              <CheckGlyph
                done={!!it.done}
                className={`size-[17px] shrink-0 ${it.done ? "text-mx-success" : "text-mx-muted"}`}
              />
              <span className="text-mx-ink min-w-0 flex-1 text-[13px] leading-[18px]">
                {it.text}
              </span>
            </div>
          ))}
        </CardWrap>
      );
    }
    default:
      return null;
  }
}
