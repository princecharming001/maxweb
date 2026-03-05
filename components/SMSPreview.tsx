"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Iphone15Pro } from "./Iphone15Pro";

interface Message {
  from: "max" | "user";
  text: string;
  time: string;
}

const initialMessages: Message[] = [
  {
    from: "max",
    text: "Good morning. Time for your skincare routine — cleanser, vitamin C serum, then SPF 50. Don\u2019t skip the sunscreen.",
    time: "8:02 AM",
  },
  {
    from: "user",
    text: "Done. What about my hair?",
    time: "8:14 AM",
  },
  {
    from: "max",
    text: "Your hair type responds well to less washing. Skip today, use a dry texture spray instead. Trust the process.",
    time: "8:14 AM",
  },
  {
    from: "max",
    text: "Also — posture check. Shoulders back, chin slightly up. It changes how people perceive you instantly.",
    time: "8:15 AM",
  },
];

const aiResponses = [
  "For your jawline — start mewing consistently. Tongue flat on the roof of your mouth, teeth lightly together. It\u2019s subtle but compounds over time.",
  "Drink more water today. Hydration shows in your skin within 48 hours. Aim for 3L minimum.",
  "Style tip: stick to neutral tones this week. Black, white, gray, navy. Simple fits look more intentional.",
  "Try cold water on your face for 30 seconds after washing. It reduces puffiness and tightens pores.",
  "Solid question. Sleep is the #1 thing most people neglect. 7–8 hours, cool room, no screens 30 min before bed.",
  "Your consistency is what separates you. Most people quit after a week. You\u2019re already ahead.",
  "Quick grooming check — trim your nails, clean up your eyebrows, and moisturize your hands. Details matter.",
  "For confidence: make eye contact for 2 seconds longer than feels comfortable. It signals presence.",
];

