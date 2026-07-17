import Link from "next/link";

/** Footer — dark (geometry cloned from remindmetrace.com). */
export default function TraceFooter() {
  return (
    <footer className="relative bg-[#0a0a0a] pt-[60px] pb-[30px] text-white/50">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-[14px] px-[4.8vw] sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[14px]">© 2026 Max</div>
        <div className="flex gap-[20px] text-[14px]">
          <Link href="/privacy" className="transition-colors hover:text-white">
            Privacy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-white">
            Terms
          </Link>
          <a
            href="mailto:hello@usemaxapp.com"
            className="transition-colors hover:text-white"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
