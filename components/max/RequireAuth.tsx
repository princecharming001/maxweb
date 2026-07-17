"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMaxAuth } from "@/context/MaxAuthContext";
import MaxSplash from "./MaxSplash";

/**
 * Client-side guard for the /app section. Waits for the boot session-restore,
 * then bounces unauthenticated users to /login (preserving where they wanted
 * to go), and anonymous "Get started" accounts back into the funnel.
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAnonymous, bootResolved } = useMaxAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!bootResolved) return;
    if (!isAuthenticated) {
      const next = encodeURIComponent(pathname || "/app/today");
      router.replace(`/login?next=${next}`);
    } else if (isAnonymous) {
      router.replace("/start/account");
    }
  }, [bootResolved, isAuthenticated, isAnonymous, pathname, router]);

  if (!bootResolved || !isAuthenticated || isAnonymous) {
    return <MaxSplash />;
  }
  return <>{children}</>;
}
