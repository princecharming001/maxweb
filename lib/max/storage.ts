/**
 * Token store for the web app. The mobile app uses expo-secure-store; on the
 * web we use localStorage (backend auth is header-bearer, no cookies), with an
 * in-memory fallback for SSR / privacy-mode where localStorage throws.
 */

const mem = new Map<string, string>();

function hasLS(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

export function getItem(key: string): string | null {
  if (hasLS()) {
    try {
      const v = window.localStorage.getItem(key);
      if (v !== null) return v;
    } catch {
      /* fall through to memory */
    }
  }
  return mem.get(key) ?? null;
}

export function setItem(key: string, value: string): void {
  mem.set(key, value);
  if (hasLS()) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* memory-only session; best-effort durability */
    }
  }
}

export function removeItem(key: string): void {
  mem.delete(key);
  if (hasLS()) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

export const TOKEN_KEYS = {
  access: "max_access_token",
  refresh: "max_refresh_token",
} as const;
