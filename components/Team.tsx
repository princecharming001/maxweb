import Image from "next/image";
import Link from "next/link";
import { Display } from "./ui";
import Reveal from "./Reveal";
import TiltCard from "./TiltCard";

const TEAM = [
  {
    name: "Pavan Kumar",
    img: "https://www.tryclean.ai/founders/pavan.jpg",
    bio: [
      { t: "Youngest intern at Cisco (1 of 35). Scaled Cliqk to $25K MRR. " },
      { t: "15K LinkedIn", b: true },
      { t: ", 28M views." },
    ],
  },
  {
    name: "Pratham Patel",
    img: "https://www.tryclean.ai/founders/pratham.jpg",
    bio: [
      { t: "Built open-source app, scaled to " },
      { t: "10K+ users in 6 months", b: true },
      { t: ". Research @ DA-IICT - India's top CS lab, funded by Dhirubhai Ambani." },
    ],
  },
  {
    name: "Clarissa Saputra",
    img: "https://www.tryclean.ai/founders/clarissa.jpg",
    bio: [
      { t: "International Physics Olympiad Honorable Mention. Published at AAAI 2026. " },
      { t: "150K+ social following", b: true },
      { t: ". 10+ hackathon wins." },
    ],
  },
  {
    name: "Tejas Gupta",
    img: "https://www.tryclean.ai/founders/tejas.jpg",
    bio: [
      { t: "Scaled a company to $40M", b: true },
      { t: ". Youngest intern at GlobalLogic (Hitachi) at 19." },
    ],
  },
];

const LINKEDIN =
  "M3.5 6H1.8v8h1.7V6ZM2.65 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM14 9.4C14 7.3 12.9 6 11.2 6c-1 0-1.7.5-2 1V6H7.5v8h1.7V9.7c0-.9.4-1.5 1.2-1.5s1.1.6 1.1 1.5V14H14V9.4Z";
const X_PATH =
  "M12.6 1.5h2.1l-4.6 5.3 5.4 7.7h-4.2l-3.3-4.3-3.8 4.3H1.9l4.9-5.6L1.6 1.5H6l3 4 3.6-4Zm-.7 12h1.2L4.9 2.7H3.6l8.3 10.8Z";

function Social({ d }: { d: string }) {
  return (
    <span className="flex size-6 items-center justify-center rounded bg-white/10 transition-colors hover:bg-white/20">
      <svg viewBox="0 0 16 16" className="size-3 fill-white/80">
        <path d={d} />
      </svg>
    </span>
  );
}

/** "Early believers" — photographic testimonial card above the founders. */
function Testimonial() {
  return (
    <div className="relative overflow-hidden rounded-[32px] px-6 py-14 sm:px-12 sm:py-20">
      <Image
        src="https://www.tryclean.ai/cards/stop-bg.jpg"
        alt="Coastline at dusk"
        fill
        className="object-cover"
        unoptimized
      />
      <div className="absolute inset-0 bg-black/45" />

      <div className="relative">
        <p className="font-grotesk text-[clamp(15px,1.4vw,19px)] tracking-[0.06em] text-white uppercase">
          Early believers
        </p>

        <blockquote className="font-mona mt-8 max-w-[26ch] text-[clamp(17px,1.9vw,24px)] leading-[1.45] text-white sm:max-w-[46ch]">
          “In a time where precision beats volume, the real edge happens when
          the tool understands what case needs to be solved to close the deal.
          This is what Clean executes to perfection.”
        </blockquote>

        <div className="mt-12 flex flex-wrap items-end gap-x-6 gap-y-6">
          <div>
            <div className="font-grotesk text-[clamp(26px,3vw,38px)] leading-none text-white">
              $60K
            </div>
            <p className="font-grotesk mt-2 max-w-[24ch] text-left text-[11px] leading-[1.4] text-white/70">
              deal closed his first week using Clean.
            </p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="relative size-9 overflow-hidden rounded-full">
              <Image
                src="https://www.tryclean.ai/stories/oli.jpg"
                alt="Oli Nold"
                fill
                className="object-cover"
                unoptimized
              />
            </span>
            <span className="font-mona text-[14px] text-white">Oli Nold</span>
            <span className="text-white/40">·</span>
            <span className="font-grotesk text-[12px] text-white/60">CEO @</span>
            <Image
              src="https://www.tryclean.ai/customers/vivameda.webp"
              alt="Vivameda"
              width={80}
              height={20}
              className="h-5 w-auto"
              unoptimized
            />
          </div>
        </div>

        <Link
          href="/customers"
          className="font-grotesk mt-10 inline-flex items-center gap-1.5 text-[13px] text-white/80 transition-colors hover:text-white"
        >
          Read Oli’s story →
        </Link>
      </div>
    </div>
  );
}

export default function Team() {
  return (
    <section className="bg-paper paper-grain py-24 sm:py-32">
      <div className="mx-auto w-full max-w-[1320px] px-6">
        <Reveal>
          <Testimonial />
        </Reveal>

        <h2 className="font-display text-ink mt-24 text-[clamp(40px,5.5vw,76px)] leading-[1.02] tracking-[-0.015em]">
          <Display lines={[{ text: "Who you’re" }]} />
          <br />
          <Display lines={[{ text: "working with.", italic: true }]} />
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((m, idx) => (
            <Reveal key={m.name} delay={idx * 130}>
              <TiltCard className="bg-paper-2 group relative aspect-[311/434] w-full overflow-hidden rounded-[30px]">
                <Image
                  src={m.img}
                  alt={m.name}
                  fill
                  className="object-cover grayscale transition-[filter] duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:grayscale-0"
                  unoptimized
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(180deg, rgba(0,0,0,0) 38%, rgba(0,0,0,0.95) 99%)",
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-grotesk text-[16px] leading-tight tracking-[-0.04em] text-white">
                    {m.name}
                  </h3>
                  <p className="font-body mt-2 text-[11px] leading-relaxed text-white/65">
                    {m.bio.map((s, i) => (
                      <span
                        key={i}
                        className={s.b ? "font-medium text-white" : undefined}
                      >
                        {s.t}
                      </span>
                    ))}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Social d={LINKEDIN} />
                    <Social d={X_PATH} />
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
