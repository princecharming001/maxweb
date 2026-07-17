"use client";

import type { ChatResponse } from "@/lib/max/api";
import api from "@/lib/max/api";
import { VisualBlockRenderer } from "./VisualBlocks";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachmentUrl?: string;
  attachmentType?: string;
  extras?: Partial<ChatResponse>;
}

/** Very light markdown: paragraphs, **bold**, and - bullets. */
function renderText(content: string) {
  const lines = content.split("\n");
  return lines.map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-2" />;
    const bullet = /^\s*[-•]\s+/.test(line);
    const text = line.replace(/^\s*[-•]\s+/, "");
    const parts = text.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      p.startsWith("**") && p.endsWith("**") ? (
        <strong key={j} className="font-semibold">
          {p.slice(2, -2)}
        </strong>
      ) : (
        <span key={j}>{p}</span>
      ),
    );
    return (
      <p key={i} className={bullet ? "flex gap-1.5" : ""}>
        {bullet ? <span className="text-mx-muted">•</span> : null}
        <span>{parts}</span>
      </p>
    );
  });
}

export default function MessageBubble({
  message,
  onChoice,
  onConfirm,
}: {
  message: ChatMessage;
  onChoice?: (label: string) => void;
  onConfirm?: (proposalId: string, accept: boolean) => void;
}) {
  const isUser = message.role === "user";
  const extras = message.extras;

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        {message.attachmentUrl && message.attachmentType === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={api.resolveAttachmentUrl(message.attachmentUrl)}
            alt=""
            className="max-h-64 max-w-[80%] rounded-2xl rounded-br-md object-cover"
          />
        ) : null}
        {message.content ? (
          <div className="bg-mx-accent max-w-[80%] rounded-2xl rounded-br-md px-4 py-2.5 text-[14px] leading-relaxed text-white">
            {message.content}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="text-mx-ink max-w-[85%] space-y-1 text-[14px] leading-relaxed">
        {renderText(message.content)}
      </div>

      {/* Visual blocks */}
      {extras?.visual_blocks?.map((b, i) => (
        <div key={i} className="w-full max-w-[85%]">
          <VisualBlockRenderer block={b} />
        </div>
      ))}

      {/* Product cards */}
      {extras?.products?.length ? (
        <div className="grid w-full max-w-[85%] gap-2 sm:grid-cols-2">
          {extras.products.map((p, i) => (
            <a
              key={i}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-mx-card rounded-mx-md border border-mx-border hover:border-mx-accent flex gap-3 p-3 transition"
            >
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={api.resolveAttachmentUrl(p.image)}
                  alt=""
                  className="size-12 rounded-md object-cover"
                />
              ) : null}
              <div className="min-w-0">
                <div className="text-mx-ink truncate text-[13px] font-medium">
                  {p.name}
                </div>
                {p.brand ? (
                  <div className="text-mx-muted text-[12px]">{p.brand}</div>
                ) : null}
              </div>
            </a>
          ))}
        </div>
      ) : null}

      {/* Confirm proposal */}
      {extras?.confirm ? (
        <div className="bg-mx-surface-light rounded-mx-md border border-mx-border w-full max-w-[85%] p-3">
          <p className="text-mx-ink text-[13px]">{extras.confirm.summary}</p>
          <div className="mt-2.5 flex gap-2">
            <button
              onClick={() => onConfirm?.(extras.confirm!.proposal_id, true)}
              className="bg-mx-accent rounded-mx-sm px-4 py-1.5 text-[13px] font-medium text-white"
            >
              Yes, do it
            </button>
            <button
              onClick={() => onConfirm?.(extras.confirm!.proposal_id, false)}
              className="bg-mx-surface text-mx-ink rounded-mx-sm px-4 py-1.5 text-[13px]"
            >
              No
            </button>
          </div>
        </div>
      ) : null}

      {/* Single-select choice chips */}
      {extras?.choices?.length && !extras.multi_choice ? (
        <div className="flex flex-wrap gap-2">
          {extras.choices.map((c, i) => (
            <button
              key={i}
              onClick={() => onChoice?.(c)}
              className="border-mx-border text-mx-ink hover:border-mx-accent hover:text-mx-accent rounded-full border px-3.5 py-1.5 text-[13px] transition"
            >
              {c}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
