import RequireAuth from "@/components/max/RequireAuth";
import AppShell from "@/components/max/AppShell";

export default function AppSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}
