export const metadata = {
  title: "Cookies — Max",
};

export default function CookiesPage() {
  return (
    <main className="px-6 py-16 md:py-20">
      <div className="max-w-4xl mx-auto">
        <iframe
          src="/legal/cookies.html"
          className="w-full min-h-[80vh] border-0 rounded-2xl bg-white"
          title="Cookie notice"
        />
      </div>
    </main>
  );
}
