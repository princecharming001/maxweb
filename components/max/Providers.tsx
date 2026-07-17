"use client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/max/queryClient";
import { MaxAuthProvider } from "@/context/MaxAuthContext";

export default function MaxProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <MaxAuthProvider>{children}</MaxAuthProvider>
    </QueryClientProvider>
  );
}
