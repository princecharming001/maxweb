export default function StartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Funnel runs on the light Max surface with no app shell.
  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-[520px] px-5 py-8 sm:py-12">
        {children}
      </div>
    </div>
  );
}
