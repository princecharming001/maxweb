import type { ReactNode } from "react";

/**
 * Port of the mobile `GlassCard` (components/glass/GlassCard.tsx) for the You
 * page. A flat paper surface: white card, soft shadow, 1px warm hairline
 * border, continuous-ish rounded corners. `radius` matches the iOS prop
 * (the You screen passes 20 everywhere).
 */
export function GlassCard({
  radius = 20,
  className = "",
  children,
}: {
  radius?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`bg-mx-card border border-mx-border shadow-mx-md overflow-hidden ${className}`}
      style={{ borderRadius: radius }}
    >
      {children}
    </div>
  );
}

export default GlassCard;
