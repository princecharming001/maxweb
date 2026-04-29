export default function WaitlistCTA() {
  return (
    <section id="waitlist" className="relative py-24 sm:py-32 px-6 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-12 h-44 w-44 -translate-x-1/2 rounded-full bg-foreground/[0.035] blur-3xl animate-soft-float" />
      </div>
      <div className="relative max-w-md mx-auto text-center">
        <div className="w-8 h-px bg-border mx-auto mb-10 animate-fade-in" />
        <div className="mt-8 rounded-3xl border border-white/60 bg-white/75 px-8 py-12 shadow-[0_18px_70px_rgba(0,0,0,0.06)] backdrop-blur-xl animate-fade-in-up">
          <p className="text-[11px] uppercase tracking-[0.26em] text-muted/70">
            Launch update
          </p>
          <p className="mt-4 text-[clamp(1.9rem,5vw,2.4rem)] font-semibold tracking-[-0.03em] text-foreground">
            Coming this week
          </p>
          <p className="mt-4 text-[14px] text-muted leading-relaxed max-w-xs mx-auto">
            We&apos;re finishing the final details and opening access very soon.
          </p>
        </div>
      </div>
    </section>
  );
}
