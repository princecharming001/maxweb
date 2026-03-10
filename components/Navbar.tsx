"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.04)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl px-6 h-14 grid grid-cols-[1fr_auto_1fr] items-center">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold tracking-tighter">
            max
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8 text-[13px] text-muted">
          <a
            href="#how-it-works"
            className="hover:text-foreground transition-colors"
          >
            How It Works
          </a>
          <a
            href="#features"
            className="hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="#waitlist"
            className="hover:text-foreground transition-colors"
          >
            Waitlist
          </a>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/signup"
            className="bg-foreground text-background text-[13px] px-5 py-1.5 rounded-full hover:bg-foreground/85 transition-colors"
          >
            Get Started
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-1 cursor-pointer"
            aria-label="Toggle menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 9h16.5m-16.5 6.75h16.5"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-border/40 px-6 py-4 space-y-3 text-sm">
          <a
            href="#how-it-works"
            className="block text-muted hover:text-foreground"
            onClick={() => setMenuOpen(false)}
          >
            How It Works
          </a>
          <a
            href="#features"
            className="block text-muted hover:text-foreground"
            onClick={() => setMenuOpen(false)}
          >
            Features
          </a>
          <a
            href="#waitlist"
            className="block text-muted hover:text-foreground"
            onClick={() => setMenuOpen(false)}
          >
            Waitlist
          </a>
        </div>
      )}
    </nav>
  );
}
