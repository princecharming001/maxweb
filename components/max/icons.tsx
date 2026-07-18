/** Minimal stroke icon set for the Max shell (no icon-font dependency). */
export function Icon({
  name,
  className = "size-5",
}: {
  name: "today" | "home" | "planner" | "coach" | "chat" | "scan" | "explore" | "you" | "bell" | "flame" | "logout" | "settings" | "check" | "chevron" | "plus" | "close" | "menu" | "x" | "trash" | "mic";
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
    case "today":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="17" rx="2.5" />
          <path d="M3 9h18M8 3v3M16 3v3M8 14l2.5 2.5L16 12" />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path d="M4 11.5 12 4l8 7.5" />
          <path d="M6 10v10h4v-6h4v6h4V10" />
        </svg>
      );
    case "planner":
      return (
        <svg {...common}>
          <path d="M9 4 3.5 6.2v13.8L9 17.8l6 2.2 5.5-2.2V3.8L15 6 9 4z" />
          <path d="M9 4v13.8M15 6v14" />
        </svg>
      );
    case "coach":
      return (
        <svg {...common}>
          <path d="M4 5h16v11H9l-4 3v-3H4z" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H10l-4 3v-3H5a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 5 5.5z" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M6 9.5a6 6 0 0 1 12 0c0 4 1.2 5.2 2 6.5H4c.8-1.3 2-2.5 2-6.5z" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
      );
    case "scan":
      return (
        <svg {...common}>
          <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" />
          <circle cx="12" cy="11.5" r="3" />
          <path d="M8.5 17c.7-1.6 2-2.5 3.5-2.5s2.8.9 3.5 2.5" />
        </svg>
      );
    case "explore":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="m14.5 9.5-1 4-4 1 1-4z" />
        </svg>
      );
    case "you":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c1-3.5 3.8-5 7-5s6 1.5 7 5" />
        </svg>
      );
    case "flame":
      return (
        <svg {...common}>
          <path d="M12 3s5 3.5 5 8a5 5 0 0 1-10 0c0-1.5.6-2.7 1.3-3.6C9 8.5 10 8 10 6.5 11 7 12 8.2 12 3z" />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h11" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="M5 12.5 10 17l9-10" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...common}>
          <path d="m9 6 6 6-6 6" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case "close":
    case "x":
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      );
    case "menu":
      return (
        <svg {...common}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );
    case "trash":
      return (
        <svg {...common}>
          <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13" />
        </svg>
      );
    case "mic":
      return (
        <svg {...common}>
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
        </svg>
      );
  }
}
