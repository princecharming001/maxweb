/**
 * Max web API client — a browser port of the mobile services/api.ts.
 * Talks to the FastAPI backend through the same-origin proxy (/maxapi/),
 * carries a JWT bearer, and single-flights token refresh on 401.
 */
import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { getItem, setItem, removeItem, TOKEN_KEYS } from "./storage";

const BASE_URL = process.env.NEXT_PUBLIC_MAX_API_BASE_URL || "/maxapi/";
/** Real API origin — media URLs must resolve here, not through the proxy. */
const API_ORIGIN =
  process.env.NEXT_PUBLIC_MAX_API_ORIGIN || "https://maxapp-api.onrender.com";

const WEB_AUTH_TIMEOUT_MS = 45_000;

// ── auth-lost pub/sub ──────────────────────────────────────────────────────
type AuthLostListener = () => void;
const authLostListeners = new Set<AuthLostListener>();
export function subscribeAuthLost(listener: AuthLostListener): () => void {
  authLostListeners.add(listener);
  return () => authLostListeners.delete(listener);
}
function emitAuthLost() {
  for (const l of Array.from(authLostListeners)) {
    try {
      l();
    } catch {
      /* listener errors must not crash the interceptor */
    }
  }
}

class MaxApi {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshInFlight: Promise<void> | null = null;
  private refreshFailedUntil = 0;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: { "Content-Type": "application/json" },
      timeout: 20_000,
    });

    // Adopt tokens rotated by another tab so a background refresh in tab A
    // doesn't 401 tab B.
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (e.key === TOKEN_KEYS.access && e.newValue) {
          this.accessToken = e.newValue;
          this.refreshFailedUntil = 0;
        }
      });
    }

    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as Record<string, string>).Authorization =
          `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (r) => r,
      async (error) => {
        const cfg = error.config as
          | (AxiosRequestConfig & {
              _retry?: boolean;
              _netRetries?: number;
              _skipNetRetry?: boolean;
            })
          | undefined;
        if (error.response?.status === 401 && cfg && !cfg._retry) {
          cfg._retry = true;
          if (Date.now() < this.refreshFailedUntil) {
            return Promise.reject(error);
          }
          try {
            await this.refreshToken();
            return this.client.request(cfg);
          } catch {
            return Promise.reject(error);
          }
        }
        // Idempotent GETs replay once on a bare network error.
        const isNetErr = !error.response;
        const method = String(cfg?.method || "get").toLowerCase();
        if (isNetErr && cfg && !cfg._skipNetRetry && method === "get") {
          cfg._netRetries = (cfg._netRetries ?? 0) + 1;
          if (cfg._netRetries <= 1) {
            await new Promise((r) => setTimeout(r, 500));
            return this.client.request(cfg);
          }
        }
        return Promise.reject(error);
      },
    );
  }

  getBaseUrl() {
    return BASE_URL;
  }

  /** Resolve a possibly-relative media path against the real API origin. */
  resolveAttachmentUrl(url?: string | null): string | undefined {
    if (!url) return undefined;
    if (url.startsWith("http")) return url;
    return `${API_ORIGIN}${url.startsWith("/") ? url : `/${url}`}`;
  }

  private getToken(): string | null {
    if (this.accessToken) return this.accessToken;
    const t = getItem(TOKEN_KEYS.access);
    if (t) this.accessToken = t;
    return t;
  }

  private async refreshToken(): Promise<void> {
    if (this.refreshInFlight) return this.refreshInFlight;
    this.refreshInFlight = (async () => {
      try {
        const refresh = getItem(TOKEN_KEYS.refresh);
        if (!refresh) throw new Error("No refresh token");
        const resp = await axios.post(
          `${BASE_URL}auth/refresh`,
          { refresh_token: refresh },
          { timeout: 45_000 },
        );
        this.setTokens(resp.data.access_token, resp.data.refresh_token);
      } catch (e: unknown) {
        const status = (e as { response?: { status?: number } })?.response
          ?.status;
        const noRefresh = (e as Error)?.message === "No refresh token";
        if (status === 401 || status === 403 || noRefresh) {
          this.refreshFailedUntil = Date.now() + 60_000;
          this.clearTokens();
          emitAuthLost();
        }
        throw e;
      } finally {
        this.refreshInFlight = null;
      }
    })();
    return this.refreshInFlight;
  }

  setTokens(access: string, refresh: string): void {
    this.accessToken = access;
    this.refreshFailedUntil = 0;
    setItem(TOKEN_KEYS.access, access);
    setItem(TOKEN_KEYS.refresh, refresh);
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshFailedUntil = 0;
    removeItem(TOKEN_KEYS.access);
    removeItem(TOKEN_KEYS.refresh);
  }

  hasSession(): boolean {
    return !!this.getToken();
  }

  // ── Auth ──────────────────────────────────────────────────────────────
  async login(identifier: string, password: string) {
    const r = await this.client.post(
      "auth/login/json",
      { identifier, password },
      { timeout: WEB_AUTH_TIMEOUT_MS },
    );
    this.setTokens(r.data.access_token, r.data.refresh_token);
    return r.data;
  }

  async signup(
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    username: string,
    phone_number?: string,
  ) {
    const body: Record<string, string> = {
      email,
      password,
      first_name,
      last_name,
      username,
    };
    if (phone_number && phone_number.replace(/\D/g, "").length >= 7)
      body.phone_number = phone_number;
    const r = await this.client.post("auth/signup", body, {
      timeout: WEB_AUTH_TIMEOUT_MS,
    });
    this.setTokens(r.data.access_token, r.data.refresh_token);
    return r.data;
  }

  async anonSignup() {
    const r = await this.client.post(
      "auth/anon",
      {},
      { timeout: WEB_AUTH_TIMEOUT_MS },
    );
    this.setTokens(r.data.access_token, r.data.refresh_token);
    return r.data;
  }

  async claimAccount(
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    username: string,
    phone_number?: string,
  ) {
    const body: Record<string, string> = {
      email,
      password,
      first_name,
      last_name,
      username,
    };
    if (phone_number && phone_number.replace(/\D/g, "").length >= 7)
      body.phone_number = phone_number;
    const r = await this.client.post("auth/claim", body, {
      timeout: WEB_AUTH_TIMEOUT_MS,
    });
    this.setTokens(r.data.access_token, r.data.refresh_token);
    return r.data;
  }

  async googleSignIn(idToken: string) {
    const r = await this.client.post(
      "auth/google",
      { id_token: idToken },
      { timeout: WEB_AUTH_TIMEOUT_MS },
    );
    this.setTokens(r.data.access_token, r.data.refresh_token);
    return r.data;
  }

  async getGoogleAuthConfig(): Promise<{
    available: boolean;
    web_client_id: string;
    ios_client_id: string;
  }> {
    const r = await this.client.get("auth/google/config", {
      timeout: WEB_AUTH_TIMEOUT_MS,
    });
    return r.data;
  }

  async requestPasswordResetSms(phone_number: string) {
    const r = await this.client.post("auth/forgot-password/sms", {
      phone_number,
    });
    return r.data as { message: string };
  }
  async confirmPasswordResetSms(
    phone_number: string,
    code: string,
    new_password: string,
  ) {
    const r = await this.client.post("auth/forgot-password/sms/confirm", {
      phone_number,
      code,
      new_password,
    });
    return r.data as { message: string };
  }

  async getMe(opts?: { timeout?: number }) {
    const r = await this.client.get(
      "users/me",
      opts?.timeout ? { timeout: opts.timeout } : undefined,
    );
    return r.data;
  }

  async updateProfile(data: Record<string, unknown>) {
    const r = await this.client.put("users/profile", data);
    return r.data;
  }

  async deleteAccount(password?: string) {
    const r = await this.client.delete("users/me", {
      data: password ? { password } : {},
    });
    return r.data;
  }

  // ── Onboarding ────────────────────────────────────────────────────────
  async saveOnboarding(data: Record<string, unknown>) {
    const r = await this.client.post("users/onboarding", data);
    return r.data;
  }

  // ── Planner / Today ───────────────────────────────────────────────────
  async getPlannerToday(day?: string) {
    const r = await this.client.get("planner/today", {
      params: day ? { day } : {},
    });
    return r.data as PlannerToday;
  }
  async getPlannerHeldBack(day?: string) {
    const r = await this.client.get("planner/held-back", {
      params: day ? { day } : {},
    });
    return r.data as {
      date: string;
      items: {
        title: string;
        program_id: string;
        reason: string;
        returns_on?: string | null;
      }[];
    };
  }
  async plannerLockIn(date?: string) {
    const r = await this.client.post("planner/lock-in", date ? { date } : {});
    return r.data as { locked_in: boolean; date: string };
  }
  async skipPlannerTask(scheduleId: string, taskId: string) {
    const r = await this.client.post("planner/task/skip", {
      schedule_id: scheduleId,
      task_id: taskId,
    });
    return r.data as { skipped: boolean };
  }
  async completeScheduleTask(
    scheduleId: string,
    taskId: string,
    feedback?: string,
  ) {
    const r = await this.client.put(
      `schedules/${scheduleId}/tasks/${taskId}/complete`,
      { feedback },
    );
    return r.data;
  }
  async uncompleteScheduleTask(scheduleId: string, taskId: string) {
    const r = await this.client.put(
      `schedules/${scheduleId}/tasks/${taskId}/pending`,
      {},
    );
    return r.data;
  }
  async editScheduleTask(
    scheduleId: string,
    taskId: string,
    updates: {
      time?: string;
      title?: string;
      description?: string;
      duration_minutes?: number;
    },
    scope: "instance" | "series" = "instance",
  ) {
    const r = await this.client.put(
      `schedules/${scheduleId}/tasks/${taskId}`,
      updates,
      { params: { scope } },
    );
    return r.data;
  }
  async getTaskGuide(scheduleId: string, taskId: string) {
    const r = await this.client.get(
      `schedules/${scheduleId}/tasks/${taskId}/guide`,
    );
    return r.data as TaskGuide;
  }
  async getActiveSchedulesFull() {
    const r = await this.client.get("schedules/active/full");
    return r.data as {
      schedules: unknown[];
      schedule_streak?: {
        current: number;
        last_perfect_date?: string | null;
        today_date: string;
      };
      today_date?: string;
      gamification?: Gamification | null;
    };
  }

  // ── Chat ──────────────────────────────────────────────────────────────
  async sendChatMessage(
    message: string,
    opts?: {
      attachmentUrl?: string;
      attachmentType?: string;
      initContext?: string;
      chatIntent?: string;
      conversationId?: string | null;
      replyToMessageId?: string | null;
      signal?: AbortSignal;
    },
  ) {
    const body: Record<string, unknown> = { message };
    if (opts?.attachmentUrl) body.attachment_url = opts.attachmentUrl;
    if (opts?.attachmentType) body.attachment_type = opts.attachmentType;
    if (opts?.initContext) body.init_context = opts.initContext;
    if (opts?.chatIntent) body.chat_intent = opts.chatIntent;
    if (opts?.conversationId) body.conversation_id = opts.conversationId;
    if (opts?.replyToMessageId) body.reply_to_message_id = opts.replyToMessageId;
    const r = await this.client.post("chat/message", body, {
      timeout: 120_000,
      signal: opts?.signal,
      // custom flag consumed by the interceptor
      ...({ _skipNetRetry: true } as object),
    });
    return r.data as ChatResponse;
  }
  async confirmScheduleChange(proposalId: string, accept: boolean) {
    // Backend route is chat/confirm-change with a {decision:'yes'|'no'} body.
    const r = await this.client.post("chat/confirm-change", {
      proposal_id: proposalId,
      decision: accept ? "yes" : "no",
    });
    return r.data;
  }
  async getChatNudge() {
    const r = await this.client.get("chat/nudge");
    return (r.data as { nudge?: ChatNudge | null }).nudge ?? null;
  }
  async markChatNudgeSeen(insightId: string) {
    await this.client.post(`chat/nudge/${insightId}/seen`, {}).catch(() => undefined);
  }
  async uploadChatFile(blob: Blob, filename = "photo.jpg") {
    const form = new FormData();
    form.append("file", blob, filename);
    return (await this.postForm("forums/upload", form)) as { url: string };
  }
  async updateHabitPrefs(scheduleId: string, wanted: string[], avoided: string[]) {
    const r = await this.client.post(`schedules/${scheduleId}/habit-prefs`, {
      wanted,
      avoided,
    });
    return r.data;
  }
  async getChatHistory(opts?: {
    limit?: number;
    offset?: number;
    conversationId?: string | null;
  }) {
    const params: Record<string, string | number> = {};
    if (opts?.limit != null) params.limit = opts.limit;
    if (opts?.offset != null) params.offset = opts.offset;
    if (opts?.conversationId) params.conversation_id = opts.conversationId;
    const r = await this.client.get("chat/history", { params });
    return r.data as ChatHistory;
  }
  async listChatConversations(opts?: {
    includeArchived?: boolean;
    limit?: number;
  }) {
    const params: Record<string, string | number> = {};
    if (opts?.includeArchived) params.include_archived = "true";
    if (opts?.limit != null) params.limit = opts.limit;
    const r = await this.client.get("chat/conversations", { params });
    return r.data as { conversations: ChatConversation[] };
  }
  async createChatConversation(title?: string) {
    const r = await this.client.post("chat/conversations", {
      title: title ?? null,
    });
    return r.data as { conversation: ChatConversation };
  }
  async renameChatConversation(conversationId: string, title: string) {
    const r = await this.client.patch(`chat/conversations/${conversationId}`, {
      title,
    });
    return r.data;
  }
  async deleteChatConversation(conversationId: string) {
    const r = await this.client.delete(`chat/conversations/${conversationId}`);
    return r.data as { ok: boolean };
  }

  // ── Scans ─────────────────────────────────────────────────────────────
  async uploadScanTripleBlobs(front: Blob, left: Blob, right: Blob) {
    const url = `${BASE_URL}scans/upload-triple`;
    const buildForm = () => {
      const fd = new FormData();
      fd.append("front", front, "front.jpg");
      fd.append("left", left, "left.jpg");
      fd.append("right", right, "right.jpg");
      return fd;
    };
    const doFetch = async () => {
      const token = this.getToken();
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      return fetch(url, { method: "POST", headers, body: buildForm() });
    };
    let res = await doFetch();
    if (res.status === 401) {
      await this.refreshToken();
      res = await doFetch();
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Upload failed (${res.status}): ${text}`);
    }
    return res.json() as Promise<{ scan_id: string }>;
  }
  async analyzeScan(scanId: string) {
    const r = await this.client.post(`scans/${scanId}/analyze`, undefined, {
      timeout: 30_000,
    });
    return r.data;
  }
  async getLatestScan() {
    try {
      const r = await this.client.get("scans/latest");
      if (r.status === 204 || r.data === "" || r.data === null) return null;
      return r.data;
    } catch (e: unknown) {
      if ((e as { response?: { status?: number } })?.response?.status === 404)
        return null;
      throw e;
    }
  }
  async getScanHistory() {
    const r = await this.client.get("scans/history");
    return r.data;
  }
  async getScanById(scanId: string) {
    const r = await this.client.get(`scans/${scanId}`);
    return r.data;
  }

  // ── Profile media ─────────────────────────────────────────────────────
  async uploadAvatarBlob(blob: Blob) {
    const fd = new FormData();
    fd.append("file", blob, "avatar.jpg");
    return this.postForm("users/me/avatar", fd);
  }
  async uploadProgressPhotoBlob(blob: Blob, faceRating?: number | null) {
    const fd = new FormData();
    fd.append("file", blob, "progress.jpg");
    if (faceRating != null && Number.isFinite(faceRating))
      fd.append("face_rating", String(faceRating));
    return this.postForm("users/me/progress-photo", fd);
  }
  async getProgressPhotos() {
    const r = await this.client.get("users/me/progress-photos");
    return r.data;
  }
  async deleteProgressPhoto(photoId: string) {
    const r = await this.client.delete(`users/me/progress-photos/${photoId}`);
    return r.data;
  }
  private async postForm(path: string, fd: FormData) {
    const url = `${BASE_URL}${path}`;
    const doFetch = async () => {
      const token = this.getToken();
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      return fetch(url, { method: "POST", headers, body: fd });
    };
    let res = await doFetch();
    if (res.status === 401) {
      await this.refreshToken();
      res = await doFetch();
    }
    if (!res.ok) throw new Error(`Upload failed (${res.status})`);
    return res.json();
  }

  // ── Achievements ──────────────────────────────────────────────────────
  async getAchievements() {
    const r = await this.client.get("achievements");
    return r.data;
  }
  async markAchievementsSeen(codes: string[]) {
    const r = await this.client.post("achievements/seen", { codes });
    return r.data;
  }

  // ── Marketplace / maxes ───────────────────────────────────────────────
  async getMarketplace() {
    const r = await this.client.get("marketplace");
    return r.data as { maxxes: MarketplaceItem[]; courses: MarketplaceItem[] };
  }
  async getMarketplaceItem(itemId: string) {
    const r = await this.client.get(`marketplace/item/${itemId}`);
    return r.data as MarketplaceItem;
  }
  async enterMarketplaceItem(itemId: string) {
    const r = await this.client.post(`marketplace/enter/${itemId}`);
    return r.data as {
      entered?: boolean;
      checkout_url?: string | null;
      schedule_id?: string;
    };
  }
  async cancelMarketplaceItem(itemId: string, pause = false) {
    const r = await this.client.post(`marketplace/cancel/${itemId}`, { pause });
    return r.data;
  }

  // ── Payments ──────────────────────────────────────────────────────────
  async getSubscriptionStatus() {
    const r = await this.client.get("payments/status");
    return r.data as SubscriptionStatus;
  }
  /** Web hosted-checkout config (may 404 until the web-billing endpoint ships). */
  async getWebBillingConfig(): Promise<{ enabled: boolean }> {
    try {
      const r = await this.client.get("payments/web/config");
      return { enabled: !!r.data?.enabled };
    } catch {
      // 404 (not deployed) / 503 (disabled) → treat as unavailable.
      return { enabled: false };
    }
  }
  async createWebCheckout(
    tier: "basic" | "premium",
    successPath: string,
    cancelPath: string,
    promotionCode?: string | null,
  ) {
    const body: Record<string, unknown> = {
      tier,
      success_path: successPath,
      cancel_path: cancelPath,
    };
    if (promotionCode) body.promotion_code = promotionCode;
    const r = await this.client.post("payments/web/checkout", body);
    return r.data as { checkout_url: string };
  }
  async cancelWebSubscription() {
    const r = await this.client.post("payments/web/cancel", {});
    return r.data;
  }
  async resumeWebSubscription() {
    const r = await this.client.post("payments/web/resume", {});
    return r.data;
  }

  // ── Coaching persona + response length (chat drawer controls) ─────────
  async patchCoachingTone(tone: "default" | "hardcore" | "gentle" | "influencer") {
    const r = await this.client.patch("users/coaching-tone", { tone });
    return r.data as { message?: string; tone?: string };
  }
  async patchResponseLength(length: "concise" | "medium" | "detailed") {
    const r = await this.client.patch("users/response-length", { length });
    return r.data as { message?: string; length?: string };
  }

  // ── Settings support ──────────────────────────────────────────────────
  async getMyProducts() {
    const r = await this.client.get("users/me/products");
    return r.data;
  }
  async getGoogleStatus() {
    try {
      const r = await this.client.get("google/status");
      return r.data as { calendar_link_enabled?: boolean; connected?: boolean };
    } catch {
      return { calendar_link_enabled: false, connected: false };
    }
  }

  // ── Referral ──────────────────────────────────────────────────────────
  async validateReferral(code: string) {
    const r = await this.client.post("referral/validate", { code });
    return r.data as ReferralValidateResult;
  }
  async redeemReferral(code: string, platform: "ios" | "web" = "web") {
    const r = await this.client.post("referral/redeem", { code, platform });
    return r.data as ReferralRedeemResult;
  }
}