function getTimeNow() {
  const d = new Date();
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

export default function SMSPreview() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const responseIndex = useRef(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.02 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      });
    }
  }, [messages, typing]);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || typing) return;

    const userMsg: Message = { from: "user", text, time: getTimeNow() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    const delay = 1200 + Math.random() * 1000;
    setTimeout(() => {
      const reply = aiResponses[responseIndex.current % aiResponses.length];
      responseIndex.current++;
      setMessages((prev) => [
        ...prev,
        { from: "max", text: reply, time: getTimeNow() },
      ]);
      setTyping(false);
    }, delay);
  }, [input, typing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <section className="py-28 px-6" ref={sectionRef}>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-14 md:gap-16">
          {/* Text side */}
          <div
            className={`flex-1 md:max-w-sm ${visible ? "animate-fade-in-up" : "opacity-0"}`}
          >
            <p className="text-[13px] font-medium tracking-widest uppercase text-muted/70 mb-4">
              How it feels
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-[1.15]">
              Coaching that
              <br />
              comes to you
            </h2>
            <p className="mt-5 text-muted text-[16px] leading-relaxed">
              Max texts you personalized advice throughout the day. No app to
              open, no dashboard to check. Just real guidance in your messages.
            </p>
          </div>

          {/* iPhone 15 Pro — Magic UI SVG frame */}
          <div
            className={`flex-shrink-0 w-full max-w-[280px] ${visible ? "animate-scale-in" : "opacity-0"}`}
            style={{ animationDelay: "200ms" }}
          >
            <Iphone15Pro>
              <div className="w-full h-full bg-[#f2f2f7] flex flex-col text-[#1c1c1e]">
                {/* Status bar */}
                <div className="flex items-center justify-between px-[7%] pt-[4.5%] pb-0">
                  <span className="text-[clamp(8px,3.2%,14px)] font-semibold tracking-[-0.01em]">
                    9:41
                  </span>
                  <div className="flex gap-[3px] items-center">
                    <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor" className="opacity-80 w-[clamp(10px,3.5%,15px)]">
                      <rect x="0" y="7.5" width="2.5" height="3.5" rx="0.5" />
                      <rect x="4" y="5" width="2.5" height="6" rx="0.5" />
                      <rect x="8" y="2.5" width="2.5" height="8.5" rx="0.5" />
                      <rect x="12" y="0" width="2.5" height="11" rx="0.5" opacity="0.3" />
                    </svg>
                    <svg width="13" height="10" viewBox="0 0 16 12" fill="currentColor" className="opacity-80 w-[clamp(9px,3%,13px)]">
                      <path d="M8 2.4c2.5 0 4.8 1 6.5 2.7a.6.6 0 01-.85.85A8 8 0 008 3.5 8 8 0 002.35 5.95a.6.6 0 01-.85-.85A9.1 9.1 0 018 2.4z" />
                      <path d="M8 5.6c1.7 0 3.3.7 4.4 1.8a.6.6 0 01-.85.85A4.8 4.8 0 008 6.8a4.8 4.8 0 00-3.55 1.45.6.6 0 01-.85-.85A6 6 0 018 5.6z" />
                      <circle cx="8" cy="10.5" r="1.3" />
                    </svg>
                    <svg width="22" height="11" viewBox="0 0 25 12" className="opacity-80 w-[clamp(15px,5%,22px)]">
                      <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.35" />
                      <rect x="2" y="2" width="16" height="8" rx="1.2" fill="currentColor" opacity="0.8" />
                      <path d="M23 4.5v3a1.5 1.5 0 000-3z" fill="currentColor" opacity="0.35" />
                    </svg>
                  </div>
                </div>

                {/* Dynamic Island spacer */}
                <div className="h-[2.5%]" />

                {/* iMessage nav bar */}
                <div className="px-[3%] pb-[1.5%] flex items-center gap-[1%]">
                  <button className="p-[1%] text-[#007AFF]" tabIndex={-1}>
                    <svg className="w-[clamp(12px,4%,18px)] h-[clamp(12px,4%,18px)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <div className="flex-1 flex items-center gap-[2%] pl-[0.5%]">
                    <div className="w-[clamp(20px,7.5%,32px)] h-[clamp(20px,7.5%,32px)] rounded-full bg-gradient-to-br from-[#64D2FF] to-[#0A84FF] flex items-center justify-center">
                      <span className="text-[clamp(7px,2.8%,12px)] font-bold text-white leading-none">M</span>
                    </div>
                    <div className="leading-none">
                      <p className="text-[clamp(9px,3.4%,15px)] font-semibold">max</p>
                      <p className="text-[clamp(7px,2.5%,11px)] text-[#8e8e93] mt-[1px]">AI Coach</p>
                    </div>
                  </div>
                  <button className="p-[1.5%] text-[#007AFF]" tabIndex={-1}>
                    <svg className="w-[clamp(11px,3.8%,17px)] h-[clamp(11px,3.8%,17px)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </button>
                </div>

                <div className="h-[0.5px] bg-black/[0.08]" />

                {/* Messages */}
                <div
                  ref={chatContainerRef}
                  className="flex-1 px-[3%] py-[2%] space-y-[2px] overflow-y-auto overscroll-contain scrollbar-hide"
                >
                  {messages.map((msg, i) => {
                    const isMax = msg.from === "max";
                    const isLast =
                      i === messages.length - 1 ||
                      messages[i + 1]?.from !== msg.from;
                    const delays = [500, 1100, 1700, 2300];
                    const isInitial = i < initialMessages.length;

                    return (
                      <div
                        key={i}
                        className={`flex ${isMax ? "justify-start" : "justify-end"} ${
                          isInitial
                            ? visible
                              ? "animate-message-in"
                              : "opacity-0"
                            : "animate-message-in"
                        }`}
                        style={
                          isInitial ? { animationDelay: `${delays[i]}ms` } : {}
                        }
                      >
                        <div className="relative max-w-[80%]">
                          <div
                            className={`px-[10px] py-[6px] text-[clamp(9px,3.3%,14px)] leading-[1.35] ${
                              isMax
                                ? `bg-[#e9e9eb] text-[#1c1c1e] ${isLast ? "rounded-[17px] rounded-bl-[4px]" : "rounded-[17px]"}`
                                : `bg-[#007AFF] text-white ${isLast ? "rounded-[17px] rounded-br-[4px]" : "rounded-[17px]"}`
                            }`}
                          >
                            {msg.text}
                          </div>
                          {isLast && (
                            <span
                              className={`block text-[clamp(6px,2%,9px)] mt-[2px] px-1 ${isMax ? "text-[#8e8e93]/60 text-left" : "text-[#8e8e93]/60 text-right"}`}
                            >
                              {msg.time}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {typing && (
                    <div className="flex justify-start animate-message-in">
                      <div className="bg-[#e9e9eb] rounded-[17px] rounded-bl-[4px] px-3 py-2 flex items-center gap-[3px]">
                        <span className="w-[6px] h-[6px] bg-[#8e8e93]/50 rounded-full animate-[bounce_1.4s_ease-in-out_infinite]" />
                        <span className="w-[6px] h-[6px] bg-[#8e8e93]/50 rounded-full animate-[bounce_1.4s_ease-in-out_infinite]" style={{ animationDelay: "200ms" }} />
                        <span className="w-[6px] h-[6px] bg-[#8e8e93]/50 rounded-full animate-[bounce_1.4s_ease-in-out_infinite]" style={{ animationDelay: "400ms" }} />
                      </div>
                    </div>
                  )}
                  <div />
                </div>

                {/* Input bar */}
                <div className="px-[3%] pb-[1.5%] pt-[0.5%]">
                  <div className="flex items-center gap-[2%]">
                    <button
                      className="w-[clamp(18px,6%,28px)] h-[clamp(18px,6%,28px)] rounded-full bg-[#8e8e93]/20 flex items-center justify-center shrink-0"
                      tabIndex={-1}
                    >
                      <svg className="w-[clamp(10px,3.5%,15px)] h-[clamp(10px,3.5%,15px)] text-[#8e8e93]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </button>
                    <div className="flex-1 flex items-center bg-white border border-[#c7c7cc] rounded-full px-[3%] py-[1.2%] min-h-[clamp(22px,7%,34px)]">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="iMessage"
                        className="flex-1 text-[clamp(9px,3.3%,14px)] bg-transparent text-[#1c1c1e] focus:outline-none placeholder:text-[#8e8e93]/60 min-w-0"
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      className={`w-[clamp(18px,6%,28px)] h-[clamp(18px,6%,28px)] rounded-full flex items-center justify-center shrink-0 transition-all ${
                        input.trim()
                          ? "bg-[#007AFF] cursor-pointer active:scale-90"
                          : "bg-[#8e8e93]/20 cursor-default"
                      }`}
                      tabIndex={-1}
                    >
                      <svg
                        className="w-[clamp(8px,3%,13px)] h-[clamp(8px,3%,13px)] -rotate-45 translate-x-[0.5px] -translate-y-[0.5px]"
                        fill={input.trim() ? "white" : "#8e8e93"}
                        viewBox="0 0 24 24"
                      >
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Home indicator */}
                <div className="flex justify-center pb-[1.5%] pt-[0.5%]">
                  <div className="w-[28%] h-[4px] bg-black/15 rounded-full" />
                </div>
              </div>
            </Iphone15Pro>
          </div>
        </div>
      </div>
    </section>
  );
}
