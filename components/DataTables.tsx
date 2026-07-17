"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Display, SectionIntro } from "./ui";

/** Adds the .rows-in trigger class once the table scrolls into view, so
 *  each .ppl-row staggers in exactly like the target's pplRowIn. */
function useRowsIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, cls: on ? "rows-in" : "rows-pending" };
}

const PEOPLE = [
  ["Maya Chen", "VP Growth", "Numera", "maya@numera.com", "+1 (415) 555-0132", "2nd", 98, "S"],
  ["Arjun Mehta", "Head of Sales", "Tideline", "arjun@tideline.io", "+1 (628) 555-0176", "1st", 97, "S"],
  ["Diego Alvarez", "Founder & C…", "Meridian…", "diego@meridian.com", "+1 (917) 555-0148", "2nd", 96, "S"],
  ["Emily Carter", "CRO", "Northbe…", "emily@northbeam.com", "+1 (206) 555-0117", "3rd", 95, "S"],
  ["Priya Raman", "VP Marketing", "Halyard", "priya@halyard.co", "+1 (312) 555-0163", "2nd", 93, "S"],
  ["Aaron Blake", "CMO", "Lattice S…", "aaron@lattice.com", "+1 (646) 555-0129", "1st", 92, "S"],
  ["Lila Ross", "Head of Ops", "Brightwell", "lila@brightwell.com", "+1 (720) 555-0184", "2nd", 91, "S"],
  ["James Sullivan", "VP Sales", "Coastline", "james@coastline.io", "+1 (503) 555-0141", "2nd", 90, "S"],
  ["Sarah Bennett", "Head of Rev…", "Vantage", "sarah@vantage.com", "+1 (617) 555-0158", "2nd", 89, "A"],
  ["Rohan Kapoor", "VP Partners…", "Solstice", "rohan@solstice.io", "+1 (408) 555-0192", "1st", 88, "A"],
];

const COMPANIES = [
  ["Stripe", "stripe.com", "Payments", "1000+", 24, "Enterprise", "2h"],
  ["Ramp", "ramp.com", "Fintech", "1000+", 18, "Enterprise", "5h"],
  ["Linear", "linear.app", "Devtools", "201-500", 12, "Mid-market", "1d"],
  ["Vercel", "vercel.com", "Devtools", "501-1000", 31, "Enterprise", "3h"],
  ["Notion", "notion.so", "Productivity", "1000+", 27, "Enterprise", "6h"],
  ["Brex", "brex.com", "Fintech", "1000+", 15, "Enterprise", "1d"],
  ["Retool", "retool.com", "Devtools", "201-500", 9, "Mid-market", "4h"],
  ["Mercury", "mercury.com", "Fintech", "501-1000", 21, "Enterprise", "8h"],
  ["Loom", "loom.com", "Productivity", "201-500", 14, "Mid-market", "1d"],
  ["Figma", "figma.com", "Design", "1000+", 33, "Enterprise", "2d"],
];

const FACES = [
  "indian-woman", "indian-man", "latino-man", "american-woman",
  "american-woman-2", "american-man", "american-woman-3", "american-man-2",
  "american-woman-4", "indian-man-2",
];

function Toolbar({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="font-sans text-ink text-[13px]">{title}</span>
      <span className="font-body text-ink-4 text-[11px]">{meta}</span>
      <div className="ml-auto flex items-center gap-1.5">
        {["Filter", "Sort", "Import", "Export"].map((b) => (
          <span
            key={b}
            className="border-edge/70 font-body text-ink-2 rounded-md border px-2.5 py-1 text-[11px]"
          >
            {b}
          </span>
        ))}
        <span className="font-body rounded-md bg-white/[0.08] px-2.5 py-1 text-[11px] text-white">
          + New
        </span>
      </div>
    </div>
  );
}

