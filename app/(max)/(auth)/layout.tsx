import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <Link href="/" className="mb-8">
        <span className="font-mx-serif text-mx-ink text-[38px] leading-none">
          Max
        </span>
      </Link>
      <div className="w-full max-w-[400px]">{children}</div>
    </div>
  );
}
