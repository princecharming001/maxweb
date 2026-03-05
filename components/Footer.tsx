import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-[12px] text-muted/60">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold text-foreground/40 tracking-tight">
            max
          </Link>
          <span>&copy; {new Date().getFullYear()} Max</span>
        </div>
        <div className="flex gap-5">
          <a href="#" className="hover:text-foreground/50 transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground/50 transition-colors">Terms</a>
          <a href="#" className="hover:text-foreground/50 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
