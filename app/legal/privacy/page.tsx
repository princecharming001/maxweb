export const metadata = {
  title: "Privacy — Max",
};

export default function PrivacyPage() {
  return (
    <main className="px-6 py-16 md:py-20">
      <div className="max-w-4xl mx-auto">
        <iframe
          src="/legal/privacy.html"
          className="w-full min-h-[80vh] border-0 rounded-2xl bg-white"
          title="Privacy policy"
        />
      </div>
    </main>
  );
}
