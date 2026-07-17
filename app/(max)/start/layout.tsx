export default function StartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Funnel runs on the soft gray Max canvas (iOS #F1F1EF) with no app shell —
  // the white pill cards lift off it exactly like the app.
  return (
    <div className="min-h-screen bg-mx-surface">
      <div className="mx-auto w-full max-w-[460px] px-6 py-8 sm:py-12">
        {children}
      </div>
    </div>
  );
}
