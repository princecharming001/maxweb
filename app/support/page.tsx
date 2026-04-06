import Link from "next/link";

export const metadata = {
  title: "Support — Max",
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12">
          <Link
            href="/"
            className="text-xl font-bold tracking-tighter text-foreground hover:opacity-70 transition-opacity"
          >
            max
          </Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Support
        </h1>
        <p className="mt-4 text-muted text-[15px] leading-relaxed">
          If you&apos;re experiencing issues or need help using Max, please
          contact us using the information below. We aim to provide timely and
          effective support for all users.
        </p>

        <div className="h-px bg-border/40 my-10" />

        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            Contact Information
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            Support Email:{" "}
            <a
              href="mailto:mog.max123@gmail.com"
              className="text-foreground underline underline-offset-2"
            >
              mog.max123@gmail.com
            </a>
          </p>
          <p className="mt-4 text-muted text-[14px] leading-relaxed">
            When contacting support, please include:
          </p>
          <ul className="mt-2 text-muted text-[14px] leading-relaxed list-disc pl-5 space-y-1">
            <li>Device model (e.g., iPhone 13, iPhone 15 Pro)</li>
            <li>iOS version</li>
            <li>App version (if known)</li>
            <li>A clear description of the issue</li>
            <li>Screenshots (if applicable)</li>
          </ul>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            Providing this information helps us resolve your issue faster.
          </p>
        </section>

        <div className="h-px bg-border/40 my-10" />

        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            Support Availability
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            Support is available via email. We typically respond within 24–48
            hours, excluding weekends and holidays.
          </p>
        </section>

        <div className="h-px bg-border/40 my-10" />

        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            Scope of Support
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            We can assist with:
          </p>
          <ul className="mt-2 text-muted text-[14px] leading-relaxed list-disc pl-5 space-y-1">
            <li>Account access or login issues</li>
            <li>App crashes, bugs, or performance problems</li>
            <li>Subscription and billing inquiries</li>
            <li>Questions about features or app functionality</li>
          </ul>
        </section>

        <div className="h-px bg-border/40 my-10" />

        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            Subscriptions & Billing
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            Max may offer in-app purchases and subscription-based features.
          </p>
          <ul className="mt-2 text-muted text-[14px] leading-relaxed list-disc pl-5 space-y-1">
            <li>
              All payments are processed through your Apple ID via Apple
            </li>
            <li>
              Subscriptions renew automatically unless canceled at least 24
              hours before the end of the current billing period
            </li>
            <li>
              You can manage or cancel subscriptions at any time in your Apple
              ID account settings
            </li>
          </ul>
          <p className="mt-4 text-muted text-[14px] leading-relaxed">
            For billing-related issues, please include:
          </p>
          <ul className="mt-2 text-muted text-[14px] leading-relaxed list-disc pl-5 space-y-1">
            <li>The email associated with your account</li>
            <li>Details of the issue</li>
          </ul>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            If you believe you were charged incorrectly, you may also contact
            Apple Support directly.
          </p>
        </section>

        <div className="h-px bg-border/40 my-10" />

        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            Troubleshooting
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            Before contacting support, we recommend trying the following:
          </p>
          <ul className="mt-2 text-muted text-[14px] leading-relaxed list-disc pl-5 space-y-1">
            <li>Restart the app</li>
            <li>Update to the latest version of iOS</li>
            <li>Update the app to the latest version</li>
            <li>Reinstall the app</li>
          </ul>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            These steps resolve most common issues.
          </p>
        </section>

        <div className="h-px bg-border/40 my-10" />

        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            Privacy & Data Usage
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            Max may process user-provided data, including images, to deliver
            core app functionality. We are committed to protecting your privacy
            and handling data responsibly.
          </p>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            For more information:
          </p>
          <ul className="mt-2 text-muted text-[14px] leading-relaxed list-disc pl-5 space-y-1">
            <li>
              <Link
                href="/legal/privacy"
                className="text-foreground underline underline-offset-2"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/legal/terms"
                className="text-foreground underline underline-offset-2"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </section>

        <div className="h-px bg-border/40 my-10" />

        <section>
          <h2 className="text-xl font-semibold tracking-tight">FAQ</h2>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-[15px] font-medium text-foreground">
                1. The app is not working as expected. What should I do?
              </h3>
              <p className="mt-1 text-muted text-[14px] leading-relaxed">
                Ensure your app and iOS are up to date. Restart the app or
                reinstall it if needed.
              </p>
            </div>
            <div>
              <h3 className="text-[15px] font-medium text-foreground">
                2. I have a billing or subscription issue.
              </h3>
              <p className="mt-1 text-muted text-[14px] leading-relaxed">
                Check your Apple ID subscription settings. If the issue
                persists, contact us with your details.
              </p>
            </div>
            <div>
              <h3 className="text-[15px] font-medium text-foreground">
                3. How long does support take?
              </h3>
              <p className="mt-1 text-muted text-[14px] leading-relaxed">
                We typically respond within 24–48 hours.
              </p>
            </div>
            <div>
              <h3 className="text-[15px] font-medium text-foreground">
                4. How is my data used?
              </h3>
              <p className="mt-1 text-muted text-[14px] leading-relaxed">
                Your data is used only to provide and improve app functionality.
                Please refer to our{" "}
                <Link
                  href="/legal/privacy"
                  className="text-foreground underline underline-offset-2"
                >
                  Privacy Policy
                </Link>{" "}
                for full details.
              </p>
            </div>
          </div>
        </section>

        <div className="h-px bg-border/40 my-10" />

        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            Additional Inquiries
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            For non-support inquiries (e.g., partnerships):{" "}
            <a
              href="mailto:mog.max123@gmail.com"
              className="text-foreground underline underline-offset-2"
            >
              mog.max123@gmail.com
            </a>
          </p>
        </section>

        <div className="mt-16">
          <Link
            href="/"
            className="text-[13px] text-muted hover:text-foreground transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
