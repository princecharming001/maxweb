"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import api, { type ChatConversation } from "@/lib/max/api";
import { queryKeys } from "@/lib/max/queryClient";
import { useMaxPaywallGate } from "@/hooks/useMaxPaywallGate";
import { Icon } from "@/components/max/icons";
import { ChatIcon } from "@/components/max/chat/chatIcons";
import { Spinner } from "@/components/max/ui";
import MessageBubble, { type ChatMessage } from "@/components/max/chat/MessageBubble";
import ChatDrawer from "@/components/max/chat/ChatDrawer";
import {
  SingleSelectChips,
  MultiSelectChips,
  ConfirmChange,
  SliderInput,
  HabitPicker,
  ThinkingDots,
  isCustomChip,
  type SliderSpec,
  type HabitPickerSpec,
} from "@/components/max/chat/ChatWidgets";

let idSeq = 0;
const nextId = () => `local-${++idSeq}`;

// Verbatim from iOS MaxChatScreen EMPTY_STARTERS.
const EMPTY_STARTERS = [
  "Build my plan for today",
  "What should I use on my skin?",
  "Rate my routine",
];

/** True when an error is just the user hitting Stop (axios cancel / abort). */
function isAbort(e: unknown): boolean {
  const err = e as { code?: string; name?: string; message?: string };
  return (
    err?.code === "ERR_CANCELED" ||
    err?.name === "CanceledError" ||
    err?.name === "AbortError" ||
    err?.message === "canceled"
  );
}

