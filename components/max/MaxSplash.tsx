/** Branded loading splash shown while the session restores. */
export default function MaxSplash({ label }: { label?: string }) {
  return (
    <div className="theme-max flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="font-mx-serif text-mx-ink text-[40px] leading-none">Max</div>
      <div
        className="border-mx-accent size-6 animate-spin rounded-full border-2 border-t-transparent"
        aria-label="Loading"
      />
      {label ? <p className="text-mx-muted text-sm">{label}</p> : null}
    </div>
  );
}
