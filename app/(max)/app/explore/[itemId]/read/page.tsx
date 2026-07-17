"use client";

/**
 * Course reader route — renders the bundled course content (the SAME data
 * source as the iOS app, `lib/max/courses`) as a chapter path that opens into
 * a full-screen lesson pager. Reached from the MaxDetail "Open the full
 * course" / "Open" CTA.
 */
import { use } from "react";
import Link from "next/link";
import { getCourseForMaxx } from "@/lib/max/courses/courseContent";
import CourseReaderView from "@/components/max/explore/course-reader";

export default function CourseReadPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = use(params);
  const course = getCourseForMaxx(itemId);

  if (!course) {
    return (
      <div>
        <div className="mb-6 flex items-center gap-3">
          <Link
            href={`/app/explore/${itemId}`}
            aria-label="Back"
            className="text-mx-muted hover:text-mx-ink -ml-1 flex size-8 items-center justify-center"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 6-6 6 6 6" />
            </svg>
          </Link>
          <h1 className="font-mx-serif text-mx-ink text-[26px] leading-none">
            No reader yet
          </h1>
        </div>
        <p className="text-mx-muted text-[14px]">
          This program doesn&apos;t have a readable course yet.
        </p>
      </div>
    );
  }

  return <CourseReaderView course={course} itemId={itemId} />;
}