type ConvData = { conversations: ChatConversation[] };

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [listening, setListening] = useState(false);
  const [creating, setCreating] = useState(false);
  const [confirmBusy, setConfirmBusy] = useState(false);
  // Widget row is derived from the last assistant message; dismissing (habit
  // "skip", confirm decision, sending a reply) hides it without mutating.
  const [dismissedWidgetId, setDismissedWidgetId] = useState<string | null>(null);

  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const nudgeTried = useRef(false);
  const recognitionRef = useRef<unknown>(null);
  const abortRef = useRef<AbortController | null>(null);

  const conversationsQ = useQuery({
    queryKey: queryKeys.chatConversations,
    queryFn: () => api.listChatConversations(),
  });
  const historyQ = useQuery({
    queryKey: queryKeys.chatHistory(convId),
    queryFn: () => api.getChatHistory({ conversationId: convId }),
  });

  const conversations = useMemo(
    () => conversationsQ.data?.conversations ?? [],
    [conversationsQ.data],
  );

  // Seed thread from server history; restore any pending question's chooser.
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
          input_widget:
            (pq as { input_widget?: ChatMessage["extras"] })
              .input_widget as never,
        };
      }
    }
    setMessages(seeded);
    setMultiSel([]);
    setDismissedWidgetId(null);
  }, [historyQ.data]);

  // Proactive opener on an empty, brand-new thread (once).
  useEffect(() => {
    if (nudgeTried.current || historyQ.isLoading) return;
    if (historyQ.data && historyQ.data.messages.length === 0 && !convId) {
      nudgeTried.current = true;
      api
        .getChatNudge()
        .then((n) => {
          if (!n) return;
          setMessages((m) =>
            m.length
              ? m
              : [{ id: nextId(), role: "assistant", content: n.text, extras: { choices: n.choices } }],
          );
          api.markChatNudgeSeen(n.id);
        })
        .catch(() => undefined);
    }
  }, [historyQ.data, historyQ.isLoading, convId]);

  // Autoscroll on new content.
  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [messages, sending]);

  // ── Derived widget state (drives the answer row above the composer) ──────
  const lastAssistant = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return messages[i];
    }
    return undefined;
  }, [messages]);
  const extras = lastAssistant?.extras;
  const widgetSpec = extras?.input_widget as
    | ({ type?: string } & Record<string, unknown>)
    | null
    | undefined;
  const choices = extras?.choices ?? [];
  const isMulti = !!extras?.multi_choice;
  const confirm = extras?.confirm ?? null;
  const widgetOpen = !!lastAssistant && lastAssistant.id !== dismissedWidgetId && !sending;

  // ── Navigation between threads ───────────────────────────────────────────
  function resetThread() {
    nudgeTried.current = false;
    setMessages([]);
    setMultiSel([]);
    setDismissedWidgetId(null);
  }
  function goToConversation(id: string) {
    resetThread();
    setDrawerOpen(false);
    router.replace(`/app/coach?c=${id}`);
  }
  function newChat() {
    resetThread();
    setDrawerOpen(false);
    router.replace("/app/coach");
  }

  // ── Send (optimistic user bubble + typing dots + abortable request) ──────
  async function send(text: string, attachment?: { url: string; type: string }) {
    const body = text.trim();
    if ((!body && !attachment) || sending) return;
    if (gate("chat_send")) return; // paywall → /subscribe
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    setMultiSel([]);
    if (lastAssistant) setDismissedWidgetId(lastAssistant.id);
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
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const resp = await api.sendChatMessage(body || "What do you think of this?", {
        conversationId: convId ?? undefined,
        attachmentUrl: attachment?.url,
        attachmentType: attachment?.type,
        signal: controller.signal,
      });
      setMessages((m) => [
        ...m,
        { id: nextId(), role: "assistant", content: resp.response, extras: resp },
      ]);
      setDismissedWidgetId(null); // let the NEW reply's chooser (if any) show
      if (resp.conversation_id && resp.conversation_id !== convId) {
        router.replace(`/app/coach?c=${resp.conversation_id}`);
        qc.invalidateQueries({ queryKey: queryKeys.chatConversations });
      }
      // Schedule/maxes can change as a side effect of any turn.
      qc.invalidateQueries({ queryKey: queryKeys.plannerToday() });
      qc.invalidateQueries({ queryKey: queryKeys.schedulesActiveFull });
    } catch (e) {
      if (!isAbort(e)) {
        setMessages((m) => [
          ...m,
          {
            id: nextId(),
            role: "assistant",
            content: "Something went wrong reaching your coach. Try again.",
          },
        ]);
      }
    } finally {
      setSending(false);
      abortRef.current = null;
    }
  }

  // The single circular action button: stop while generating, else send if
  // there's text, else start voice dictation (iOS MorphSend).
  function onAction() {
    if (sending) {
      abortRef.current?.abort();
      return;
    }
    if (input.trim()) {
      void send(input);
      return;
    }
    if (gate("chat_voice")) return;
    toggleVoice();
  }

  // A "custom" chip means "let me type" — focus the input instead of sending.
  function onChoice(label: string) {
    if (isCustomChip(label)) {
      inputRef.current?.focus();
      return;
    }
    void send(label);
  }

  function toggleMulti(label: string) {
    setMultiSel((s) => (s.includes(label) ? s.filter((x) => x !== label) : [...s, label]));
  }

  // ── Habit picker submit: persist prefs, then confirm locally (iOS parity) ─
  async function applyHabits(spec: HabitPickerSpec, wanted: string[], avoided: string[]) {
    const id = lastAssistant?.id;
    if (!spec.schedule_id || (wanted.length === 0 && avoided.length === 0)) {
      if (id) setDismissedWidgetId(id);
      return;
    }
    try {
      await api.updateHabitPrefs(spec.schedule_id, wanted, avoided);
      const parts: string[] = [];
      if (wanted.length) parts.push(`added ${wanted.length}`);
      if (avoided.length) parts.push(`skipping ${avoided.length}`);
      setMessages((m) => [
        ...m,
        {
          id: nextId(),
          role: "assistant",
          content: `Updated your plan — ${parts.join(", ")}. Check the Today tab to see it.`,
        },
      ]);
      qc.invalidateQueries({ queryKey: queryKeys.plannerToday() });
      qc.invalidateQueries({ queryKey: queryKeys.schedulesActiveFull });
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: nextId(),
          role: "assistant",
          content: "Couldn't update those habits just now — you can tweak any task from the Today tab.",
        },
      ]);
    }
  }

  // ── Schedule-change confirm: Yes applies the proposal, No re-prompts ─────
  async function onConfirm(proposalId: string, accept: boolean) {
    if (confirmBusy) return;
    if (lastAssistant) setDismissedWidgetId(lastAssistant.id);
    setConfirmBusy(true);
    try {
      const res = (await api.confirmScheduleChange(proposalId, accept)) as {
        message?: string;
      };
      if (res?.message) {
        setMessages((m) => [...m, { id: nextId(), role: "assistant", content: res.message! }]);
      }
      if (accept) {
        qc.invalidateQueries({ queryKey: queryKeys.plannerToday() });
        qc.invalidateQueries({ queryKey: queryKeys.schedulesActiveFull });
      } else {
        inputRef.current?.focus();
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: nextId(),
          role: "assistant",
          content: "That didn't go through — tell me what you'd prefer and I'll line it up.",
        },
      ]);
    } finally {
      setConfirmBusy(false);
    }
  }

  // ── Image attach ("+"): upload then send with the attachment ─────────────
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

  // ── Voice dictation (Web Speech API; focus the field if unsupported) ─────
  function toggleVoice() {
    const w = window as {
      SpeechRecognition?: unknown;
      webkitSpeechRecognition?: unknown;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
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

  // ── Conversation management (drawer) ─────────────────────────────────────
  async function createConversation() {
    if (creating) return;
    setCreating(true);
    try {
      const { conversation } = await api.createChatConversation();
      qc.invalidateQueries({ queryKey: queryKeys.chatConversations });
      goToConversation(conversation.id);
    } catch {
      /* ignore */
    } finally {
      setCreating(false);
    }
  }
  async function renameConversation(id: string, title: string) {
    const prev = qc.getQueryData<ConvData>(queryKeys.chatConversations);
    qc.setQueryData<ConvData>(queryKeys.chatConversations, (old) =>
      old ? { conversations: old.conversations.map((c) => (c.id === id ? { ...c, title } : c)) } : old,
    );
    try {
      await api.renameChatConversation(id, title);
      qc.invalidateQueries({ queryKey: queryKeys.chatConversations });
    } catch {
      if (prev) qc.setQueryData(queryKeys.chatConversations, prev);
    }
  }
  async function deleteConversation(id: string) {
    const prev = qc.getQueryData<ConvData>(queryKeys.chatConversations);
    qc.setQueryData<ConvData>(queryKeys.chatConversations, (old) =>
      old ? { conversations: old.conversations.filter((c) => c.id !== id) } : old,
    );
    if (id === convId) newChat();
    try {
      await api.deleteChatConversation(id);
      qc.invalidateQueries({ queryKey: queryKeys.chatConversations });
    } catch {
      if (prev) qc.setQueryData(queryKeys.chatConversations, prev);
    }
  }

  const actionLabel = sending ? "Stop" : input.trim() ? "Send" : listening ? "Stop voice" : "Voice";

  return (
    <div className="flex h-[calc(100dvh-88px)] flex-col lg:h-[calc(100vh-80px)]">
      {/* ── Header: hamburger · sans Max · new chat ──────────────────────── */}
      <div className="border-mx-border mb-2 flex items-center justify-between border-b pb-3">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open chat list"
          className="text-mx-ink -ml-1 flex size-9 items-center justify-center"
        >
          <Icon name="menu" className="size-6" />
        </button>
        {/* iOS cg.headerTitle: Matter-SemiBold 17 / -0.2 tracking */}
        <div className="font-mx-sans text-mx-ink text-[17px] font-semibold leading-none tracking-[-0.2px]">
          Max
        </div>
        <button
          onClick={newChat}
          aria-label="New chat"
          className="text-mx-ink -mr-1 flex size-9 items-center justify-center"
        >
          <ChatIcon name="compose" className="size-[22px]" />
        </button>
      </div>

      <ChatDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        conversations={conversations}
        activeId={convId}
        loading={conversationsQ.isLoading}
        creating={creating}
        onSelect={goToConversation}
        onNewChat={createConversation}
        onRename={renameConversation}
        onDelete={deleteConversation}
      />

      {/* ── Thread ───────────────────────────────────────────────────────── */}
      <div ref={threadRef} className="min-h-0 flex-1 space-y-5 overflow-y-auto py-2">
        {historyQ.isLoading && messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <Spinner />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="text-mx-ink text-[24px] font-semibold tracking-[-0.4px]">
              What can I help with?
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {EMPTY_STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => void send(s)}
                  className="border-mx-divider bg-mx-card hover:border-mx-ink/30 rounded-full border px-[15px] py-2.5 text-[14px] font-medium text-[#3D3D3D] transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
        {sending ? <ThinkingDots /> : null}
      </div>

      {/* ── Answer row (chips / slider / habit picker / confirm) ──────────── */}
      <div className="pt-2">
        {widgetOpen && widgetSpec?.type === "slider" ? (
          <SliderInput
            spec={widgetSpec as unknown as SliderSpec}
            onSubmit={(v) => void send(String(v))}
          />
        ) : widgetOpen && widgetSpec?.type === "habit_picker" ? (
          <HabitPicker
            spec={widgetSpec as unknown as HabitPickerSpec}
            onSubmit={(wanted, avoided) =>
              void applyHabits(widgetSpec as unknown as HabitPickerSpec, wanted, avoided)
            }
            onSkip={() => lastAssistant && setDismissedWidgetId(lastAssistant.id)}
          />
        ) : widgetOpen && confirm ? (
          <ConfirmChange
            busy={confirmBusy}
            onYes={() => void onConfirm(confirm.proposal_id, true)}
            onNo={() => void onConfirm(confirm.proposal_id, false)}
          />
        ) : widgetOpen && choices.length > 0 && !isMulti ? (
          <SingleSelectChips choices={choices} onPick={onChoice} />
        ) : widgetOpen && choices.length > 0 && isMulti ? (
          <MultiSelectChips
            choices={choices}
            selected={multiSel}
            onToggle={toggleMulti}
            onSubmit={() => void send(multiSel.join(", "))}
            onCustomFocus={() => inputRef.current?.focus()}
          />
        ) : null}

        {/* ── Composer pill: +  ·  input  ·  morph action ─────────────────── */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="border-mx-divider bg-mx-card shadow-mx-sm flex min-h-[50px] items-center gap-1 rounded-[26px] border px-1.5 py-1.5"
        >
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading || sending}
            aria-label="Attach photo"
            className="text-mx-ink-2 hover:text-mx-ink flex size-9 shrink-0 items-center justify-center rounded-full disabled:opacity-40"
          >
            {uploading ? <Spinner className="size-4" /> : <Icon name="plus" className="size-6" />}
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              const el = e.target;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            rows={1}
            placeholder="Ask Max anything"
            className="text-mx-ink placeholder:text-mx-muted max-h-[120px] flex-1 resize-none bg-transparent px-1.5 py-1.5 text-[16px] leading-5 outline-none"
          />
          <button
            type="button"
            onClick={onAction}
            aria-label={actionLabel}
            className={`flex size-9 shrink-0 items-center justify-center rounded-full text-white transition ${
              listening ? "bg-mx-error" : "bg-mx-ink"
            }`}
          >
            {sending ? (
              <span className="size-3.5 rounded-[3px] bg-white" />
            ) : input.trim() ? (
              <ChatIcon name="arrowUp" className="size-5" />
            ) : listening ? (
              <span className="size-3.5 rounded-[3px] bg-white" />
            ) : (
              <Icon name="mic" className="size-[18px]" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CoachPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      }
    >
      <CoachInner />
    </Suspense>
  );
}
