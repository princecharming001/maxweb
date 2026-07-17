"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import api, { subscribeAuthLost } from "@/lib/max/api";
import { ANON_EMAIL_SUFFIX, type MaxUser, type SubscriptionTier } from "@/lib/max/types";

const FREE_TIER_KEY = "max_free_tier_chosen_v1";

function loadFreeTier(userId: string): boolean {
  try {
    return window.localStorage.getItem(`${FREE_TIER_KEY}:${userId}`) === "1";
  } catch {
    return false;
  }
}
function saveFreeTier(userId: string) {
  try {
    window.localStorage.setItem(`${FREE_TIER_KEY}:${userId}`, "1");
  } catch {
    /* best-effort */
  }
}
function clearFreeTier(userId: string) {
  try {
    window.localStorage.removeItem(`${FREE_TIER_KEY}:${userId}`);
  } catch {
    /* best-effort */
  }
}

interface MaxAuthValue {
  user: MaxUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPaid: boolean;
  isPremium: boolean;
  isScanUser: boolean;
  isAnonymous: boolean;
  isFreeTier: boolean;
  subscriptionTier: SubscriptionTier;
  /** True once the boot session-restore has finished (success or not). */
  bootResolved: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    username: string,
    phone_number?: string,
  ) => Promise<void>;
  startAnon: () => Promise<void>;
  claimAccount: (
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    username: string,
    phone_number?: string,
  ) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<MaxUser>;
  logout: () => void;
  refreshUser: () => Promise<MaxUser>;
  deleteAccount: (password?: string) => Promise<void>;
  chooseFreeTier: () => void;
}

const MaxAuthContext = createContext<MaxAuthValue | undefined>(undefined);

export function MaxAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MaxUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bootResolved, setBootResolved] = useState(false);
  const [freeTierChosen, setFreeTierChosen] = useState(false);
  const queryClient = useQueryClient();

  // Restore the per-user free-tier choice when the signed-in user changes.
  useEffect(() => {
    if (!user?.id) {
      setFreeTierChosen(false);
      return;
    }
    setFreeTierChosen(loadFreeTier(user.id));
  }, [user?.id]);

  // Boot: if a token is on disk, restore the session (generous timeout for
  // Render cold starts). A transient failure keeps the token for the retry.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (api.hasSession()) {
          const me = await api.getMe({ timeout: 45_000 });
          if (!cancelled) setUser(me);
        }
      } catch {
        /* keep tokens; the refresh interceptor / next mount resumes */
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setBootResolved(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Tear down on a definitively-dead session (refresh 401'd).
  useEffect(() => {
    return subscribeAuthLost(() => {
      setUser(null);
      try {
        queryClient.clear();
      } catch {
        /* ignore */
      }
    });
  }, [queryClient]);

  const login = useCallback(async (identifier: string, password: string) => {
    await api.login(identifier, password);
    setUser(await api.getMe());
  }, []);

  const signup = useCallback(
    async (
      email: string,
      password: string,
      first_name: string,
      last_name: string,
      username: string,
      phone_number?: string,
    ) => {
      await api.signup(email, password, first_name, last_name, username, phone_number);
      setUser(await api.getMe());
    },
    [],
  );

  const startAnon = useCallback(async () => {
    if (api.hasSession()) {
      try {
        setUser(await api.getMe({ timeout: 20_000 }));
        return;
      } catch {
        /* dead session — mint a fresh anon account */
      }
    }
    await api.anonSignup();
    setUser(await api.getMe({ timeout: 45_000 }));
  }, []);

  const claimAccount = useCallback(
    async (
      email: string,
      password: string,
      first_name: string,
      last_name: string,
      username: string,
      phone_number?: string,
    ) => {
      await api.claimAccount(email, password, first_name, last_name, username, phone_number);
      setUser(await api.getMe({ timeout: 45_000 }));
    },
    [],
  );

  const signInWithGoogle = useCallback(async (idToken: string) => {
    await api.googleSignIn(idToken);
    const me = await api.getMe();
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(() => {
    api.clearTokens();
    setUser(null);
    setFreeTierChosen(false);
    try {
      queryClient.clear();
    } catch {
      /* ignore */
    }
  }, [queryClient]);

  const refreshUser = useCallback(async () => {
    const me = await api.getMe();
    setUser(me);
    return me;
  }, []);

  const deleteAccount = useCallback(
    async (password?: string) => {
      await api.deleteAccount(password);
      api.clearTokens();
      setUser(null);
      setFreeTierChosen(false);
      try {
        queryClient.clear();
      } catch {
        /* ignore */
      }
    },
    [queryClient],
  );

  const chooseFreeTier = useCallback(() => {
    setFreeTierChosen(true);
    if (user?.id) saveFreeTier(user.id);
  }, [user?.id]);

  const subscriptionTier: SubscriptionTier =
    (user?.subscription_tier as SubscriptionTier) ?? null;

  const value = useMemo<MaxAuthValue>(
    () => ({
      user,
      isLoading,
      bootResolved,
      isAuthenticated: !!user,
      isPaid: user?.is_paid ?? false,
      isPremium:
        user?.is_admin ||
        (user?.is_paid && subscriptionTier === "premium") ||
        false,
      isScanUser: user?.is_scan_user ?? false,
      isAnonymous:
        !!user?.email && String(user.email).endsWith(ANON_EMAIL_SUFFIX),
      isFreeTier: freeTierChosen && !(user?.is_paid ?? false),
      subscriptionTier,
      login,
      signup,
      startAnon,
      claimAccount,
      signInWithGoogle,
      logout,
      refreshUser,
      deleteAccount,
      chooseFreeTier,
    }),
    [
      user,
      isLoading,
      bootResolved,
      freeTierChosen,
      subscriptionTier,
      login,
      signup,
      startAnon,
      claimAccount,
      signInWithGoogle,
      logout,
      refreshUser,
      deleteAccount,
      chooseFreeTier,
    ],
  );

  // On logout/expiry, drop the per-user free-tier flag so a different account
  // can't inherit it.
  useEffect(() => {
    if (!user?.id) return;
    if (user.is_paid) clearFreeTier(user.id);
  }, [user?.id, user?.is_paid]);

  return (
    <MaxAuthContext.Provider value={value}>{children}</MaxAuthContext.Provider>
  );
}

export function useMaxAuth() {
  const ctx = useContext(MaxAuthContext);
  if (!ctx) throw new Error("useMaxAuth must be used within MaxAuthProvider");
  return ctx;
}
