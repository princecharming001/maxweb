import type { Metadata } from "next";
import {
  Instrument_Serif,
  Geist,
  Inter,
  JetBrains_Mono,
  Space_Grotesk,
  Mona_Sans,
  Fraunces,
} from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// ── Landing (tryclean) faces ──────────────────────────────────────────────
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});
const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});
const monaSans = Mona_Sans({ variable: "--font-mona-sans", subsets: ["latin"] });

// ── Max app faces (Fraunces display + Matter body, matching the iOS app) ──
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
});
const matter = localFont({
  variable: "--font-matter",
  src: [
    { path: "./fonts/Matter-Light.ttf", weight: "300", style: "normal" },
    { path: "./fonts/Matter-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Matter-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/Matter-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/Matter-Bold.ttf", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "Max",
  description: "Your daily plan, coach, and progress — on the web.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${geist.variable} ${inter.variable} ${jetbrains.variable} ${spaceGrotesk.variable} ${monaSans.variable} ${fraunces.variable} ${matter.variable} h-full antialiased`}
    >
      {/* Theme-neutral root: each route group styles its own surface. */}
      <body className="min-h-full">{children}</body>
    </html>
  );
}
