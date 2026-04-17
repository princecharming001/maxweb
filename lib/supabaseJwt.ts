/**
 * Decode `role` from a Supabase JWT (anon / authenticated / service_role).
 * Used only to catch the common misconfiguration: pasting the anon key into
 * SUPABASE_SERVICE_ROLE_KEY.
 */
export function getSupabaseJwtRole(key: string): string | undefined {
  const parts = key.split(".");
  if (parts.length !== 3) return undefined;
  try {
    let b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4;
    if (pad) b64 += "=".repeat(4 - pad);
    const json = Buffer.from(b64, "base64").toString("utf8");
    const payload = JSON.parse(json) as { role?: string };
    return typeof payload.role === "string" ? payload.role : undefined;
  } catch {
    return undefined;
  }
}

export function assertSupabaseServiceRoleKey(key: string): void {
  const role = getSupabaseJwtRole(key);
  if (role === "anon" || role === "authenticated") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY must be the service_role secret (Supabase Dashboard → Project Settings → API → service_role). The anon key cannot write to RLS-protected tables like paid_waitlist.",
    );
  }
}
