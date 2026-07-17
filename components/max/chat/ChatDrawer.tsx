"use client";

/**
 * Chat sidebar — the web port of the iOS ChatConversationsDrawer. A left
 * slide-over panel over a full-screen overlay: serif "Max" + close, "New chat",
 * the recent-conversation list (rename / delete), and the coach persona + length
 * controls (reused CoachPicker). The iOS drawer is a floating glass panel; on
 * web it's a solid slide-over opened by the header hamburger.
 */

import { useCallback, useEffect, useState } from "react";
import type { ChatConversation } from "@/lib/max/api";
import { Icon } from "@/components/max/icons";
import { ChatIcon } from "./chatIcons";
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
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${shown ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
        aria-label="Close"
      />
      {/* Slide-over panel */}
      <div
        className={`bg-mx-bg absolute inset-y-0 left-0 flex w-[320px] max-w-[86vw] flex-col p-4 shadow-xl transition-transform duration-200 ease-out ${
          shown ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="mb-3.5 flex items-center justify-between">
          <span className="font-mx-serif text-mx-ink text-[26px] leading-none tracking-[-0.4px]">
            Max
          </span>
          <button
            onClick={onClose}
            aria-label="Close chat list"
            className="bg-mx-surface text-mx-ink-2 hover:text-mx-ink flex size-7 items-center justify-center rounded-full transition"
          >
            <Icon name="x" className="size-4" />
          </button>
        </div>

        {/* New chat */}
        <button
          onClick={onNewChat}
          disabled={creating}
          className="border-mx-border bg-mx-surface text-mx-ink hover:bg-mx-surface-light rounded-mx-md mb-3.5 flex h-[38px] items-center justify-center gap-1.5 border text-[13px] font-semibold transition disabled:opacity-60"
        >
          {creating ? (
            <Spinner className="size-4" />
          ) : (
            <>
              <Icon name="plus" className="size-4" /> New chat
            </>
          )}
        </button>

        {/* Recent — fills available space, scrolls internally */}
        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="mx-label mb-2">Recent</div>
          <div className="h-full space-y-0.5 overflow-y-auto pb-2">
            {loading && conversations.length === 0 ? (
              <div className="pt-3">
                <Spinner className="size-4" />
              </div>
            ) : null}
            {!loading && conversations.length === 0 ? (
              <p className="text-mx-muted mt-2 text-[12px] tracking-wide">no chats yet</p>
            ) : null}
            {conversations.map((c) => {
              const isActive = c.id === activeId;
              const isRenaming = renamingId === c.id;
              return (
                <div
                  key={c.id}
                  className={`group flex items-center rounded-mx-sm px-2.5 py-2 transition ${
                    isActive ? "bg-mx-surface" : "hover:bg-mx-surface"
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
                      className="border-mx-border bg-mx-card text-mx-ink rounded-mx-sm min-w-0 flex-1 border px-2 py-1 text-[13px] outline-none"
                    />
                  ) : (
                    <button
                      onClick={() => onSelect(c.id)}
                      onDoubleClick={() => startRename(c)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="text-mx-ink truncate text-[13px] font-medium">
                        {c.title || "new chat"}
                      </div>
                      <div className="text-mx-muted text-[11px]">
                        {formatWhen(c.last_message_at || c.created_at)}
                      </div>
                    </button>
                  )}
                  {!isRenaming ? (
                    <div className="ml-1 flex shrink-0 items-center opacity-0 transition group-hover:opacity-100">
                      <button
                        onClick={() => startRename(c)}
                        aria-label={`Rename chat: ${c.title || "new chat"}`}
                        className="text-mx-muted hover:text-mx-ink flex size-6 items-center justify-center"
                      >
                        <ChatIcon name="compose" className="size-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(c.id)}
                        aria-label={`Delete chat: ${c.title || "new chat"}`}
                        className="text-mx-muted hover:text-mx-error flex size-6 items-center justify-center"
                      >
                        <Icon name="trash" className="size-3.5" />
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Settings — coach persona + response length */}
        <div className="border-mx-border mt-3 border-t pt-4">
          <CoachPicker />
        </div>
      </div>
    </div>
  );
}
