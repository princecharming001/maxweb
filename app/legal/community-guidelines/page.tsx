export const metadata = {
  title: "Community Guidelines — Max",
};

export default function CommunityGuidelinesPage() {
  return (
    <main className="px-6 py-16 md:py-20">
      <div className="max-w-4xl mx-auto">
        <iframe
          src="/legal/community-guidelines.html"
          className="w-full min-h-[80vh] border-0 rounded-2xl bg-white"
          title="Community guidelines"
        />
      </div>
    </main>
  );
}
