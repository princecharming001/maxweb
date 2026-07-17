import Image from "next/image";
import Link from "next/link";
import { Arrow, DEMO_URL } from "./ui";

const COLUMNS = [
  {
    title: "Product",
    links: ["How it works", "AI GTM", "Lead generation", "Buyer profiling", "ICP scoring", "Buyer signals", "ICP Fit Score tool"],
  },
  {
    title: "Compare",
    links: ["All comparisons", "vs Clay", "vs Apollo", "vs AI SDRs", "Clay vs Apollo vs Clean", "All alternatives", "Clay alternatives"],
  },
  {
    title: "Solutions",
    links: ["Founder-led sales", "PLG teams", "Devtools", "Series A/B SaaS", "RevOps", "Profile research"],
  },
  {
    title: "Integrations",
    links: ["All integrations", "HubSpot", "Salesforce", "Clay", "Apollo", "Clay + Clean stack", "Apollo + Clean stack"],
  },
  {
    title: "Resources",
    links: ["Resource hub", "Glossary", "Playbooks", "AI SDR alternatives", "Relationship intelligence", "Answers", "Use cases"],
  },
  {
    title: "Company",
    links: ["Customers", "Founders", "FAQ", "Contact", "Privacy", "Terms", "Support"],
  },
];

const SOCIALS = [
  {
    label: "Email",
    href: "mailto:hello@tryclean.ai",
    d: "M2 4h12v8H2V4Zm1.2 1L8 8.4 12.8 5",
    stroke: true,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/112998105",
    d: "M3.5 6H1.8v8h1.7V6ZM2.65 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM14 9.4C14 7.3 12.9 6 11.2 6c-1 0-1.7.5-2 1V6H7.5v8h1.7V9.7c0-.9.4-1.5 1.2-1.5s1.1.6 1.1 1.5V14H14V9.4Z",
  },
  {
    label: "X",
    href: "https://x.com/cleanailabs",
    d: "M12.6 1.5h2.1l-4.6 5.3 5.4 7.7h-4.2l-3.3-4.3-3.8 4.3H1.9l4.9-5.6L1.6 1.5H6l3 4 3.6-4Zm-.7 12h1.2L4.9 2.7H3.6l8.3 10.8Z",
  },
];

export default function Footer() {
  return (
    <footer className="bg-paper paper-grain w-full">
      <div className="mx-auto w-full max-w-[1320px] px-6 pt-16 pb-10 sm:pt-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
          {/* Brand rail */}
          <div>
            <Link href="/" aria-label="Clean home" className="inline-flex">
              <Image
                src="https://www.tryclean.ai/clean-logo-blue.png"
                alt="Clean"
                width={92}
                height={26}
                className="h-[26px] w-auto"
                unoptimized
              />
            </Link>

            <Link
              href={DEMO_URL}
              className="font-sans text-ink hover:text-ink-2 mt-8 inline-flex items-center gap-2 text-[14px] transition-colors"
            >
              Book a demo <Arrow className="size-3.5" />
            </Link>

            <div className="mt-7 flex gap-2.5">
              {SOCIALS.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="border-edge/70 hover:border-edge flex size-9 items-center justify-center rounded-full border transition-colors"
                >
                  <svg
                    viewBox="0 0 16 16"
                    className="size-3.5"
                    fill={s.stroke ? "none" : "#9b9b98"}
                    stroke={s.stroke ? "#9b9b98" : undefined}
                    strokeWidth={s.stroke ? 1.2 : undefined}
                  >
                    <path d={s.d} />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Link grid — two rows of three columns. */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <div className="label-mono text-ink-4">{col.title}</div>
                <ul className="mt-4 space-y-2">
                  {col.links.map((l) => (
                    <li key={l}>
                      <Link
                        href="#"
                        className="font-sans text-ink-2 hover:text-ink text-[13.5px] transition-colors"
                      >
                        {l}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <span className="label-mono text-ink-4">
            © 2026 Clean AI Labs, Inc.
          </span>
          <div className="flex flex-wrap gap-7">
            {[
              ["Privacy", "/privacy"],
              ["Terms", "/terms"],
              ["Security", "/security-and-deliverability"],
            ].map(([l, h]) => (
              <Link
                key={l}
                href={h}
                className="label-mono text-ink-4 hover:text-ink-2 transition-colors"
              >
                {l}
              </Link>
            ))}
            <Link
              href="#"
              className="label-mono text-ink-4 hover:text-ink-2 inline-flex items-center gap-1 transition-colors"
            >
              Back to top ↑
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
