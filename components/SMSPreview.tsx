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
    text: "Your hair type responds well to less washing. Skip today, use dry texture spray instead. Trust the process.",
    time: "8:14 AM",
  },
  {
    from: "max",
    text: "Also — posture check. Shoulders back, chin slightly up. People notice instantly.",
    time: "8:15 AM",
  },
];

const aiResponses = [
  "For your jawline — start mewing consistently. Tongue flat on the roof of your mouth, teeth lightly together. It compounds over time.",
  "Drink more water today. Hydration shows in your skin within 48 hours. Aim for 3L minimum.",
  "Style tip: stick to neutral tones this week. Black, white, gray, navy. Simple fits look more intentional.",
  "Try cold water on your face for 30 seconds after washing. Reduces puffiness and tightens pores.",
  "Sleep is the #1 thing most people neglect. 7–8 hours, cool room, no screens 30 min before bed.",
  "Your consistency is what separates you. Most people quit after a week. You\u2019re already ahead.",
  "Quick grooming check — trim your nails, clean up your eyebrows, moisturize your hands. Details matter.",
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
      setMessages((prev) => [...prev, { from: "max", text: reply, time: getTimeNow() }]);
      setTyping(false);
    }, delay);
  }, [input, typing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); sendMessage(); }
  };

  return (
    <section className="py-28 px-6" ref={sectionRef}>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center md:flex-row md:items-center md:justify-center gap-12 md:gap-20">
          <div className={`text-center md:text-left md:max-w-sm ${visible ? "animate-fade-in-up" : "opacity-0"}`}>
            <p className="text-[13px] font-medium tracking-widest uppercase text-muted/70 mb-4">How it feels</p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-[1.15]">
              Coaching that<br />comes to you
            </h2>
            <p className="mt-5 text-muted text-[16px] leading-relaxed">
              Max texts you personalized advice throughout the day. No app to open, no dashboard to check. Just real guidance in your messages.
            </p>
          </div>

          <div
            className={`flex-shrink-0 w-full max-w-[300px] md:max-w-[280px] lg:max-w-[300px] ${visible ? "animate-scale-in" : "opacity-0"}`}
            style={{ animationDelay: "200ms" }}
          >
            <Iphone15Pro>
              <IMessageScreen
                messages={messages}
                typing={typing}
                input={input}
                visible={visible}
                chatContainerRef={chatContainerRef}
                inputRef={inputRef}
                setInput={setInput}
                handleKeyDown={handleKeyDown}
                sendMessage={sendMessage}
              />
            </Iphone15Pro>
          </div>
        </div>
      </div>
    </section>
  );
}

