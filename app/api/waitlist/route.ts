import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const PHONE_RE = /^\+\d{1,4}\d{7,15}$/;

export async function POST(req: NextRequest) {
  try {
    const { first_name, last_name, email, phone } = await req.json();

    if (!first_name || typeof first_name !== "string" || !first_name.trim()) {
      return NextResponse.json(
        { error: "First name is required" },
        { status: 400 }
      );
    }

    if (!last_name || typeof last_name !== "string" || !last_name.trim()) {
      return NextResponse.json(
        { error: "Last name is required" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email is required" },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string" || !PHONE_RE.test(phone)) {
      return NextResponse.json(
        { error: "A valid phone number with country code is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const { error } = await supabase.from("waitlist").insert([
      {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
      },
    ]);

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { message: "Already on the waitlist" },
          { status: 200 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      { message: "Added to waitlist" },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
