"use client";

/**
 * Chat sidebar — the web port of the iOS ChatConversationsDrawer. Matches the
 * app's floating liquid-glass panel: NO backdrop dim (tap-out still closes),
 * a rounded-30 light-glass card floating from the top-left (360pt — the iOS
 * source's own web width), content-hugging height with the recent list capped
 * at 240px, serif "Max" header, "New chat" row, conversation rows with an
 * always-visible trash affordance (double-click = iOS long-press rename), and
 * the coach persona + length controls stacked at the bottom (CoachPicker).
 */

import { useCallback, useEffect, useState } from "react";
import type { ChatConversation } from "@/lib/max/api";
import { Icon } from "@/components/max/icons";
import { Spinner } from "@/components/max/ui";
import CoachPicker from "./CoachPicker";

function formatWhen(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  return sameDay
    ? d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ChatDrawer({
  open,
  onClose,
  conversations,
  activeId,
  loading,
  creating,
  onSelect,
  onNewChat,
  onRename,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  conversations: ChatConversation[];
  activeId: string | null;
  loading: boolean;
  creating: boolean;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}) {
  // Keep mounted through the exit transition; drive the slide with `shown`.
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  useEffect(() => {
    if (open) {
      setMounted(true);
      const r = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(r);
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), 220);
    return () => clearTimeout(t);
  }, [open]);

  const startRename = useCallback((c: ChatConversation) => {
    setRenamingId(c.id);
    setRenameValue(c.title || "");
  }, []);
  const commitRename = useCallback(() => {
    if (!renamingId) return;
    const title = renameValue.trim();
    if (title) onRename(renamingId, title);
    setRenamingId(null);
    setRenameValue("");
  }, [renamingId, renameValue, onRename]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* iOS: opening the drawer must NOT dim the screen — only the panel is
          glass. This layer is a transparent tap-out catcher. */}
      <div className="absolute inset-0" onClick={onClose} aria-label="Close" />

      {/* Floating liquid-glass panel (iOS drawerShadow + drawerClip +
          LiquidGlassFill): left 10 / top 10, radius 30, luminous rim, soft
          drop shadow, light frosted material, content-hugging height. */}
      <div
        className={`absolute left-2.5 top-2.5 flex max-h-[calc(100dvh-20px)] w-[360px] max-w-[86vw] flex-col overflow-hidden rounded-[30px] border border-white/75 bg-[#f8f8fa]/90 px-4 pb-4 pt-6 shadow-[4px_10px_26px_rgba(0,0,0,0.18)] backdrop-blur-2xl transition-transform duration-200 ease-out supports-[backdrop-filter]:bg-white/60 ${
          shown ? "translate-x-0" : "-translate-x-[calc(100%+38px)]"
        }`}
      >
        {/* Header */}
        <div className="mb-3.5 flex shrink-0 items-center justify-between">
          <span className="font-mx-serif text-mx-ink text-[26px] leading-none tracking-[-0.4px]">
            Max
          </span>
          <button
            onClick={onClose}
            aria-label="Close chat list"
            className="text-mx-ink/55 hover:text-mx-ink flex size-7 items-center justify-center rounded-full bg-white/40 transition"
          >
            <Icon name="x" className="size-[18px]" />
          </button>
        </div>

        {/* New chat */}
        <button
          onClick={onNewChat}
          disabled={creating}
          className="rounded-mx-sm text-mx-ink mb-3.5 flex h-[38px] shrink-0 items-center justify-center gap-1.5 border border-black/[0.13] bg-white/40 text-[13px] font-semibold transition hover:bg-white/[0.58] disabled:opacity-60"
        >
          {creating ? (
            <Spinner className="size-4" />
          ) : (
            <>
              <Icon name="plus" className="size-[15px]" /> New chat
            </>
          )}
        </button>

        {/* Recent — iOS caps this at 240px so the panel hugs its content and a
            long history scrolls inside instead of stretching the panel. */}
        <div className="flex max-h-[240px] min-h-0 flex-col">
          <div className="mx-label mb-2 shrink-0">Recent</div>
          <div className="min-h-0 space-y-0.5 overflow-y-auto pb-3">
            {loading && conversations.length === 0 ? (
              <div className="pt-3">
                <Spinner className="size-4" />
              </div>
            ) : null}
            {!loading && conversations.length === 0 ? (
              <p className="text-mx-ink/35 mt-2 text-[12px] tracking-[0.2px]">no chats yet</p>
            ) : null}
            {conversations.map((c) => {
              const isActive = c.id === activeId;
              const isRenaming = renamingId === c.id;
              return (
                <div
                  key={c.id}
                  className={`flex items-center rounded-lg px-2.5 py-[9px] transition ${
                    isActive ? "bg-white/[0.58]" : "hover:bg-white/40"
                  }`}
                >
                  {isRenaming ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename();
                        if (e.key === "Escape") {
                          setRenamingId(null);
                          setRenameValue("");
                        }
                      }}
                      maxLength={60}
                      placeholder="title"
                      className="text-mx-ink min-w-0 flex-1 rounded-md border border-black/[0.13] bg-white/40 px-1.5 py-1 text-[13px] outline-none"
                    />
                  ) : (
                    <button
                      onClick={() => onSelect(c.id)}
                      onDoubleClick={() => startRename(c)}
                      title="Double-click to rename"
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="text-mx-ink truncate text-[13px] font-medium tracking-[0.1px]">
                        {c.title || "new chat"}
                      </div>
                      <div className="text-mx-ink/35 mt-px text-[11px]">
                        {formatWhen(c.last_message_at || c.created_at)}
                      </div>
                    </button>
                  )}
                  {!isRenaming ? (
                    // iOS: a single, always-visible trash affordance per row.
                    <button
                      onClick={() => onDelete(c.id)}
                      aria-label={`Delete chat: ${c.title || "new chat"}`}
                      className="text-mx-ink/35 hover:text-mx-error ml-1 flex size-6 shrink-0 items-center justify-center transition"
                    >
                      <Icon name="trash" className="size-3.5" />
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Settings — coach persona + response length, stacked at the bottom */}
        <div className="border-mx-border mt-1 shrink-0 border-t pt-3.5">
          <CoachPicker />
        </div>
      </div>
    </div>
  );
}
