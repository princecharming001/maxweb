"use client";

export default function Hero() {
  return (
    <section className="relative h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      <div className="text-center">
        <h1 className="hero-title text-[clamp(4.5rem,16vw,12rem)] font-normal tracking-[-0.05em] leading-[0.85] select-none animate-fade-in text-foreground/85">
          max
        </h1>
        <p
          className="mt-6 text-[17px] md:text-lg text-muted max-w-sm mx-auto leading-relaxed animate-fade-in"
          style={{ animationDelay: "300ms" }}
        >
          Your AI looksmaxxing coach.
          <br />
          Personalized advice, texted daily.
        </p>
      </div>

      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-fade-in"
        style={{ animationDelay: "800ms" }}
      >
        <div className="animate-bounce-subtle">
          <svg
            className="w-4 h-4 text-muted/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
