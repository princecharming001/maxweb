import Link from "next/link";

/**
 * Auth canvas — mirrors the iOS Login/Signup screens: a soft off-white canvas
 * (#F1F1EF) with the lowercase serif "max" wordmark centered above the form so
 * the white inputs/buttons lift off it. Shared by login, signup, forgot-password.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F1F1EF] px-6 py-10">
      <Link href="/" className="mb-6" aria-label="Max">
        <span className="font-mx-serif text-mx-ink text-[44px] leading-none tracking-[-0.03em]">
          max
        </span>
      </Link>
      <div className="w-full max-w-[440px]">{children}</div>
    </div>
  );
}
