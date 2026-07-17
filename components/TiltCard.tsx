"use client";

import { useRef, type ReactNode } from "react";

/**
 * Pointer-follow tilt, matching the target's founder cards: the article
 * carries perspective:900px and the inner face rotates a few degrees
 * toward the cursor, easing back on leave (transition 200ms ease-out).
 */
export default function TiltCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const face = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = face.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateY(${px * 7}deg) rotateX(${py * -7}deg)`;
  };

  const onLeave = () => {
    const el = face.current;
    if (el) el.style.transform = "";
  };

  return (
    <article
      style={{ perspective: "900px" }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div
        ref={face}
        className={`transition-transform duration-200 ease-out will-change-transform ${className}`}
      >
        {children}
      </div>
    </article>
  );
}
