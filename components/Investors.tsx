import Image from "next/image";
import Link from "next/link";
import { Display } from "./ui";
import Reveal from "./Reveal";

const INVESTORS = [
  {
    name: "Jackson Square Ventures",
    href: "https://www.jsv.com",
    logo: "https://www.tryclean.ai/investors/jsv.png",
    size: "h-9 w-auto sm:h-11",
  },
  {
    name: "Founders, Inc.",
    href: "https://f.inc",
    logo: "https://www.tryclean.ai/investors/finc.jpg",
    size: "h-16 w-auto sm:h-20",
  },
];

export default function Investors() {
  return (
    <section className="bg-paper paper-grain relative w-full overflow-hidden py-20 sm:py-28">
      {/* Soft bloom behind the heading. */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-[360px] w-[760px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(94,177,255,0.07),transparent_70%)]" />

      <div className="relative mx-auto w-full max-w-[1320px] px-6">
        <h2 className="font-display text-ink text-center text-[clamp(34px,4.5vw,60px)] leading-[1.05] tracking-[-0.015em]">
          <Display
            lines={[
              { text: "Backed by" },
              { text: "top-tier", italic: true },
              { text: "investors." },
            ]}
          />
        </h2>

        {/* Two cells split by hairline rules, not a flex row. */}
        <Reveal className="divide-paper-edge border-paper-edge mx-auto mt-12 grid max-w-[1100px] grid-cols-1 divide-y border-y sm:mt-16 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          {INVESTORS.map((inv) => (
            <Link
              key={inv.name}
              href={inv.href}
              aria-label={`Visit ${inv.name}`}
              className="group hover:bg-ink/[0.02] flex flex-col items-center justify-center gap-6 px-6 py-14 transition-colors duration-300"
            >
              <Image
                src={inv.logo}
                alt={inv.name}
                width={200}
                height={80}
                className={inv.size}
                unoptimized
              />
              <span className="font-grotesk text-ink-2 text-[15px] transition-transform duration-300 group-hover:-translate-y-0.5">
                {inv.name}
              </span>
            </Link>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
