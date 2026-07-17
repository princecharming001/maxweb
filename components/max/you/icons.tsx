/**
 * Ionicons-style outline glyphs used by the You page (rows, calendar status
 * cards, day modal). The shared `components/max/icons.tsx` set is small and is
 * a shared file we must not edit, so the extra glyphs the mobile YouScreen
 * relies on (trophy / images / trending-up / calendar / map / pricetag /
 * compass / card / document-text / reader / lock / wifi / camera) live here.
 */
export type YouIconName =
  | "trophy"
  | "images"
  | "trending-up"
  | "calendar"
  | "map"
  | "pricetag"
  | "compass"
  | "settings"
  | "card"
  | "document-text"
  | "reader"
  | "lock"
  | "wifi"
  | "camera"
  | "chevron-forward"
  | "chevron-back"
  | "close";

export function YouIcon({
  name,
  className = "size-5",
  strokeWidth = 1.7,
}: {
  name: YouIconName;
  className?: string;
  strokeWidth?: number;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "trophy":
      return (
        <svg {...common}>
          <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
          <path d="M7 5H4.5a1.5 1.5 0 0 0 0 5H7" />
          <path d="M17 5h2.5a1.5 1.5 0 0 1 0 5H17" />
          <path d="M12 14v3M8.5 20h7M9.6 20c0-1.4 1-2.2 2.4-2.2s2.4.8 2.4 2.2" />
        </svg>
      );
    case "images":
      return (
        <svg {...common}>
          <path d="M8 7V5.2A1.7 1.7 0 0 1 9.7 3.5H19A1.5 1.5 0 0 1 20.5 5v9.3A1.7 1.7 0 0 1 18.8 16" />
          <rect x="3" y="7" width="14" height="13" rx="2" />
          <circle cx="7" cy="11" r="1.3" />
          <path d="M3 16.5l3.5-3.5 3 3 3.5-4 4 4.5" />
        </svg>
      );
    case "trending-up":
      return (
        <svg {...common}>
          <path d="M3 16l6-6 4 4 8-8" />
          <path d="M15 6h6v6" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
          <path d="M3 9.5h18M8 3v3M16 3v3" />
        </svg>
      );
    case "map":
      return (
        <svg {...common}>
          <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
          <path d="M9 4v14M15 6v14" />
        </svg>
      );
    case "pricetag":
      return (
        <svg {...common}>
          <path d="M4 4h7l9 9-7 7-9-9V4z" />
          <circle cx="8" cy="8" r="1.4" />
        </svg>
      );
    case "compass":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="m15.6 8.4-2.1 5.1-5.1 2.1 2.1-5.1z" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
        </svg>
      );
    case "card":
      return (
        <svg {...common}>
          <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
          <path d="M3 10h18M6.5 15h4" />
        </svg>
      );
    case "document-text":
      return (
        <svg {...common}>
          <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
          <path d="M14 3v4h4M9 12.5h6M9 16h6M9 9h3" />
        </svg>
      );
    case "reader":
      return (
        <svg {...common}>
          <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
          <path d="M7 9.5h10M7 12.5h10M7 15.5h6" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="10.5" width="14" height="9.5" rx="2.2" />
          <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
          <circle cx="12" cy="15" r="1" />
        </svg>
      );
    case "wifi":
      return (
        <svg {...common}>
          <path d="M4.5 11.5a10.5 10.5 0 0 1 15 0" />
          <path d="M7.5 14.8a6.2 6.2 0 0 1 9 0" />
          <path d="M10.4 18a2.2 2.2 0 0 1 3.2 0" />
          <circle cx="12" cy="20" r="0.4" fill="currentColor" stroke="none" />
        </svg>
      );
    case "camera":
      return (
        <svg {...common}>
          <path d="M3 8.8A1.6 1.6 0 0 1 4.6 7.2h2.2l1.1-1.7a1 1 0 0 1 .84-.45h6.5a1 1 0 0 1 .84.45l1.1 1.7h2.2A1.6 1.6 0 0 1 21 8.8v8.6A1.6 1.6 0 0 1 19.4 19H4.6A1.6 1.6 0 0 1 3 17.4z" />
          <circle cx="12" cy="12.8" r="3.2" />
        </svg>
      );
    case "chevron-forward":
      return (
        <svg {...common}>
          <path d="m9 6 6 6-6 6" />
        </svg>
      );
    case "chevron-back":
      return (
        <svg {...common}>
          <path d="m15 6-6 6 6 6" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      );
  }
}

export default YouIcon;
