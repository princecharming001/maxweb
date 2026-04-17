import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Saves email + bcrypt-hashed password to max_waitlist. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawEmail = typeof body?.email === "string" ? body.email : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const email = rawEmail.trim().toLowerCase();

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "A valid email is required" },
        { status: 400 },
      );
    }
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }
    if (password.length > 200) {
      return NextResponse.json(
        { error: "Password is too long" },
        { status: 400 },
      );
    }

    const password_hash = await bcrypt.hash(password, 12);
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from("max_waitlist").insert([
      {
        email,
        password_hash,
      },
    ]);

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This email is already registered." },
          { status: 409 },
        );
      }
      throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[/api/max-waitlist] error:", err);
    const message =
      err instanceof Error ? err.message : "Could not save registration";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
