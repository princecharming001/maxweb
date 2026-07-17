import MaxProviders from "@/components/max/Providers";

export default function MaxRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The light Max surface (white bg, ink text, Matter body) with the query +
  // auth providers scoped to the whole app section.
  return (
    <div className="theme-max min-h-screen">
      <MaxProviders>{children}</MaxProviders>
    </div>
  );
}
