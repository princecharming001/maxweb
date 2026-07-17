"use client";

import { useEffect } from "react";

export interface ToastState {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function Toast({
  toast,
  onDismiss,
  timeout = 5000,
}: {
  toast: ToastState | null;
  onDismiss: () => void;
  timeout?: number;
}) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, timeout);
    return () => clearTimeout(t);
  }, [toast, onDismiss, timeout]);

  if (!toast) return null;
  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 lg:bottom-8">
      <div className="bg-mx-ink flex items-center gap-4 rounded-full px-5 py-3 text-white shadow-lg">
        <span className="text-[14px]">{toast.message}</span>
        {toast.actionLabel ? (
          <button
            onClick={() => {
              toast.onAction?.();
              onDismiss();
            }}
            className="text-mx-accent-light text-[14px] font-semibold"
          >
            {toast.actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
