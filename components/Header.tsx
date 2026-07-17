import Image from "next/image";
import Link from "next/link";
import { DEMO_URL, SIGNIN_URL, PillButton } from "./ui";

const SOLUTIONS = [
  { label: "Lead generation", blurb: "Surface the accounts worth working" },
  { label: "ICP scoring", blurb: "Rank every account by fit, S to C" },
  { label: "Competitor analysis", blurb: "See where you win and where you lose" },
  { label: "Profile research", blurb: "Deep dossiers on every buyer" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 mt-4 w-full bg-transparent">
      <div className="relative flex w-full items-center justify-between px-10 py-4">
        {/* Wordmark is the glyph image + live serif text, not one flat asset. */}
        <Link
          href="/"
          aria-label="Clean home"
          className="inline-flex items-center transition-opacity hover:opacity-80"
        >
          <span className="font-display inline-flex items-center gap-2 text-[26px] leading-none tracking-[-0.015em] text-white select-none">
            <Image
              src="https://www.tryclean.ai/clean-mark.png"
              alt=""
              aria-hidden="true"
              width={93}
              height={89}
              className="h-[0.9em] w-auto shrink-0"
              unoptimized
            />
            Clean
          </span>
        </Link>

        {/* Centre glass pill — absolutely positioned so it stays optically
            centred regardless of the logo/CTA widths. */}
        <nav className="pointer-events-auto absolute left-1/2 hidden -translate-x-1/2 md:block">
          <div className="flex items-center gap-1 rounded-full bg-[#1a1d23]/85 p-1.5 shadow-[0_0_0_1px_rgba(255,255,255,0.15)] backdrop-blur-xl">
            <div className="group relative">
              <button className="label-mono text-ink/90 hover:text-ink flex items-center gap-1.5 rounded-full px-4 py-2.5 transition-colors">
                Solutions <span className="text-[13px] leading-none">+</span>
              </button>
              <div className="invisible absolute top-full left-1/2 w-[300px] -translate-x-1/2 pt-3 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                <div className="border-edge/60 bg-[#1a1d23]/95 rounded-xl border p-2 backdrop-blur-xl">
                  {SOLUTIONS.map((s) => (
                    <Link
                      key={s.label}
                      href="#"
                      className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5"
                    >
                      <div className="font-sans text-ink text-[13px]">
                        {s.label}
                      </div>
                      <div className="font-body text-ink-3 text-[12px]">
                        {s.blurb}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href="/resources"
              className="label-mono text-ink/90 hover:text-ink rounded-full px-4 py-2.5 transition-colors"
            >
              Resources
            </Link>
            <Link
              href="/customers"
              className="label-mono text-ink/90 hover:text-ink rounded-full px-4 py-2.5 transition-colors"
            >
              Stories
            </Link>
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={SIGNIN_URL}
            className="label-mono text-ink/90 hover:text-ink hidden rounded-full px-4 py-2.5 transition-colors sm:inline-block"
          >
            Sign in
          </Link>
          <PillButton href={DEMO_URL}>Get started</PillButton>
        </div>
      </div>
    </header>
  );
}
