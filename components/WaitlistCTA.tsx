import Link from "next/link";

export default function WaitlistCTA() {
  return (
    <section id="waitlist" className="py-24 sm:py-32 px-6">
      <div className="max-w-md mx-auto text-center">
        <div className="w-8 h-px bg-border mx-auto mb-10" />
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
          Get early access
        </h2>
        <p className="mt-3 text-muted text-[15px] max-w-xs mx-auto leading-relaxed">
          Join the waitlist. Be first in line when Max starts texting.
        </p>

        <div className="mt-8">
          <Link
            href="/signup"
            className="inline-block bg-foreground text-background px-8 py-3 rounded-full text-[14px] font-medium hover:bg-foreground/85 active:scale-[0.97] transition-all"
          >
            Join Waitlist
          </Link>
        </div>
      </div>
    </section>
  );
}
