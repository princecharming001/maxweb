import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase is not configured");
  }

  return createClient(url, key);
}

const PHONE_RE = /^\+\d{1,4}\d{7,15}$/;
const PLATFORMS = new Set([
  "tiktok",
  "instagram",
  "youtube",
  "facebook",
  "other",
]);

const VIDEOS_PER_WEEK = new Set(["1-2", "3-5", "6-10", "11-15", "16+"]);

const MAX_NOTES = 2000;
const MAX_HANDLE = 200;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      full_name,
      email,
      phone,
      primary_platform,
      videos_per_week,
      social_handle,
      portfolio_url,
      experience_notes,
    } = body as Record<string, unknown>;

    if (
      !full_name ||
      typeof full_name !== "string" ||
      !full_name.trim()
    ) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email is required" },
        { status: 400 }
      );
    }

    if (
      !primary_platform ||
      typeof primary_platform !== "string" ||
      !PLATFORMS.has(primary_platform.toLowerCase())
    ) {
      return NextResponse.json(
        { error: "A valid primary platform is required" },
        { status: 400 }
      );
    }

    if (
      !videos_per_week ||
      typeof videos_per_week !== "string" ||
      !VIDEOS_PER_WEEK.has(videos_per_week)
    ) {
      return NextResponse.json(
        { error: "A valid videos-per-week range is required" },
        { status: 400 }
      );
    }

    if (
      !social_handle ||
      typeof social_handle !== "string" ||
      !social_handle.trim()
    ) {
      return NextResponse.json(
        { error: "Social handle or profile link is required" },
        { status: 400 }
      );
    }

    if (social_handle.trim().length > MAX_HANDLE) {
      return NextResponse.json(
        { error: "Social handle is too long" },
        { status: 400 }
      );
    }

    let phoneValue: string | null = null;
    if (phone != null && String(phone).trim() !== "") {
      if (typeof phone !== "string" || !PHONE_RE.test(phone.trim())) {
        return NextResponse.json(
          {
            error:
              "If provided, phone must include country code (e.g. +14155551234)",
          },
          { status: 400 }
        );
      }
      phoneValue = phone.trim();
    }

    let portfolioValue: string | null = null;
    if (portfolio_url != null && String(portfolio_url).trim() !== "") {
      if (typeof portfolio_url !== "string") {
        return NextResponse.json(
          { error: "Invalid portfolio URL" },
          { status: 400 }
        );
      }
      const trimmed = portfolio_url.trim();
      try {
        const u = new URL(trimmed);
        if (u.protocol !== "http:" && u.protocol !== "https:") {
          throw new Error("bad protocol");
        }
        portfolioValue = trimmed;
      } catch {
        return NextResponse.json(
          { error: "Portfolio must be a valid http(s) URL" },
          { status: 400 }
        );
      }
    }

    let notesValue: string | null = null;
    if (experience_notes != null && String(experience_notes).trim() !== "") {
      if (typeof experience_notes !== "string") {
        return NextResponse.json(
          { error: "Invalid experience text" },
          { status: 400 }
        );
      }
      const trimmed = experience_notes.trim();
      if (trimmed.length > MAX_NOTES) {
        return NextResponse.json(
          { error: `Experience notes must be at most ${MAX_NOTES} characters` },
          { status: 400 }
        );
      }
      notesValue = trimmed;
    }

    const supabase = getSupabase();
    const { error } = await supabase.from("ugc_creator_applications").insert([
      {
        full_name: full_name.trim(),
        email: email.toLowerCase().trim(),
        phone: phoneValue,
        primary_platform: primary_platform.toLowerCase(),
        videos_per_week,
        social_handle: social_handle.trim(),
        portfolio_url: portfolioValue,
        experience_notes: notesValue,
      },
    ]);

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { message: "We already have an application from this email" },
          { status: 200 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      { message: "Application submitted" },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
