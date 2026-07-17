/**
 * Extra stroke glyphs the chat screen needs that aren't in the shared
 * `components/max/icons.tsx` set. Kept local so the shared icon set stays
 * untouched (see the shared-file note in the port summary). Same 24x24
 * stroke style as the shared Icon for visual consistency.
 */
export type ChatIconName =
  | "compose"
  | "arrowUp"
  | "arrowRight"
  | "copy"
  | "thumbUp"
  | "thumbDown"
  | "cart";

export function ChatIcon({
  name,
  className = "size-5",
}: {
  name: ChatIconName;
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "compose": // new-chat pencil-in-square (iOS "create-outline")
      return (
        <svg {...common}>
          <path d="M12 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
          <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" />
        </svg>
      );
    case "arrowUp": // send
      return (
        <svg {...common}>
          <path d="M12 19V5M6 11l6-6 6 6" />
        </svg>
      );
    case "arrowRight": // widget submit ("confirm →")
      return (
        <svg {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case "copy":
      return (
        <svg {...common}>
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
      );
    case "thumbUp":
      return (
        <svg {...common}>
          <path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1zM7 11l4-8a2 2 0 0 1 2 2v4h5.5a2 2 0 0 1 2 2.4l-1.4 7A2 2 0 0 1 17 20H7" />
        </svg>
      );
    case "thumbDown":
      return (
        <svg {...common}>
          <path d="M17 13V4h3a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1zM17 13l-4 8a2 2 0 0 1-2-2v-4H5.5a2 2 0 0 1-2-2.4l1.4-7A2 2 0 0 1 7 4h10" />
        </svg>
      );
    case "cart":
      return (
        <svg {...common}>
          <circle cx="9" cy="20" r="1.4" />
          <circle cx="18" cy="20" r="1.4" />
          <path d="M2 3h3l2.4 12.3a1.5 1.5 0 0 0 1.5 1.2h8.2a1.5 1.5 0 0 0 1.5-1.2L22 7H6" />
        </svg>
      );
  }
}
