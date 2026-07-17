"use client";

import Link from "next/link";

export default function SubPageHeader({
  title,
  back = "/app/you",
}: {
  title: string;
  back?: string;
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <Link
        href={back}
        aria-label="Back"
        className="text-mx-muted hover:text-mx-ink -ml-1 flex size-8 items-center justify-center"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 6-6 6 6 6" />
        </svg>
      </Link>
      <h1 className="font-mx-serif text-mx-ink text-[26px] leading-none">
        {title}
      </h1>
    </div>
  );
}
