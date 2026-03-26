export const metadata = {
  title: "Legal — Max",
  description: "Official legal documents for the Max mobile application.",
};

export default function LegalPage() {
  return (
    <main className="px-6 py-16 md:py-20">
      <div className="max-w-4xl mx-auto">
        <iframe
          src="/legal/index.html"
          className="w-full min-h-[80vh] border-0 rounded-2xl bg-white"
          title="Legal home"
        />
      </div>
    </main>
  );
}
