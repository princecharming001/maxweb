export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Off-white "trace"-style landing surface.
  return <div className="theme-trace min-h-screen">{children}</div>;
}
