"use client";

import { useState } from "react";
import type { ChatResponse } from "@/lib/max/api";
import api from "@/lib/max/api";
import { Icon } from "@/components/max/icons";
import { ChatIcon } from "./chatIcons";
import { VisualBlockRenderer } from "./VisualBlocks";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachmentUrl?: string;
  attachmentType?: string;
  extras?: Partial<ChatResponse>;
}

/* ── Inline markdown: **bold**, [label](url), and bare URLs. ─────────────── */
const INLINE = /(\[[^\]]+\]\(https?:\/\/[^\s)]+\))|(\*\*[^*]+\*\*)|(https?:\/\/[^\s)]+)/g;
function renderInline(text: string, keyBase: string) {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  INLINE.lastIndex = 0;
  while ((m = INLINE.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    if (m[1]) {
      // [label](url)
      const lbl = tok.slice(1, tok.indexOf("]"));
      const url = tok.slice(tok.indexOf("(") + 1, -1);
      nodes.push(
        <a
          key={`${keyBase}-a${i}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-mx-accent underline"
        >
          {lbl}
        </a>,
      );
    } else if (m[2]) {
      nodes.push(
        <strong key={`${keyBase}-b${i}`} className="font-semibold">
          {tok.slice(2, -2)}
        </strong>,
      );
    } else {
      nodes.push(
        <a
          key={`${keyBase}-u${i}`}
          href={tok}
          target="_blank"
          rel="noopener noreferrer"
          className="text-mx-accent underline"
        >
          {tok}
        </a>,
      );
    }
    last = m.index + tok.length;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/* Block-level: ### headings, - / • bullets, blank lines, paragraphs. */
function renderRichText(content: string) {
  const lines = content.split("\n");
  return lines.map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-2" />;
    const heading = /^\s*#{1,6}\s+/.test(line);
    if (heading) {
      const text = line.replace(/^\s*#{1,6}\s+/, "");
      return (
        <p key={i} className="text-mx-ink mt-1 text-[16px] font-semibold">
          {renderInline(text, `h${i}`)}
        </p>
      );
    }
    const bullet = /^\s*[-•]\s+/.test(line);
    const text = line.replace(/^\s*[-•]\s+/, "");
    if (bullet) {
      return (
        <p key={i} className="flex gap-2">
          <span className="text-mx-muted select-none">•</span>
          <span>{renderInline(text, `l${i}`)}</span>
        </p>
      );
    }
    return <p key={i}>{renderInline(text, `p${i}`)}</p>;
  });
}

/* ── Amazon-style product cards (iOS ProductCards). 1–2 stack; 3+ scroll. ── */
function ProductCards({
  products,
}: {
  products: NonNullable<ChatResponse["products"]>;
}) {
  const items = products.filter((p) => p && p.name && p.url);
  if (!items.length) return null;
  const slider = items.length > 2;

  const Card = ({ p }: { p: (typeof items)[number] }) => (
    <a
      href={p.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`bg-mx-surface border-mx-border overflow-hidden rounded-mx-md border ${
        slider ? "w-40 shrink-0" : "flex items-center p-2"
      }`}
    >
      {p.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={api.resolveAttachmentUrl(p.image)}
          alt=""
          className={
            slider
              ? "bg-mx-card h-28 w-full object-contain"
              : "bg-mx-card size-14 rounded-mx-sm object-contain"
          }
        />
      ) : (
        <div
          className={`bg-mx-card text-mx-muted flex items-center justify-center ${
            slider ? "h-28 w-full" : "size-14 rounded-mx-sm"
          }`}
        >
          <ChatIcon name="cart" className="size-5" />
        </div>
      )}
      <div className={`min-w-0 gap-0.5 ${slider ? "p-2.5" : "flex-1 px-2.5 py-2"}`}>
        {p.brand ? (
          <div className="text-mx-muted truncate text-[11px] font-semibold tracking-wide">
            {p.brand}
          </div>
        ) : null}
        <div className={`text-mx-ink text-[13px] font-bold ${slider ? "line-clamp-2" : "truncate"}`}>
          {p.name}
        </div>
        {p.description ? (
          <div className={`text-mx-muted text-[12px] leading-4 ${slider ? "line-clamp-3" : "line-clamp-2"}`}>
            {p.description}
          </div>
        ) : null}
        <div className="text-mx-muted mt-1 flex items-center gap-1 text-[11px] font-semibold">
          <ChatIcon name="cart" className="size-3" />
          View on Amazon
        </div>
      </div>
    </a>
  );

  if (slider) {
    return (
      <div className="mt-2.5 flex w-full max-w-full gap-2.5 overflow-x-auto pb-1">
        {items.map((p, i) => (
          <Card key={`${p.url}-${i}`} p={p} />
        ))}
      </div>
    );
  }
  return (
    <div className="mt-2.5 w-full space-y-2">
      {items.map((p, i) => (
        <Card key={`${p.url}-${i}`} p={p} />
      ))}
    </div>
  );
}

/* Copy / thumbs toolbar under an assistant reply (iOS AssistantActions). */
function AssistantActions({ text }: { text: string }) {
  const [vote, setVote] = useState<0 | 1 | -1>(0);
  const copy = () => {
    try {
      navigator.clipboard?.writeText(text);
    } catch {
      /* clipboard blocked — no-op */
    }
  };
  return (
    <div className="text-mx-muted -ml-1 mt-2 flex items-center gap-1">
      <button onClick={copy} aria-label="Copy" className="hover:text-mx-ink flex size-7 items-center justify-center transition">
        <ChatIcon name="copy" className="size-4" />
      </button>
      <button
        onClick={() => setVote((v) => (v === 1 ? 0 : 1))}
        aria-label="Good response"
        className={`flex size-7 items-center justify-center transition ${vote === 1 ? "text-mx-ink" : "hover:text-mx-ink"}`}
      >
        <ChatIcon name="thumbUp" className="size-4" />
      </button>
      <button
        onClick={() => setVote((v) => (v === -1 ? 0 : -1))}
        aria-label="Bad response"
        className={`flex size-7 items-center justify-center transition ${vote === -1 ? "text-mx-ink" : "hover:text-mx-ink"}`}
      >
        <ChatIcon name="thumbDown" className="size-4" />
      </button>
    </div>
  );
}

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const extras = message.extras;
  const hasImage = message.attachmentType === "image" && !!message.attachmentUrl;

  if (isUser) {
    // ChatGPT-gray bubble, right-aligned (iOS cg.userBubble #F4F4F4 / radius 22).
    return (
      <div className="flex flex-col items-end gap-1.5">
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={api.resolveAttachmentUrl(message.attachmentUrl)}
            alt=""
            className="max-h-64 max-w-[84%] rounded-[22px] object-contain"
          />
        ) : null}
        {message.content ? (
          <div className="text-mx-ink max-w-[84%] whitespace-pre-wrap rounded-[22px] bg-[#F4F4F4] px-4 py-[11px] text-[16px] leading-[23px]">
            {message.content}
          </div>
        ) : null}
      </div>
    );
  }

  // Assistant: full-width plain text, no bubble (iOS cg.assistantText 16/25).
  return (
    <div className="w-full px-1">
      {message.content ? (
        <div className="text-mx-ink space-y-1 text-[16px] leading-[25px]">
          {renderRichText(message.content)}
        </div>
      ) : null}

      {extras?.visual_blocks?.map((b, i) => (
        <div key={i} className="mt-1 w-full">
          <VisualBlockRenderer block={b} />
        </div>
      ))}

      {extras?.products?.length ? <ProductCards products={extras.products} /> : null}

      {message.content ? <AssistantActions text={message.content} /> : null}
    </div>
  );
}
