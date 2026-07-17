"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/max/api";
import { queryKeys } from "@/lib/max/queryClient";
import { useMaxPaywallGate } from "@/hooks/useMaxPaywallGate";
import { Icon } from "@/components/max/icons";
import { Spinner } from "@/components/max/ui";
import MessageBubble, { type ChatMessage } from "@/components/max/chat/MessageBubble";
import CoachPicker from "@/components/max/chat/CoachPicker";

let idSeq = 0;
const nextId = () => `local-${++idSeq}`;

// Verbatim from iOS ChatConversationsDrawer / MaxChatScreen.
const EMPTY_STARTERS = [
  "Build my plan for today",
  "What should I use on my skin?",
  "Rate my routine",
];
const CUSTOM_CHIPS = new Set([
  "something else",
  "other",
  "none of these",
  "type my own",
  "type your own",
]);

function CoachInner() {
  const qc = useQueryClient();
  const gate = useMaxPaywallGate();
  const router = useRouter();
  const params = useSearchParams();
  const convId = params.get("c");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [multiSel, setMultiSel] = useState<string[]>([]);
  const [sliderVal, setSliderVal] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [listening, setListening] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const nudgeTried = useRef(false);
  const recognitionRef = useRef<unknown>(null);

  const conversationsQ = useQuery({
    queryKey: queryKeys.chatConversations,
    queryFn: () => api.listChatConversations(),
  });
  const historyQ = useQuery({
    queryKey: queryKeys.chatHistory(convId),
    queryFn: () => api.getChatHistory({ conversationId: convId }),
  });

  // Seed thread from server history.
  useEffect(() => {
    if (!historyQ.data) return;
    const seeded: ChatMessage[] = historyQ.data.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      attachmentUrl: (m as { attachment_url?: string }).attachment_url,
      attachmentType: (m as { attachment_type?: string }).attachment_type,
    }));
    const pq = historyQ.data.pending_question;
    if (pq && seeded.length) {
      const last = seeded[seeded.length - 1];
      if (last.role === "assistant") {
        last.extras = {
          choices: pq.choices,
          multi_choice: pq.multi_choice,
          input_widget: (pq as { input_widget?: ChatMessage["extras"] }).input_widget as never,
        };
      }
    }
    setMessages(seeded);
    setMultiSel([]);
    setSliderVal(null);
  }, [historyQ.data]);

  // Proactive nudge on an empty thread (once).
  useEffect(() => {
    if (nudgeTried.current || historyQ.isLoading) return;
    if (historyQ.data && historyQ.data.messages.length === 0 && !convId) {
      nudgeTried.current = true;
      api.getChatNudge().then((n) => {
        if (!n) return;
        setMessages((m) =>
          m.length
            ? m
            : [{ id: nextId(), role: "assistant", content: n.text, extras: { choices: n.choices } }],
        );
        api.markChatNudgeSeen(n.id);
      });
    }
  }, [historyQ.data, historyQ.isLoading, convId]);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [messages, sending]);

  const lastExtras = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return messages[i].extras;
    }
    return undefined;
  }, [messages]);

  const widget = lastExtras?.input_widget as
    | { type?: string; schedule_id?: string; min?: number; max?: number; step?: number; default?: number; label?: string; unit?: string }
    | undefined;
  const multiChoices = lastExtras?.multi_choice && lastExtras.choices ? lastExtras.choices : null;

  async function send(text: string, attachment?: { url: string; type: string }) {
    const body = text.trim();
    if ((!body && !attachment) || sending) return;
    if (gate("chat")) return;
    setInput("");
    setMultiSel([]);
    setSliderVal(null);
    setMessages((m) => [
      ...m,
      {
        id: nextId(),
        role: "user",
        content: body,
        attachmentUrl: attachment?.url,
        attachmentType: attachment?.type,
      },
    ]);
    setSending(true);
    try {
      const resp = await api.sendChatMessage(body || "What do you think of this?", {
        conversationId: convId ?? undefined,
        attachmentUrl: attachment?.url,
        attachmentType: attachment?.type,
      });
      setMessages((m) => [
        ...m,
        { id: nextId(), role: "assistant", content: resp.response, extras: resp },
      ]);
      if (resp.conversation_id && resp.conversation_id !== convId) {
        router.replace(`/app/coach?c=${resp.conversation_id}`);
        qc.invalidateQueries({ queryKey: queryKeys.chatConversations });
      }
    } catch {
      setMessages((m) => [
        ...m,
        { id: nextId(), role: "assistant", content: "Something went wrong reaching your coach. Try again." },
      ]);
    } finally {
      setSending(false);
    }
  }

  // A "custom" chip means "let me type" — focus the input instead of sending.
  function onChoice(label: string) {
    if (CUSTOM_CHIPS.has(label.trim().toLowerCase())) {
      inputRef.current?.focus();
      return;
    }
    send(label);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    if (gate("chat_image")) return;
    setUploading(true);
    try {
      const { url } = await api.uploadChatFile(file, file.name || "photo.jpg");
      await send(input, { url, type: "image" });
    } catch {
      /* ignore */
    } finally {
      setUploading(false);
    }
  }

  function toggleVoice() {
    const SR =
      (window as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ||
      (window as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
    if (!SR) {
      inputRef.current?.focus();
      return;
    }
    if (listening) {
      (recognitionRef.current as { stop?: () => void })?.stop?.();
      return;
    }
    const rec = new (SR as new () => {
      lang: string;
      interimResults: boolean;
      continuous: boolean;
      onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
      onend: () => void;
      start: () => void;
      stop: () => void;
    })();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      setInput(t);
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  }

  const voiceSupported =
    typeof window !== "undefined" &&
    !!((window as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ||
      (window as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition);

  function newChat() {
    router.replace("/app/coach");
    setMessages([]);
    setDrawerOpen(false);
    nudgeTried.current = false;
  }
  async function deleteConversation(id: string) {
    await api.deleteChatConversation(id).catch(() => undefined);
    qc.invalidateQueries({ queryKey: queryKeys.chatConversations });
    if (id === convId) newChat();
  }

  const conversations = conversationsQ.data?.conversations ?? [];

  const sidebarBody = (
    <>
      <button
        onClick={newChat}
        className="border-mx-border text-mx-ink hover:bg-mx-surface rounded-mx-md flex items-center justify-center gap-2 border py-2.5 text-[14px] font-medium transition"
      >
        <Icon name="plus" className="size-4" /> New chat
      </button>
      <div className="mx-label mt-4 mb-1">Recent</div>
      <div className="flex-1 space-y-0.5 overflow-y-auto">
        {conversations.map((c) => (
          <div key={c.id} className="group relative flex items-center">
            <button
              onClick={() => {
                router.replace(`/app/coach?c=${c.id}`);
                setDrawerOpen(false);
              }}
              className={`w-full truncate rounded-mx-md px-3 py-2 pr-8 text-left text-[13px] transition ${
                c.id === convId ? "bg-mx-accent-muted text-mx-accent" : "text-mx-ink-2 hover:bg-mx-surface"
              }`}
            >
              {c.title || "New chat"}
            </button>
            <button
              onClick={() => deleteConversation(c.id)}
              aria-label="Delete conversation"
              className="text-mx-muted hover:text-mx-error absolute right-2 opacity-0 transition group-hover:opacity-100"
            >
              <Icon name="trash" className="size-3.5" />
            </button>
          </div>
        ))}
        {conversations.length === 0 ? (
          <p className="text-mx-muted px-3 py-2 text-[12px]">No conversations yet.</p>
        ) : null}
      </div>
      <div className="border-mx-border mt-4 border-t pt-4">
        <CoachPicker />
      </div>
    </>
  );

  return (
    <div className="flex h-[calc(100vh-88px)] flex-col lg:h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="border-mx-border mb-3 flex items-center justify-between border-b pb-3">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Menu"
          className="text-mx-ink -ml-1 p-1"
        >
          <Icon name="menu" className="size-6" />
        </button>
        <div className="font-mx-serif text-mx-ink text-[20px]">Max</div>
        <button onClick={newChat} aria-label="New chat" className="text-mx-ink -mr-1 p-1">
          <Icon name="plus" className="size-5" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 gap-6">
        {/* Conversations + coach picker live in a drawer (phone-width column). */}
        {drawerOpen ? (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
            <div className="bg-mx-bg absolute inset-y-0 left-0 flex w-[280px] flex-col p-4 shadow-xl">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mx-serif text-mx-ink text-[18px]">Max</span>
                <button onClick={() => setDrawerOpen(false)} aria-label="Close">
                  <Icon name="x" className="size-5" />
                </button>
              </div>
              {sidebarBody}
            </div>
          </div>
        ) : null}

        {/* Thread */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div ref={threadRef} className="flex-1 space-y-5 overflow-y-auto pr-1">
            {historyQ.isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Spinner />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                <div className="font-mx-serif text-mx-ink text-[26px]">What can I help with?</div>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {EMPTY_STARTERS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="border-mx-border text-mx-ink hover:border-mx-accent hover:text-mx-accent rounded-full border px-4 py-2 text-[13px] transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  onChoice={onChoice}
                  onConfirm={async (pid, accept) => {
                    try {
                      await api.confirmScheduleChange(pid, accept);
                      qc.invalidateQueries({ queryKey: queryKeys.plannerToday() });
                    } catch {
                      /* ignore */
                    }
                  }}
                />
              ))
            )}
            {sending ? (
              <div className="flex items-center gap-1.5">
                <span className="bg-mx-muted size-1.5 animate-bounce rounded-full [animation-delay:-0.3s]" />
                <span className="bg-mx-muted size-1.5 animate-bounce rounded-full [animation-delay:-0.15s]" />
                <span className="bg-mx-muted size-1.5 animate-bounce rounded-full" />
              </div>
            ) : null}
          </div>

          {/* Widgets */}
          {multiChoices ? (
            <div className="border-mx-border mt-3 border-t pt-3">
              <div className="flex flex-wrap gap-2">
                {multiChoices.map((c, i) => {
                  const on = multiSel.includes(c);
                  return (
                    <button
                      key={i}
                      onClick={() => setMultiSel((s) => (on ? s.filter((x) => x !== c) : [...s, c]))}
                      className={`rounded-full border px-3.5 py-1.5 text-[13px] transition ${
                        on ? "border-mx-accent bg-mx-accent-muted text-mx-accent" : "border-mx-border text-mx-ink"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
              <button
                disabled={!multiSel.length}
                onClick={() => send(multiSel.join(", "))}
                className="bg-mx-ink mt-3 rounded-mx-md px-5 py-2 text-[13px] font-medium text-white disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          ) : widget?.type === "slider" ? (
            <SliderInput
              widget={widget}
              value={sliderVal}
              onChange={setSliderVal}
              onSubmit={(v) => send(String(v))}
            />
          ) : widget?.type === "habit_picker" ? (
            <HabitPicker
              scheduleId={widget.schedule_id}
              onDone={(summary) => send(summary)}
            />
          ) : null}

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-mx-border mt-3 flex items-end gap-2 border-t pt-3"
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              aria-label="Attach image"
              className="text-mx-muted hover:text-mx-ink flex size-11 shrink-0 items-center justify-center"
            >
              {uploading ? <Spinner className="size-4" /> : <Icon name="plus" className="size-5" />}
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Ask Max anything"
              className="bg-mx-surface-light text-mx-ink placeholder:text-mx-muted focus:border-mx-accent max-h-32 flex-1 resize-none rounded-mx-md border border-mx-border px-3.5 py-2.5 text-[14px] outline-none"
            />
            {voiceSupported ? (
              <button
                type="button"
                onClick={toggleVoice}
                aria-label="Voice input"
                className={`flex size-11 shrink-0 items-center justify-center rounded-mx-md ${
                  listening ? "bg-mx-error text-white" : "text-mx-muted hover:text-mx-ink"
                }`}
              >
                <Icon name="mic" className="size-5" />
              </button>
            ) : null}
            <button
              type="submit"
              disabled={sending || (!input.trim() && !uploading)}
              className="bg-mx-accent flex size-11 shrink-0 items-center justify-center rounded-mx-md text-white disabled:opacity-40"
              aria-label="Send"
            >
              <Icon name="chevron" className="size-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function HabitPicker({
  scheduleId,
  onDone,
}: {
  scheduleId?: string;
  onDone: (summary: string) => void;
}) {
  const [wanted, setWanted] = useState("");
  const [avoided, setAvoided] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit() {
    if (!scheduleId) return;
    setSaving(true);
    const w = wanted.split(",").map((s) => s.trim()).filter(Boolean);
    const a = avoided.split(",").map((s) => s.trim()).filter(Boolean);
    try {
      await api.updateHabitPrefs(scheduleId, w, a);
      onDone(`Want: ${w.join(", ") || "—"} · Avoid: ${a.join(", ") || "—"}`);
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="border-mx-border mt-3 space-y-2 border-t pt-3">
      <input
        value={wanted}
        onChange={(e) => setWanted(e.target.value)}
        placeholder="Habits you want (comma-separated)"
        className="bg-mx-surface-light text-mx-ink placeholder:text-mx-muted w-full rounded-mx-md border border-mx-border px-3 py-2 text-[13px] outline-none"
      />
      <input
        value={avoided}
        onChange={(e) => setAvoided(e.target.value)}
        placeholder="Habits to avoid"
        className="bg-mx-surface-light text-mx-ink placeholder:text-mx-muted w-full rounded-mx-md border border-mx-border px-3 py-2 text-[13px] outline-none"
      />
      <button
        onClick={submit}
        disabled={saving}
        className="bg-mx-ink rounded-mx-md px-5 py-2 text-[13px] font-medium text-white disabled:opacity-50"
      >
        Save
      </button>
    </div>
  );
}

interface SliderWidget {
  type?: string;
  min?: number;
  max?: number;
  step?: number;
  default?: number;
  label?: string;
  unit?: string;
}
function SliderInput({
  widget,
  value,
  onChange,
  onSubmit,
}: {
  widget: SliderWidget;
  value: number | null;
  onChange: (v: number) => void;
  onSubmit: (v: number) => void;
}) {
  const min = widget.min ?? 0;
  const max = widget.max ?? 100;
  const step = widget.step ?? 1;
  const v = value ?? widget.default ?? min;
  return (
    <div className="border-mx-border mt-3 border-t pt-3">
      {widget.label ? <div className="text-mx-ink-2 mb-2 text-[13px]">{widget.label}</div> : null}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={v}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1"
        />
        <span className="text-mx-ink w-16 text-right text-[14px] font-medium tabular-nums">
          {v}
          {widget.unit ? ` ${widget.unit}` : ""}
        </span>
      </div>
      <button
        onClick={() => onSubmit(v)}
        className="bg-mx-ink mt-3 rounded-mx-md px-5 py-2 text-[13px] font-medium text-white"
      >
        Submit
      </button>
    </div>
  );
}

export default function CoachPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Spinner /></div>}>
      <CoachInner />
    </Suspense>
  );
}
