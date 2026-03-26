import Link from "next/link";
import LegalDocument from "./LegalDocument";

export const metadata = {
  title: "Legal — Max",
  description: "Official legal documents for the Max mobile application.",
};

export default async function LegalPage() {
  return (
    <main className="px-6 py-16 md:py-20">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-border/80 px-4 py-2 text-[13px] text-foreground/80 hover:bg-card transition-colors"
          >
            Back to home
          </Link>
        </div>

        <LegalDocument file="index.html" />
      </div>
    </main>
  );
}
