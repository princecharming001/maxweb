"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMaxAuth } from "@/context/MaxAuthContext";

/**
 * Mirrors the mobile usePaywallGate: real actions (start a plan, send a chat,
 * enter a paid maxx, re-run a scan) call gate() — paid/scan users pass; everyone
 * else is bounced to /subscribe. The backend still enforces entitlement.
 * Returns true when the action was BLOCKED.
 */
export function useMaxPaywallGate() {
  const { isPaid, isScanUser } = useMaxAuth();
  const router = useRouter();

  return useCallback(
    (source?: string): boolean => {
      if (isPaid || isScanUser) return false;
      const q = source ? `?src=${encodeURIComponent(source)}` : "";
      router.push(`/subscribe${q}`);
      return true;
    },
    [isPaid, isScanUser, router],
  );
}
