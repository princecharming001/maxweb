"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const SIDEBAR = [
  { label: "Chat", icon: "M3 5h10v6H7l-4 3V5Z", active: true },
  { label: "Companies", icon: "M3 13V6l5-3 5 3v7H3Z" },
  { label: "People", icon: "M8 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm-5 5a5 5 0 0 1 10 0" },
  { label: "Tasks", icon: "m3 8 3 3 7-7" },
  { label: "Notes", icon: "M4 3h8v10H4z" },
];

const LEADS = [
  { n: 1, name: "Arjun Mehta", title: "VP Growth", co: "Numera", fit: 100, grade: "S" },
  { n: 2, name: "Emily Carter", title: "Head of Sales", co: "Tideline", fit: 99, grade: "S" },
  { n: 3, name: "Diego Alvarez", title: "Founder & CEO", co: "Meridian", fit: 97, grade: "S" },
  { n: 4, name: "Priya Raman", title: "VP Marketing", co: "Halyard", fit: 95, grade: "S" },
  { n: 5, name: "Aaron Blake", title: "CMO", co: "Lattice", fit: 93, grade: "S" },
  { n: 6, name: "Lila Ross", title: "Head of Ops", co: "Brightwell", fit: 91, grade: "S" },
];

const FACES = [
  "https://www.tryclean.ai/faces/indian-man.png",
  "https://www.tryclean.ai/faces/american-woman.png",
  "https://www.tryclean.ai/faces/latino-man.png",
  "https://www.tryclean.ai/faces/indian-woman.png",
  "https://www.tryclean.ai/faces/american-man.png",
  "https://www.tryclean.ai/faces/american-woman-2.png",
];

const QUERY = "give me leads based on my icp";

/**
 * The hero's in-product screenshot, replayed as the target does: the chat
 * question types in, Clean "thinks", the answer rises, the lead table
 * staggers its rows in, holds, then the whole demo resets and loops.
 *
 * Phases: 0 idle · 1 typing · 2 thinking · 3 answer · 4 table · hold → reset
 */
