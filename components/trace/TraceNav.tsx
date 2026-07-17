import Link from "next/link";

/** Floating glass pill nav (geometry cloned exactly from remindmetrace.com,
 *  which authors at 1rem = 10px — so all sizes are the target's px). */
export default function TraceNav() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-[30px]">
      <div className="pointer-events-auto flex items-center gap-[8px]">
        {/* Logo pill */}
        <Link
          href="#hero"
          aria-label="Max home"
          className="flex h-[42px] items-center rounded-[9px] border border-black/[0.06] bg-white/90 px-[11.5px] backdrop-blur-[22px] backdrop-saturate-[1.8]"
        >
          <span className="text-[15px] leading-none text-[#0f1012]">Max</span>
        </Link>

        {/* Nav links pill */}
        <nav className="flex h-[42px] items-center gap-[16px] rounded-[9px] border border-black/[0.06] bg-white/90 px-[16px] backdrop-blur-[22px] backdrop-saturate-[1.8]">
          <a href="#hero" className="text-[15px] text-[#0f1012]/70 transition-colors hover:text-[#0f1012]">
            Home
          </a>
          <a href="#features" className="text-[15px] text-[#0f1012]/70 transition-colors hover:text-[#0f1012]">
            Features
          </a>
          <a href="#manifesto" className="text-[15px] text-[#0f1012]/70 transition-colors hover:text-[#0f1012]">
            Manifesto
          </a>
        </nav>

        {/* CTA pill → Max web app */}
        <Link
          href="/start"
          className="flex h-[42px] items-center rounded-[9px] border border-white/[0.06] bg-[rgba(15,16,18,0.92)] px-[15px] text-[15px] text-white backdrop-blur-[22px] backdrop-saturate-[1.8] transition-transform hover:scale-[1.02]"
        >
          Get started
        </Link>
      </div>
    </header>
  );
}
