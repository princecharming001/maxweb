"use client";

import type { VisualBlock } from "@/lib/max/api";

function Title({ title }: { title?: unknown }) {
  if (!title || typeof title !== "string") return null;
  return <div className="text-mx-ink mb-2 text-[13px] font-semibold">{title}</div>;
}

function CardWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-mx-surface-light rounded-mx-md border border-mx-border mt-2 p-3.5">
      {children}
    </div>
  );
}

export function VisualBlockRenderer({ block }: { block: VisualBlock }) {
  const data = (block.data ?? {}) as Record<string, unknown>;

  switch (block.type) {
    case "table": {
      const columns = (data.columns as string[]) ?? [];
      const rows = (data.rows as string[][]) ?? [];
      if (!rows.length) return null;
      return (
        <CardWrap>
          <Title title={block.title} />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="border-mx-border border-b">
                  {columns.map((c, i) => (
                    <th
                      key={i}
                      className="text-mx-muted px-2 py-1.5 text-left font-medium"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, ri) => (
                  <tr key={ri} className="border-mx-border/60 border-b last:border-0">
                    {r.map((cell, ci) => (
                      <td key={ci} className="text-mx-ink px-2 py-1.5">
                        {cell}
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
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(options.length, 3)}, minmax(0,1fr))` }}>
            {options.slice(0, 3).map((o, i) => (
              <div key={i} className="min-w-0">
                <div className="text-mx-ink mb-1.5 text-[13px] font-semibold">
                  {o.name ?? `Option ${i + 1}`}
                </div>
                {(o.pros ?? []).map((p, pi) => (
                  <div key={`p${pi}`} className="text-mx-ink-2 flex gap-1.5 text-[12px]">
                    <span className="text-mx-success">+</span>
                    {p}
                  </div>
                ))}
                {(o.cons ?? []).map((c, ci) => (
                  <div key={`c${ci}`} className="text-mx-muted flex gap-1.5 text-[12px]">
                    <span>–</span>
                    {c}
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
          <div className="relative">
            {steps.map((st, i) => (
              <div key={i} className="flex gap-3 pb-3 last:pb-0">
                <div className="relative flex flex-col items-center">
                  <span className="bg-mx-accent mt-1 size-2.5 rounded-full" />
                  {i < steps.length - 1 ? (
                    <span className="bg-mx-border w-px flex-1" />
                  ) : null}
                </div>
                <div>
                  <div className="text-mx-ink text-[13px] font-medium">
                    {st.label}
                  </div>
                  {st.detail ? (
                    <div className="text-mx-muted text-[12px]">{st.detail}</div>
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
          {steps.map((st, i) => (
            <div key={i}>
              <div className="bg-mx-card rounded-mx-sm border border-mx-border px-3 py-2">
                <div className="text-mx-ink text-[13px] font-medium">{st.label}</div>
                {st.note ? (
                  <div className="text-mx-muted text-[12px]">{st.note}</div>
                ) : null}
              </div>
              {i < steps.length - 1 ? (
                <div className="text-mx-muted py-1 text-center text-[13px]">↓</div>
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
      return (
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {cards.slice(0, 4).map((c, i) => (
            <div
              key={i}
              className="bg-mx-surface-light rounded-mx-md border border-mx-border flex items-baseline gap-2 px-3.5 py-2.5"
            >
              <span className="text-mx-ink text-[18px] font-semibold">
                {c.value}
              </span>
              <span className="text-mx-muted text-[12px]">
                {c.label}
                {c.hint ? ` · ${c.hint}` : ""}
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
          {items.map((it, i) => (
            <div key={i} className="flex items-center gap-2 py-0.5">
              <span
                className={`inline-block size-3.5 rounded-full border ${
                  it.done
                    ? "border-mx-success bg-mx-success"
                    : "border-mx-muted"
                }`}
              />
              <span className="text-mx-ink text-[13px]">{it.text}</span>
            </div>
          ))}
        </CardWrap>
      );
    }
    default:
      return null;
  }
}