export default function ProductMock() {
  const [typed, setTyped] = useState(0);
  const [phase, setPhase] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    let cancelled = false;
    const later = (fn: () => void, ms: number) => {
      const t = setTimeout(() => !cancelled && fn(), ms);
      timers.current.push(t);
    };

    const run = () => {
      setPhase(1);
      setTyped(0);
      // Type the query character by character.
      for (let i = 1; i <= QUERY.length; i++) {
        later(() => setTyped(i), 350 + i * 38);
      }
      const doneTyping = 350 + QUERY.length * 38;
      later(() => setPhase(2), doneTyping + 300);
      later(() => setPhase(3), doneTyping + 1700);
      later(() => setPhase(4), doneTyping + 2300);
      // Hold the finished state, then loop.
      later(() => run(), doneTyping + 8200);
    };

    run();
    return () => {
      cancelled = true;
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  return (
    <div className="border-edge/70 overflow-hidden rounded-xl border bg-[#131417] text-left shadow-2xl shadow-black/50">
      <div className="flex min-h-[640px]">
        {/* Sidebar */}
        <aside className="border-edge/70 hidden w-[190px] shrink-0 border-r bg-[#101114] p-3 sm:block">
          <div className="flex items-center gap-2 px-1 py-1.5">
            <Image
              src="https://www.tryclean.ai/clean-mark.png"
              alt=""
              width={22}
              height={22}
              className="size-[22px] rounded-md"
              unoptimized
            />
            <div className="leading-tight">
              <div className="font-sans text-ink text-[12px] font-medium">
                Clean
              </div>
              <div className="font-body text-ink-4 text-[10px]">Workspace</div>
            </div>
          </div>

          <div className="border-edge/60 mt-3 flex items-center justify-between rounded-md border bg-[#16171a] px-2 py-1.5">
            <span className="font-body text-ink-4 text-[11px]">Search</span>
            <span className="font-mono text-ink-4 text-[10px]">⌘K</span>
          </div>

          <div className="label-mono text-ink-4 mt-4 px-1 text-[9px]">
            Workspace
          </div>
          <nav className="mt-1.5 space-y-0.5">
            {SIDEBAR.map((s) => (
              <div
                key={s.label}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${
                  s.active ? "bg-white/[0.06]" : ""
                }`}
              >
                <svg viewBox="0 0 16 16" className="size-3.5" fill="none">
                  <path
                    d={s.icon}
                    stroke={s.active ? "#e6e6e3" : "#7a7a77"}
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  className={`font-sans text-[12px] ${
                    s.active ? "text-ink" : "text-ink-3"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main pane */}
        <div className="min-w-0 flex-1">
          <div className="border-edge/70 flex items-center justify-between border-b px-4 py-2.5">
            <span className="font-sans text-ink text-[13px]">Chat</span>
          </div>

          <div className="flex">
            {/* Conversation */}
            <div className="border-edge/70 hidden w-[260px] shrink-0 border-r p-3 lg:block">
              <div className="flex items-center justify-between">
                <span className="font-body text-ink-3 text-[11px]">
                  History
                </span>
                <span className="rounded-full px-2.5 py-1 text-[11px] text-[#5eb1ff] ring-1 ring-[#5eb1ff]/40">
                  Try yourself
                </span>
              </div>

              {/* Typed question */}
              {phase >= 1 && (
                <div className="mt-4 ml-auto w-fit rounded-lg bg-white/[0.06] px-3 py-2">
                  <p className="font-body text-ink text-[12px]">
                    {QUERY.slice(0, typed)}
                    {phase === 1 && typed < QUERY.length ? (
                      <span className="dd-caret" />
                    ) : null}
                  </p>
                </div>
              )}

              {/* Thinking */}
              {phase === 2 && (
                <p className="mt-3 flex items-center gap-2 text-[11px]">
                  <svg viewBox="0 0 16 16" className="dd-spin size-3" fill="none">
                    <circle
                      cx="8" cy="8" r="6"
                      stroke="#565654" strokeWidth="2"
                      strokeDasharray="28" strokeDashoffset="20"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="dd-shimmer font-body">Working through it…</span>
                </p>
              )}

              {phase >= 3 && (
                <p className="font-body text-ink-4 dd-rise mt-3 text-[11px]">
                  Worked through 3 steps · 4.2s
                </p>
              )}
              {phase >= 3 && (
                <p className="font-body text-ink-2 dd-rise mt-3 text-[12px] leading-relaxed">
                  Found 40 strong matches in your network, ranked by ICP fit.
                  Review the list and add the best ones to your CRM.
                </p>
              )}
            </div>

            {/* Lead table */}
            <div className="min-w-0 flex-1 p-3">
              {phase >= 4 ? (
                <div className="dd-rise">
                  <div className="border-edge/70 flex items-center justify-between rounded-lg border bg-[#16171a] px-3 py-2">
                    <span className="font-sans text-ink text-[12px]">
                      ICP-based leads
                    </span>
                    <span className="font-body rounded-md bg-white/[0.06] px-2 py-1 text-[11px] text-white">
                      + Add all to CRM
                    </span>
                  </div>
                  <p className="font-body text-ink-4 mt-2 px-1 text-[11px]">
                    40 leads · 5 columns
                  </p>

                  <table className="mt-2 w-full border-collapse">
                    <thead>
                      <tr className="border-edge/70 border-b">
                        {["#", "Name", "Job Title", "Company", "Fit"].map((h) => (
                          <th
                            key={h}
                            className="font-body text-ink-4 px-2 py-1.5 text-left text-[11px] font-normal"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {LEADS.map((l, i) => (
                        <tr
                          key={l.n}
                          className="border-edge/40 dd-row-in border-b"
                          style={{ animationDelay: `${i * 90}ms` }}
                        >
                          <td className="font-body text-ink-4 px-2 py-2 text-[11px]">
                            {l.n}
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex items-center gap-2">
                              <Image
                                src={FACES[i % FACES.length]}
                                alt=""
                                width={18}
                                height={18}
                                className="size-[18px] rounded-full object-cover"
                                unoptimized
                              />
                              <span className="font-sans text-ink text-[12px]">
                                {l.name}
                              </span>
                            </div>
                          </td>
                          <td className="font-body text-ink-2 px-2 py-2 text-[12px]">
                            {l.title}
                          </td>
                          <td className="font-body text-ink-2 px-2 py-2 text-[12px]">
                            {l.co}
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex items-center gap-1.5">
                              <span className="size-2.5 rounded-full ring-[1.5px] ring-[#71b89a]" />
                              <span className="font-sans text-ink text-[12px]">
                                {l.fit}
                              </span>
                              <span className="font-mono text-[10px] text-[#71b89a]">
                                {l.grade}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex h-full min-h-[300px] items-center justify-center">
                  <span className="font-body text-ink-4 text-[12px]">
                    {phase >= 2 ? "Sourcing leads…" : ""}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