// ── Response types (loose ports of the mobile shapes) ──────────────────────
export interface ReferralValidateResult {
  valid: boolean;
  kind?: "free_comp" | "discount" | "referral";
  free?: boolean;
  discount?: { kind: string; value: number; label: string };
  message?: string;
  reason?: string;
}
export interface ReferralRedeemResult {
  result?: "comped" | "discount_applied" | "attributed";
  kind?: string;
  free?: boolean;
  // Legacy web field kept so existing callers keep working.
  granted_entitlement?: boolean;
  discount?: { kind: string; value: number; label: string };
  redemption_id?: string;
  idempotent?: boolean;
  message?: string;
  discount_status?: "coming_soon" | "apple_offer" | "stripe";
  stripe_promotion_code?: string | null;
}
export interface ChatNudge {
  id: string;
  text: string;
  kind?: string;
  choices?: string[];
}
export interface PlannerTask {
  task_id?: string;
  schedule_id?: string;
  maxx_id?: string;
  title?: string;
  description?: string;
  time?: string;
  end?: string;
  duration_minutes?: number;
  status?: string;
  why?: string;
  locked?: boolean;
}
export interface PlannerToday {
  date: string;
  tasks: PlannerTask[];
  structure: {
    time: string;
    label: string;
    end?: string;
    source?: string;
    event_id?: string;
  }[];
  today_read: {
    level: "green" | "yellow" | "red";
    icon: string;
    color: string;
    line: string;
  };
  held_back_count: number;
  locked_in: boolean;
  calendar_event_count: number;
  slipped: {
    task_id?: string;
    title?: string;
    from_time?: string;
    suggested_time?: string | null;
  }[];
  welcome_back: { gap_days: number; line: string; sub: string } | null;
  insights: { id: string; text: string; kind: string }[];
  leave_by: {
    task_id?: string;
    time: string;
    estimated: boolean;
    line: string;
  } | null;
  streak_armed_freeze: boolean;
}
export interface Gamification {
  level?: number;
  rank?: number;
  xp?: number;
  xp_in_level?: number;
  xp_for_next?: number;
  streak_days?: number;
  [k: string]: unknown;
}
export interface VisualBlock {
  type: string;
  [k: string]: unknown;
}
export interface ChatResponse {
  response: string;
  choices?: string[];
  multi_choice?: boolean;
  input_widget?: ({ type: string } & Record<string, unknown>) | null;
  products?: {
    name: string;
    brand?: string;
    url: string;
    description?: string;
    image?: string;
  }[];
  conversation_id?: string | null;
  confirm?: { proposal_id: string; summary: string } | null;
  visual_blocks?: VisualBlock[];
  method_metadata?: { methods: unknown[] } | null;
}
export interface ChatHistory {
  conversation_id: string | null;
  messages: {
    id: string;
    role: "user" | "assistant";
    content: string;
    created_at: string;
  }[];
  pending_question?: {
    text: string;
    choices: string[];
    multi_choice?: boolean;
  } | null;
}
export interface ChatConversation {
  id: string;
  title: string;
  channel: string;
  is_archived: boolean;
  last_message_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}
