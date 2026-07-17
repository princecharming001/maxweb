"use client";

/**
 * CourseReaderView — web port of the iOS course reader surfaces.
 *
 * Combines three mobile screens into one route-level view, pulling from the
 * SAME bundled course content as iOS (`lib/max/courses`):
 *   • CourseHero      → the header (eyebrow · byline · serif title · stats)
 *   • CourseTimeline  → the "Course path" (chapter list → lesson rows)
 *   • CourseReader    → the full-screen lesson pager overlay
 *
 * Chapter rows open the pager at the chapter's first lesson; lesson rows open
 * it at that exact lesson. The pager flows seamlessly across chapter
 * boundaries (via `flattenSections`) exactly like the native FlatList.
 */
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  flattenSections,
  isCreatorCourse,
  type CourseModule,
} from "@/lib/max/courses/courseContent";
import { hexA } from "@/components/max/explore/detail-parts";

/* ── Local inline icons (currentColor / explicit color) ─────────────────── */
function IconChevronLeft({ className = "size-5", color }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke={color ?? "currentColor"} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m15 6-6 6 6 6" />
    </svg>
  );
}
function IconArrowLeft({ className = "size-[18px]", color }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke={color ?? "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}
function IconArrowRight({ className = "size-[18px]", color }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke={color ?? "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
function IconClose({ className = "size-5", color }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke={color ?? "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

/** "3 min" / "2 min" → 3 / 2. Non-numeric → 0. */
function etaMinutes(eta?: string): number {
  const m = /(\d+)/.exec(eta || "");
  return m ? parseInt(m[1], 10) : 0;
}

export default function CourseReaderView({
  course,
  itemId,
}: {
  course: CourseModule;
  itemId: string;
}) {
  const accent = course.accent;
  const creator = isCreatorCourse(course) ? course.creator : null;

  // One flat, ordered lesson list — the pager index space (mirrors iOS).
  const slides = useMemo(() => flattenSections(course), [course]);
  const indexOfSection = useMemo(() => {
    const m = new Map<string, number>();
    slides.forEach((s, i) => m.set(s.section.id, i));
    return m;
  }, [slides]);

  // Header stats: chapters · lessons · minutes (same math as CourseHero).
  const lessonCount = slides.length;
  const totalMin = useMemo(
    () =>
      course.chapters.reduce(
        (sum, ch) => sum + ch.sections.reduce((s, sec) => s + etaMinutes(sec.eta), 0),
        0,
      ),
    [course],
  );
  const stats: { number: number | string; label: string }[] = [
    { number: course.chapters.length, label: "Chapters" },
    { number: lessonCount, label: "Lessons" },
    { number: totalMin || "—", label: totalMin ? "Minutes" : "Time" },
  ];

  const title =
    course.title ?? itemId.charAt(0).toUpperCase() + itemId.slice(1);

  /* ── Reader overlay (null = closed) ─────────────────────────────────── */
  const [readerIndex, setReaderIndex] = useState<number | null>(null);
  const openAtSection = useCallback(
    (sectionId: string) => setReaderIndex(indexOfSection.get(sectionId) ?? 0),
    [indexOfSection],
  );
  const close = useCallback(() => setReaderIndex(null), []);
  const goPrev = useCallback(
    () => setReaderIndex((i) => (i === null ? i : Math.max(0, i - 1))),
    [],
  );
  const goNext = useCallback(
    () =>
      setReaderIndex((i) =>
        i === null ? i : Math.min(slides.length - 1, i + 1),
      ),
    [slides.length],
  );

  // Keyboard: ← / → page, Esc closes. Lock body scroll while open.
  useEffect(() => {
    if (readerIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [readerIndex, goPrev, goNext, close]);

  const current = readerIndex === null ? null : slides[readerIndex];
  const atStart = readerIndex !== null && readerIndex <= 0;
  const atEnd = readerIndex !== null && readerIndex >= slides.length - 1;
  const progress = readerIndex === null ? 0 : (readerIndex + 1) / slides.length;

  return (
    <div>
      {/* ── Header (CourseHero) ──────────────────────────────────────────── */}
      <div className="relative">
        <Link
          href={`/app/explore/${itemId}`}
          aria-label="Back"
          className="text-mx-ink -ml-1 mb-4 inline-flex size-8 items-center justify-center"
        >
          <IconChevronLeft className="size-5" />
        </Link>

        {/* soft brand bloom behind the title block */}
        <div
          className="pointer-events-none absolute inset-x-0 -top-2 h-[120px] rounded-full opacity-70 blur-2xl"
          style={{
            background: `radial-gradient(60% 100% at 30% 0%, ${hexA(accent, 0.18)} 0%, transparent 70%)`,
          }}
        />

        <div className="relative">
          <div className="mb-[14px] flex items-center gap-[7px]">
            <span className="size-[6px] rounded-full" style={{ background: accent }} />
            <span className="text-mx-ink-2 text-[11px] font-semibold uppercase tracking-[2px]">
              {creator ? "Creator course" : "Course"}
            </span>
          </div>

          {creator ? (
            <div className="mb-2.5 flex items-center gap-[5px]">
              <span className="text-mx-muted text-[11px] font-semibold uppercase tracking-[1.6px]">
                By {creator.name}
              </span>
              {creator.verified ? (
                <svg viewBox="0 0 24 24" className="size-[13px]" fill={accent} aria-hidden>
                  <path d="M12 2 9.8 4.2 6.7 4l-1 3-3 1 1.3 2.9-1.3 3 3 1 1 3 3.1-.2L12 22l2.2-2.2 3.1.2 1-3 3-1-1.3-3 1.3-2.9-3-1-1-3-3.1.2z" />
                  <path d="m8.5 12 2.2 2.2L15.5 9.5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : null}
            </div>
          ) : null}

          <h1 className="font-mx-serif text-mx-ink text-[40px] leading-[1.1] tracking-[-0.03em]">
            {title}
          </h1>

          {course.subtitle ? (
            <p className="text-mx-ink-2 mt-3.5 max-w-[380px] text-[15.5px] leading-[23px]">
              {course.subtitle}
            </p>
          ) : null}

          <div className="mt-7 flex">
            {stats.map((s, i) => (
              <div key={s.label} className={i > 0 ? "ml-10" : ""}>
                <div className="text-mx-ink text-[30px] font-semibold leading-[34px] tracking-[-0.02em]">
                  {s.number}
                </div>
                <div className="text-mx-muted mt-1.5 text-[10.5px] font-medium uppercase tracking-[1.5px]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Course path (CourseTimeline) ─────────────────────────────────── */}
      <div className="mt-10">
        <div className="text-mx-muted mb-6 text-[11px] font-semibold uppercase tracking-[1.8px]">
          Course path
        </div>

        {course.chapters.map((ch, i) => {
          const isFirst = i === 0;
          const isLast = i === course.chapters.length - 1;
          const numLabel = ch.number.toString().padStart(2, "0");
          const firstSectionId = ch.sections[0]?.id;

          return (
            <div key={ch.id} className="relative flex">
              {/* left rail: continuous spine + node */}
              <div className="relative flex w-[44px] shrink-0 justify-center">
                {!isFirst ? (
                  <span
                    className="absolute left-1/2 top-0 h-[30px] w-[2px] -translate-x-1/2 rounded"
                    style={{ background: hexA(accent, 0.3) }}
                  />
                ) : null}
                {!isLast ? (
                  <span
                    className="absolute bottom-0 left-1/2 top-[30px] w-[2px] -translate-x-1/2 rounded"
                    style={{ background: hexA(accent, 0.3) }}
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => firstSectionId && openAtSection(firstSectionId)}
                  aria-label={`Open chapter ${ch.number}: ${ch.title}`}
                  className="relative mt-2 flex size-[40px] items-center justify-center rounded-full transition active:scale-95"
                  style={{
                    background: isFirst ? accent : "var(--mx-card)",
                    border: isFirst ? "none" : `2px solid ${hexA(accent, 0.35)}`,
                  }}
                >
                  <span
                    className="font-mx-sans text-[16px] font-semibold"
                    style={{ color: isFirst ? "#fff" : accent }}
                  >
                    {ch.number}
                  </span>
                </button>
              </div>

              {/* right: chapter content */}
              <div className={`ml-3 flex-1 ${isLast ? "pb-4" : "pb-7"}`}>
                <button
                  type="button"
                  onClick={() => firstSectionId && openAtSection(firstSectionId)}
                  className="block w-full pt-0.5 text-left"
                >
                  <div className="text-[10.5px] font-semibold tracking-[1.4px]" style={{ color: accent }}>
                    CHAPTER {numLabel}
                  </div>
                  <h3 className="font-mx-serif text-mx-ink mt-1.5 text-[22px] leading-[27px] tracking-[-0.01em]">
                    {ch.title}
                  </h3>
                  <p className="text-mx-ink-2 mt-[5px] text-[13.5px] leading-[19px]">
                    {ch.subtitle}
                  </p>
                </button>

                <div className="mt-4">
                  {ch.sections.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => openAtSection(s.id)}
                      className={`flex w-full items-center py-[11px] text-left transition active:opacity-60 ${
                        idx > 0 ? "border-t border-black/[0.06]" : ""
                      }`}
                    >
                      <span
                        className="font-mx-sans w-[34px] shrink-0 text-[12.5px] font-medium tracking-[0.2px]"
                        style={{ color: accent }}
                      >
                        {s.number}
                      </span>
                      <span className="text-mx-ink flex-1 truncate text-[14.5px] tracking-[-0.01em]">
                        {s.title}
                      </span>
                      {s.eta ? (
                        <span className="text-mx-muted ml-2 shrink-0 text-[11.5px]">{s.eta}</span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Reader overlay (CourseReader) ────────────────────────────────── */}
      {current ? (
        <div className="bg-mx-card fixed inset-0 z-50 flex flex-col">
          <div className="mx-auto flex size-full max-w-[460px] flex-col px-5">
            {/* top bar */}
            <div className="flex items-center justify-end pb-1.5 pt-4">
              <button
                type="button"
                onClick={close}
                aria-label="Close reader"
                className="text-mx-ink-2 flex size-[30px] items-center justify-center"
              >
                <IconClose className="size-5" />
              </button>
            </div>
            <div className="pb-5">
              <div className="text-mx-ink mb-2.5 text-[15px] font-semibold tracking-[-0.01em]">
                {current.chapter.title}
              </div>
              <span className="block h-[2px] w-[28px] rounded-full" style={{ background: accent }} />
            </div>

            {/* slide body */}
            <div className="flex-1 overflow-y-auto pb-4">
              <div className="text-[11px] font-semibold tracking-[1.8px]" style={{ color: accent }}>
                {current.section.number.toUpperCase()}
                {current.section.eta ? `   ·   ${current.section.eta.toUpperCase()}` : ""}
              </div>

              <h2 className="font-mx-serif text-mx-ink mt-3.5 text-[34px] leading-[40px] tracking-[-0.02em]">
                {current.section.title}
              </h2>
              <p className="text-mx-ink-2 mb-5 mt-2.5 text-[16px] leading-[24px]">
                {current.section.subtitle}
              </p>

              <div className="mt-1">
                {current.section.bullets.map((b, i) => (
                  <div key={i} className="flex items-start py-2">
                    <span
                      className="mr-3.5 mt-[9px] size-1 shrink-0 rounded-full"
                      style={{ background: accent }}
                    />
                    <span className="text-mx-ink flex-1 text-[15px] leading-[22px] tracking-[-0.01em]">
                      {b}
                    </span>
                  </div>
                ))}
              </div>

              {current.section.body ? (
                <p className="text-mx-ink-2 mt-5 text-[15px] leading-[23px]">
                  {current.section.body}
                </p>
              ) : null}
            </div>

            {/* bottom controls */}
            <div className="pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3">
              <div className="mb-2.5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={atStart}
                  aria-label="Previous lesson"
                  className="flex size-9 items-center justify-center disabled:opacity-40"
                >
                  <IconArrowLeft className="size-[18px]" color={atStart ? "var(--mx-muted)" : "var(--mx-ink)"} />
                </button>

                <span className="font-mx-sans text-mx-ink-2 text-[12px] tracking-[1.4px]">
                  <span className="text-mx-ink font-semibold">{readerIndex! + 1}</span>
                  <span className="text-mx-muted"> / </span>
                  {slides.length}
                </span>

                <button
                  type="button"
                  onClick={goNext}
                  disabled={atEnd}
                  aria-label="Next lesson"
                  className="flex size-9 items-center justify-center disabled:opacity-40"
                >
                  <IconArrowRight className="size-[18px]" color={atEnd ? "var(--mx-muted)" : accent} />
                </button>
              </div>

              <div className="bg-mx-border h-px overflow-hidden">
                <div className="h-full transition-[width] duration-300" style={{ width: `${progress * 100}%`, background: accent }} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
