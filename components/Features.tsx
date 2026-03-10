"use client";

import { useEffect, useRef, useState } from "react";

const maxes = [
  {
    name: "fitmax",
    description: "Tailored workouts, posture cues, and body recomp plans that adapt weekly.",
  },
  {
    name: "skinmax",
    description: "Custom routines for your skin type, climate, and problem areas.",
  },
  {
    name: "heightmax",
    description: "Posture optimization, stretching protocols, and growth-phase nutrition.",
  },
  {
    name: "hairmax",
    description: "Wash cycles, product stacks, and styling matched to your hair type.",
  },
  {
    name: "bonemax",
    description: "Mewing, jaw exercises, and protocols for reshaping facial structure over time.",
  },
];

export default function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.08 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="py-32 px-6" ref={sectionRef}>
      <div className="max-w-2xl mx-auto">
        <div className={visible ? "animate-fade-in-up" : "opacity-0"}>
          <p className="text-[13px] font-medium tracking-widest uppercase text-muted/70 mb-4 text-center">
            The Maxes
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-center leading-[1.15]">
            A taste of what
            <br />
            Max covers
          </h2>
          <p className="mt-4 text-center text-muted text-[15px]">
            These are just the start. More maxes are always being added.
          </p>
        </div>

        <div className="mt-14">
          {maxes.map((item, i) => (
            <div
              key={item.name}
              className={`group ${visible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${i * 80 + 200}ms` }}
            >
              <div className="flex items-baseline justify-between gap-6 py-5">
                <h3 className="text-[15px] md:text-[16px] font-mono font-medium tracking-tight text-foreground shrink-0 group-hover:text-foreground/70 transition-colors">
                  {item.name}
                </h3>
                <p className="text-[13px] md:text-[14px] text-muted leading-relaxed text-right">
                  {item.description}
                </p>
              </div>
              {i < maxes.length - 1 && (
                <div className="h-px bg-border/40" />
              )}
            </div>
          ))}

          <div
            className={`mt-8 text-center ${visible ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "800ms" }}
          >
            <p className="text-[13px] text-muted/60 tracking-wide">
              + more coming soon
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