export interface TaskGuide {
  title: string;
  overview: string;
  hero_image?: string;
  steps: {
    n: number;
    title: string;
    body: string;
    tip: string | null;
    image?: string;
  }[];
  products?: { name: string; note: string; url?: string; image?: string }[];
  duration_minutes: number;
  why_it_matters: string;
}
export interface MarketplaceItem {
  type: "maxx" | "course";
  id: string;
  title: string;
  tagline: string;
  icon: string;
  color: string;
  price_cents: number;
  price_model: "weekly" | "flat" | "monthly" | "included";
  price_label: string;
  weeks?: number | null;
  creator: {
    name: string;
    handle: string;
    verified: boolean;
    avatar?: string | null;
  };
  native: boolean;
  entered: boolean;
  category?: string | null;
  rating?: number | null;
  participants?: number;
  completion_rate?: number | null;
  image_url?: string | null;
  detail?: MarketplaceItemDetail;
}
export interface MarketplaceItemDetail {
  long_description?: string;
  outcomes?: string[];
  for_you_if?: string[];
  curriculum?: { title: string; lessons: string[] }[];
  bio?: string;
  credentials?: string[];
  reviews?: { name: string; avatar?: string; rating: number; text: string }[];
  faqs?: { q: string; a: string }[];
  guarantee?: string;
  gallery?: string[];
  habits?: { title: string; time?: string; description?: string }[];
}
export interface SubscriptionStatus {
  is_active: boolean;
  subscription_tier?: string | null;
  cancel_at_period_end?: boolean;
  current_period_end_iso?: string | null;
  current_period_start_iso?: string | null;
  has_stripe_subscription?: boolean;
  billing_provider?: string | null;
  degraded?: boolean;
}

const api = new MaxApi();
export default api;