/** Section 3 — text left, table bleeding off the right edge. */
export function HighestIntent() {
  const rows = useRowsIn();
  return (
    <section className="bg-paper paper-grain relative w-full overflow-hidden">
      <div className="mx-auto grid w-full max-w-[1400px] items-center gap-10 px-6 py-20 sm:py-28 lg:grid-cols-[468px_minmax(0,1fr)] lg:gap-16">
        <SectionIntro
          align="left"
          lede="Clean tracks signals across multiple sources to find leads who need your product right now. We then enrich each lead with verified email and phone data from trusted providers."
        >
          <Display
            lines={[
              { text: "Leads with the" },
              { text: "highest intent.", italic: true },
            ]}
          />
        </SectionIntro>

        {/* Fixed 920px panel that intentionally bleeds 56px past the
            viewport's right edge at 1440 — measured off the target. */}
        <div
          ref={rows.ref}
          className={`border-edge/70 w-[920px] max-w-none overflow-hidden rounded-xl border bg-[#131417] ${rows.cls}`}
        >
          <Toolbar title="People" meta="2,847 records · 2 custom fields" />
          <p className="font-body text-ink-4 px-4 pb-2 text-[11px]">
            Page 1 of 57
          </p>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-edge/70 border-y bg-white/[0.02]">
                {["Name", "Title", "Company", "Email", "Phone", "Network", "Fit"].map((h) => (
                  <th
                    key={h}
                    className="font-body text-ink-4 px-3 py-2 text-left text-[11px] font-normal"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PEOPLE.map((r, i) => (
                <tr
                  key={i}
                  className="border-edge/40 ppl-row border-b"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Image
                        src={`https://www.tryclean.ai/faces/${FACES[i]}.png`}
                        alt=""
                        width={20}
                        height={20}
                        className="size-5 rounded-full object-cover"
                        unoptimized
                      />
                      <span className="font-sans text-ink text-[12px]">
                        {r[0]}
                      </span>
                    </div>
                  </td>
                  <td className="font-body text-ink-2 px-3 py-2 text-[12px]">
                    {r[1]}
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-body text-ink-2 rounded bg-white/[0.06] px-2 py-0.5 text-[11px]">
                      {r[2]}
                    </span>
                  </td>
                  <td className="font-body px-3 py-2 text-[12px] text-[#5eb1ff]">
                    {r[3]}
                  </td>
                  <td className="font-body text-ink-2 px-3 py-2 text-[12px]">
                    {r[4]}
                  </td>
                  <td className="font-body text-ink-3 px-3 py-2 text-[11px]">
                    {r[5]}
                  </td>
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full ring-[1.5px] ring-[#71b89a]" />
                      <span className="font-sans text-ink text-[12px]">
                        {r[6]}
                      </span>
                      <span className="font-mono text-[10px] text-[#71b89a]">
                        {r[7]}
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/** Section 4 — mirrored: table bleeds off the left, text on the right. */
export function CompanyRollup() {
  const rows = useRowsIn();
  return (
    <section className="bg-paper paper-grain relative w-full overflow-hidden">
      <div className="mx-auto grid w-full max-w-[1400px] items-center gap-10 px-6 pt-10 pb-20 sm:pt-14 sm:pb-28 lg:grid-cols-[minmax(0,1fr)_468px] lg:gap-16">
        {/* Mirrored panel: same 920px width, pulled 100px left so it bleeds
            56px past the viewport's left edge at 1440. */}
        <div
          ref={rows.ref}
          className={`border-edge/70 w-[920px] max-w-none overflow-hidden rounded-xl border bg-[#131417] lg:-ml-[100px] ${rows.cls}`}
        >
          <Toolbar title="Companies" meta="612 records · 1 custom field" />
          <p className="font-body text-ink-4 px-4 pb-2 text-[11px]">
            Page 1 of 13
          </p>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-edge/70 border-y bg-white/[0.02]">
                {["Company", "Domain", "Industry", "Size", "People", "Tier", "Last activity"].map((h) => (
                  <th
                    key={h}
                    className="font-body text-ink-4 px-3 py-2 text-left text-[11px] font-normal"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPANIES.map((r, i) => (
                <tr
                  key={i}
                  className="border-edge/40 ppl-row border-b"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-2">
                      <span className="size-2 rounded-sm bg-[#5eb1ff]" />
                      <span className="font-sans text-ink text-[12px]">
                        {r[0]}
                      </span>
                    </span>
                  </td>
                  <td className="font-body px-3 py-2 text-[12px] text-[#5eb1ff]">
                    {r[1]}
                  </td>
                  <td className="font-body text-ink-2 px-3 py-2 text-[12px]">
                    {r[2]}
                  </td>
                  <td className="font-body text-ink-2 px-3 py-2 text-[12px]">
                    {r[3]}
                  </td>
                  <td className="font-body text-ink-2 px-3 py-2 text-[12px]">
                    {r[4]}
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-body text-ink-2 rounded bg-white/[0.06] px-2 py-0.5 text-[11px]">
                      {r[5]}
                    </span>
                  </td>
                  <td className="font-body text-ink-3 px-3 py-2 text-[11px]">
                    {r[6]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <SectionIntro
          align="left"
          lede="Every lead rolls up into the company behind it: industry, size, tier and headcount in one view, so nothing slips through."
        >
          <Display
            lines={[
              { text: "See the company" },
              { text: "behind every lead.", italic: true },
            ]}
          />
        </SectionIntro>
      </div>
    </section>
  );
}