function IMessageScreen({
  messages, typing, input, visible, chatContainerRef, inputRef, setInput, handleKeyDown, sendMessage,
}: {
  messages: Message[];
  typing: boolean;
  input: string;
  visible: boolean;
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  setInput: (v: string) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  sendMessage: () => void;
}) {
  return (
    <div className="w-full h-full bg-[#f2f2f7] flex flex-col overflow-hidden">
      {/* Status bar — sits beside Dynamic Island */}
      <div className="flex items-end justify-between px-6 pt-[14px] pb-0 h-[52px]">
        <span className="text-[11px] font-semibold text-black tracking-tight leading-none pb-[2px]">9:41</span>
        <div className="flex gap-[3px] items-end pb-[2px]">
          <svg width="13" height="9" viewBox="0 0 17 12" fill="black">
            <rect x="0" y="8" width="3" height="4" rx="0.5" />
            <rect x="4.5" y="5.5" width="3" height="6.5" rx="0.5" />
            <rect x="9" y="3" width="3" height="9" rx="0.5" />
            <rect x="13.5" y="0" width="3" height="12" rx="0.5" opacity="0.3" />
          </svg>
          <svg width="12" height="9" viewBox="0 0 16 12" fill="black">
            <path d="M8 2.4c2.5 0 4.8 1 6.5 2.7a.6.6 0 01-.85.85A8 8 0 008 3.5 8 8 0 002.35 5.95a.6.6 0 01-.85-.85A9.1 9.1 0 018 2.4z" />
            <path d="M8 5.6c1.7 0 3.3.7 4.4 1.8a.6.6 0 01-.85.85A4.8 4.8 0 008 6.8a4.8 4.8 0 00-3.55 1.45.6.6 0 01-.85-.85A6 6 0 018 5.6z" />
            <circle cx="8" cy="10.5" r="1.3" />
          </svg>
          <svg width="20" height="9" viewBox="0 0 25 12">
            <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="black" strokeWidth="1" fill="none" opacity="0.35" />
            <rect x="2" y="2" width="16" height="8" rx="1.2" fill="black" />
            <path d="M23 4.5v3a1.5 1.5 0 000-3z" fill="black" opacity="0.4" />
          </svg>
        </div>
      </div>

      {/* Nav bar */}
      <div className="px-2 pt-0.5 pb-1.5 flex items-center">
        <button className="p-0.5 text-[#007AFF] shrink-0 w-7" tabIndex={-1}>
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="flex-1 flex flex-col items-center min-w-0">
          <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-[#64D2FF] to-[#0A84FF] flex items-center justify-center">
            <span className="text-[9px] font-bold text-white leading-none">M</span>
          </div>
          <p className="text-[11px] font-semibold text-black leading-none mt-[2px]">max</p>
        </div>
        <button className="p-0.5 text-[#007AFF] shrink-0 w-7 flex justify-end" tabIndex={-1}>
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </button>
      </div>

      <div className="h-px bg-black/5 mx-2" />

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 px-2.5 py-1.5 space-y-[2px] overflow-y-auto overscroll-contain scrollbar-hide"
      >
        {messages.map((msg, i) => {
          const isMax = msg.from === "max";
          const isLast = i === messages.length - 1 || messages[i + 1]?.from !== msg.from;
          const delays = [500, 1100, 1700, 2300];
          const isInitial = i < initialMessages.length;

          return (
            <div
              key={i}
              className={`flex ${isMax ? "justify-start" : "justify-end"} ${
                isInitial ? (visible ? "animate-message-in" : "opacity-0") : "animate-message-in"
              }`}
              style={isInitial ? { animationDelay: `${delays[i]}ms` } : {}}
            >
              <div className="relative max-w-[80%]">
                <div
                  className={`px-[10px] py-[5px] text-[12.5px] leading-[1.35] ${
                    isMax
                      ? `bg-[#e9e9eb] text-black ${isLast ? "rounded-[16px] rounded-bl-[4px]" : "rounded-[16px]"}`
                      : `bg-[#007AFF] text-white ${isLast ? "rounded-[16px] rounded-br-[4px]" : "rounded-[16px]"}`
                  }`}
                >
                  {msg.text}
                </div>
                {isLast && (
                  <span className={`block text-[8px] mt-[1px] px-1 text-[#8e8e93]/50 ${isMax ? "text-left" : "text-right"}`}>
                    {msg.time}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {typing && (
          <div className="flex justify-start animate-message-in">
            <div className="bg-[#e9e9eb] rounded-[16px] rounded-bl-[4px] px-3 py-2 flex items-center gap-[3px]">
              <span className="w-[5px] h-[5px] bg-[#8e8e93]/50 rounded-full animate-[bounce_1.4s_ease-in-out_infinite]" />
              <span className="w-[5px] h-[5px] bg-[#8e8e93]/50 rounded-full animate-[bounce_1.4s_ease-in-out_infinite]" style={{ animationDelay: "200ms" }} />
              <span className="w-[5px] h-[5px] bg-[#8e8e93]/50 rounded-full animate-[bounce_1.4s_ease-in-out_infinite]" style={{ animationDelay: "400ms" }} />
            </div>
          </div>
        )}
        <div />
      </div>

      {/* Input */}
      <div className="px-2.5 pb-1 pt-0.5">
        <div className="flex items-center gap-1.5">
          <button className="w-6 h-6 rounded-full bg-[#8e8e93]/15 flex items-center justify-center shrink-0" tabIndex={-1}>
            <svg className="w-3.5 h-3.5 text-[#8e8e93]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
          <div className="flex-1 flex items-center bg-white border border-[#c7c7cc] rounded-full px-3 py-[4px]">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="iMessage"
              className="flex-1 text-[12px] bg-transparent text-black focus:outline-none placeholder:text-[#8e8e93]/50 min-w-0"
            />
          </div>
          <button
            onClick={sendMessage}
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
              input.trim() ? "bg-[#007AFF] cursor-pointer active:scale-90" : "bg-[#8e8e93]/15 cursor-default"
            }`}
            tabIndex={-1}
          >
            <svg className="w-3 h-3 -rotate-45 translate-x-[0.5px] -translate-y-[0.5px]" fill={input.trim() ? "white" : "#8e8e93"} viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Home indicator */}
      <div className="flex justify-center pb-1.5 pt-0.5">
        <div className="w-[80px] h-[3px] bg-black/15 rounded-full" />
      </div>
    </div>
  );
}
