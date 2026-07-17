import Image from "next/image";
import { Display, SectionIntro } from "./ui";
import Reveal from "./Reveal";

const LEAD_ROWS = [
  { name: "Ivan Camps", deg: "2nd degree", sub: "Reserve | New York", img: "ivancamps" },
  { name: "Cameron Atkinson", deg: "1st degree", sub: "Stripe | Chicago", img: "camatkinson1" },
  { name: "Michael Zuercher", deg: "2nd degree", sub: "Prismatic | Sioux Falls", img: "michael-zuercher" },
  { name: "David Bell", deg: "2nd degree", sub: "Remedy Robotics | Stanford", img: "david-bell-rr" },
  { name: "Kshitij Saxena", deg: "2nd degree", sub: "Relentless VC | Boston", img: "kjsaxena" },
];

const STATS = [
  { v: "2,340", l: "Customer count" },
  { v: "120 staff", l: "Company size" },
  { v: "$4.2M", l: "Annual revenue" },
  { v: "San Francisco", l: "Location" },
];

/** Frosted panel that floats on top of each card's photograph. */
function GlassPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-black/25 p-4 ring-1 ring-white/15 backdrop-blur-md">
      <h3 className="label-mono text-[13px] tracking-[0.08em] text-white">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Card({
  img,
  alt,
  caption,
  children,
}: {
  img: string;
  alt: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <article className="relative aspect-[532/767] w-full overflow-hidden rounded-[40px]">
      <Image src={img} alt={alt} fill className="object-cover" unoptimized />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />
      <div className="relative flex h-full flex-col justify-between p-6">
        <div className="pt-4">{children}</div>
        <p className="font-mona text-[22px] leading-snug text-white">
          {caption}
        </p>
      </div>
    </article>
  );
}

export default function FindPeople() {
  return (
    <section className="bg-paper paper-grain relative w-full">
      <div className="mx-auto w-full max-w-[1400px] px-6 py-20 sm:py-28">
        <SectionIntro
          lede="Clean learns your company first: what you sell, who buys it, and why. Then it sources and scores leads with accuracy that feels unfair."
        >
          <Display
            lines={[
              { text: "Find the" },
              { text: "right", italic: true },
              { text: "people." },
            ]}
          />
        </SectionIntro>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          <Reveal delay={0}>
          <Card
            img="https://www.tryclean.ai/cards/company-bg.jpg"
            alt="Desert dunes"
            caption="Knows all about your company."
          >
            <GlassPanel title="Company knowledge">
              <p className="font-body text-[12px] leading-relaxed text-white/80">
                Clean AI Labs builds an AI GTM engine for B2B SaaS teams. It
                learns your company from the tools you already use, then
                surfaces warm, qualified leads you can actually reach.
              </p>
              <div className="mt-3 space-y-1.5">
                {["icon-gmail", "icon-drive"].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-md bg-black/30 px-2.5 py-1.5 ring-1 ring-white/10"
                  >
                    <span className="flex items-center gap-2">
                      <Image
                        src={`https://www.tryclean.ai/cards/${i}.png`}
                        alt=""
                        width={14}
                        height={14}
                        unoptimized
                      />
                      <span className="font-body text-[11px] text-white/90">
                        Connected
                      </span>
                    </span>
                    <span className="text-[11px] text-[#71b89a]">✓</span>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </Card>
          </Reveal>

          <Reveal delay={130}>
          <Card
            img="https://www.tryclean.ai/cards/leads-bg.jpg"
            alt="Ocean meeting the shore"
            caption="Finds the leads that fit."
          >
            <GlassPanel title="Generated leads">
              <div className="space-y-2">
                {LEAD_ROWS.map((r) => (
                  <div key={r.name} className="flex items-center gap-2.5">
                    <Image
                      src={`https://www.tryclean.ai/leads/${r.img}.jpg`}
                      alt=""
                      width={22}
                      height={22}
                      className="size-[22px] rounded-full object-cover"
                      unoptimized
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-sans truncate text-[12px] text-white">
                          {r.name}
                        </span>
                        <span className="font-body shrink-0 rounded bg-white/15 px-1.5 py-px text-[9px] text-white/70">
                          {r.deg}
                        </span>
                      </div>
                      <div className="font-body truncate text-[10px] text-white/50">
                        {r.sub}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </Card>
          </Reveal>

          <Reveal delay={260}>
          <Card
            img="https://www.tryclean.ai/cards/info-bg.jpg"
            alt="Open ocean water"
            caption="Knows everything about them."
          >
            <GlassPanel title="Company A">
              <div className="flex items-center gap-2.5">
                <Image
                  src="https://www.tryclean.ai/faces/american-man-2.png"
                  alt=""
                  width={30}
                  height={30}
                  className="size-[30px] rounded-full object-cover"
                  unoptimized
                />
                <div>
                  <div className="font-sans text-[12px] text-white">
                    Jordan Avery
                  </div>
                  <div className="font-body text-[10px] text-white/50">
                    CEO &amp; Co-founder
                  </div>
                </div>
              </div>
              <div className="font-body mt-3 space-y-1.5 text-[11px] text-white/70">
                <div>jordan@companya.com</div>
                <div>+1 (415) 555-0142</div>
                <div>in/jordan-avery</div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/15 pt-3">
                {STATS.map((s) => (
                  <div key={s.l}>
                    <div className="font-sans text-[12px] text-white">
                      {s.v}
                    </div>
                    <div className="font-body text-[9px] text-white/50">
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
