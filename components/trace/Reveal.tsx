"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Scroll-reveal wrapper (fade + rise, quint ease) matching the target. */
export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          const t = setTimeout(() => el.classList.add("tr-in"), delay);
          io.disconnect();
          return () => clearTimeout(t);
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return (
    <div ref={ref} className={`tr-reveal ${className}`}>
      {children}
    </div>
  );
}
