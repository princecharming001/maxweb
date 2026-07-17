import { QueryClient } from "@tanstack/react-query";

/** Mirror of the mobile query client config for behavior parity. */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 24 * 60 * 60 * 1000,
        retry: (failureCount, error) => {
          const status = (error as { response?: { status?: number } })?.response
            ?.status;
          if (status === 401 || status === 403) return false;
          return failureCount < 2;
        },
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
    },
  });
}

export const queryKeys = {
  me: ["me"] as const,
  plannerToday: (day?: string) => ["planner", "today", day ?? "current"] as const,
  plannerHeldBack: ["planner", "heldBack"] as const,
  schedulesActiveFull: ["schedules", "active", "full"] as const,
  chatHistory: (conversationId: string | null) =>
    ["chat", "history", conversationId ?? "default"] as const,
  chatConversations: ["chat", "conversations"] as const,
  marketplace: ["marketplace"] as const,
  marketplaceItem: (id: string) => ["marketplace", "item", id] as const,
  scanLatest: ["scans", "latest"] as const,
  scanHistory: ["scans", "history"] as const,
  scanById: (id: string) => ["scans", id] as const,
  achievements: ["achievements"] as const,
  progressPhotos: ["profile", "progressPhotos"] as const,
  paymentsStatus: ["payments", "status"] as const,
  webBillingConfig: ["payments", "web", "config"] as const,
};
