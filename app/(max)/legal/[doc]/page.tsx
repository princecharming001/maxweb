import Link from "next/link";
import { notFound } from "next/navigation";

const DOCS: Record<string, { title: string; url: string }> = {
  privacy: { title: "Privacy policy", url: "https://usemaxapp.com/privacy" },
  terms: { title: "Terms of service", url: "https://usemaxapp.com/terms" },
};

export default async function LegalPage({
  params,
}: {
  params: Promise<{ doc: string }>;
}) {
  const { doc } = await params;
  const meta = DOCS[doc];
  if (!meta) notFound();

  return (
    <div className="mx-auto max-w-[640px] px-5 py-14">
      <Link href="/app/you" className="text-mx-muted hover:text-mx-ink text-[14px]">
        ← Back
      </Link>
      <h1 className="font-mx-serif text-mx-ink mt-4 text-[30px]">{meta.title}</h1>
      <p className="text-mx-ink-2 mt-4 text-[15px] leading-relaxed">
        Read the full {meta.title.toLowerCase()} for Max.
      </p>
      <a
        href={meta.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-mx-accent mt-3 inline-block text-[15px] font-medium"
      >
        Open {meta.title.toLowerCase()} →
      </a>
    </div>
  );
}
