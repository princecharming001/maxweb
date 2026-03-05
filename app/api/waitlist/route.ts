import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const { error } = await supabase
      .from("waitlist")
      .insert([{ email: email.toLowerCase().trim() }]);

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
