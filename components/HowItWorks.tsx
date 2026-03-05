"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  {
    title: "Build Your Profile",
    description:
      "Answer a few quick questions about your goals, skin type, lifestyle, and what you want to improve.",
  },
  {
    title: "Get Daily Texts",
    description:
      "Every morning, Max sends personalized advice straight to your phone. Skincare, style, posture — no app required.",
  },
  {
    title: "Level Up",
    description:
      "Follow the plan, track your progress, and watch the results compound. Max adapts as you improve.",
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="py-32 px-6" ref={sectionRef}>
      <div className="max-w-2xl mx-auto">
        <div className={visible ? "animate-fade-in-up" : "opacity-0"}>
          <p className="text-[13px] font-medium tracking-widest uppercase text-muted/70 mb-4">
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-[1.15]">
            Three steps.
            <br />
            No complexity.
          </h2>
        </div>

        {/* Vertical timeline */}
        <div className="mt-16 space-y-0">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`relative flex gap-6 ${visible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${(i + 1) * 150 + 100}ms` }}
            >
              {/* Timeline rail */}
              <div className="flex flex-col items-center pt-1">
                <div className="w-7 h-7 rounded-full border-2 border-foreground/10 bg-background flex items-center justify-center z-10">
                  <span className="text-[11px] font-semibold text-foreground/40">
                    {i + 1}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px flex-1 bg-foreground/[0.06] my-1" />
                )}
              </div>

              {/* Content */}
              <div className={`pb-12 ${i === steps.length - 1 ? "pb-0" : ""}`}>
                <h3 className="text-[17px] font-semibold tracking-tight leading-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-[15px] text-muted leading-relaxed max-w-md">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
