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
          <ul className="mt-4 text-muted text-[14px] leading-relaxed space-y-2">
            <li>
              <span className="font-medium text-foreground">Support email:</span>{" "}
              <a
                href="mailto:support@maxmaxmax.today"
                className="text-foreground underline underline-offset-2"
              >
                support@maxmaxmax.today
              </a>
            </li>
            <li>
              <span className="font-medium text-foreground">Phone:</span>{" "}
              <a
                href="tel:+15103626544"
                className="text-foreground underline underline-offset-2"
              >
                +1 (510) 362-6544
              </a>
            </li>
            <li>
              <span className="font-medium text-foreground">Business address:</span>{" "}
              1481 Peralta Boulevard
            </li>
          </ul>

          <p className="mt-6 text-muted text-[14px] leading-relaxed">
            When contacting support, please include:
          </p>
          <ul className="mt-2 text-muted text-[14px] leading-relaxed list-disc pl-5 space-y-1">
            <li>Device model</li>
            <li>iOS version</li>
            <li>App version (if known)</li>
            <li>A clear description of the issue</li>
            <li>Screenshots, if applicable</li>
          </ul>
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
          <ul className="mt-3 text-muted text-[14px] leading-relaxed list-disc pl-5 space-y-1">
            <li>Account access or login issues</li>
            <li>App crashes, bugs, or performance problems</li>
            <li>Subscription and billing inquiries</li>
            <li>Questions about features or app functionality</li>
            <li>General feedback and feature requests</li>
          </ul>
        </section>

        <div className="h-px bg-border/40 my-10" />

        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            Subscriptions &amp; Billing
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            Max uses recurring subscriptions processed by{" "}
            <strong className="text-foreground font-medium">Stripe</strong>. On
            supported devices, checkout may include{" "}
            <strong className="text-foreground font-medium">Apple Pay</strong>{" "}
            or{" "}
            <strong className="text-foreground font-medium">Google Pay</strong>
            , as well as standard card payment methods.
          </p>

          <p className="mt-4 text-muted text-[14px] leading-relaxed">
            Subscription billing terms:
          </p>
          <ul className="mt-2 text-muted text-[14px] leading-relaxed list-disc pl-5 space-y-2">
            <li>Your subscription renews automatically until canceled.</li>
            <li>
              The renewal term is:{" "}
              <strong className="text-foreground font-medium">weekly</strong>.
            </li>
            <li>
              Each billing period includes access to the Max app for your
              selected plan:
              <ul className="mt-2 list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-foreground font-medium">
                    Chadlite (Basic)
                  </strong>{" "}
                  — up to 2 active maxxes, community forums, one face scan at
                  signup (Basic does not include additional scans), basic course
                  library.
                </li>
                <li>
                  <strong className="text-foreground font-medium">
                    Chad (Premium)
                  </strong>{" "}
                  — up to 3 active maxxes, exclusive forums, daily face scans,
                  full course library, and other Premium features shown in the
                  app at purchase.
                </li>
              </ul>
            </li>
            <li>
              You will be charged in{" "}
              <strong className="text-foreground font-medium">USD</strong>:{" "}
              <strong className="text-foreground font-medium">
                $3.99 per week
              </strong>{" "}
              for Chadlite (Basic) or{" "}
              <strong className="text-foreground font-medium">
                $5.99 per week
              </strong>{" "}
              for Chad (Premium), plus applicable taxes where required.
            </li>
            <li>
              You can cancel at any time by: opening the Max app, going to{" "}
              <strong className="text-foreground font-medium">
                Profile → Manage subscription
              </strong>{" "}
              (or your subscription management screen), and following the
              prompts to cancel. You may also manage or cancel through links in
              Stripe receipts or the Stripe customer portal when available.
              Cancellation stops future renewals; timing of access until the end
              of the paid period follows Stripe and your plan settings.
            </li>
          </ul>

          <p className="mt-4 text-muted text-[14px] leading-relaxed">
            Subscription status is synced with our backend through secure
            billing events and webhooks.
          </p>

          <p className="mt-4 text-muted text-[14px] leading-relaxed">
            When contacting us about billing, please include:
          </p>
          <ul className="mt-2 text-muted text-[14px] leading-relaxed list-disc pl-5 space-y-1">
            <li>The email associated with your account</li>
            <li>The date of the charge</li>
            <li>The amount charged</li>
            <li>A brief description of the issue</li>
          </ul>
        </section>

        <div className="h-px bg-border/40 my-10" />

        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            Troubleshooting
          </h2>
          <ul className="mt-3 text-muted text-[14px] leading-relaxed list-disc pl-5 space-y-1">
            <li>Restart the app</li>
            <li>Update to the latest version of iOS</li>
            <li>Update the app to the latest version from the App Store</li>
            <li>Reinstall the app</li>
          </ul>
        </section>

        <div className="h-px bg-border/40 my-10" />

        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            Privacy &amp; Data Usage
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            Max may process user-provided data, including images and account
            information, to deliver core app functionality. We are committed to
            handling user data responsibly.
          </p>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            For more information, please review our{" "}
            <Link
              href="/legal/privacy"
              className="text-foreground underline underline-offset-2"
            >
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              href="/legal/terms"
              className="text-foreground underline underline-offset-2"
            >
              Terms of Service
            </Link>
            .
          </p>
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
                Make sure your app and iOS are up to date. Restart the app or
                reinstall it if needed.
              </p>
            </div>
            <div>
              <h3 className="text-[15px] font-medium text-foreground">
                2. I have a billing or subscription issue.
              </h3>
              <p className="mt-1 text-muted text-[14px] leading-relaxed">
                Contact support with your account email, charge date, amount,
                and issue details so we can investigate.
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
                Your data is used to provide and improve app functionality.
                Please review our{" "}
                <Link
                  href="/legal/privacy"
                  className="text-foreground underline underline-offset-2"
                >
                  Privacy Policy
                </Link>{" "}
                for more details.
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
            For non-support inquiries, including partnerships or business
            questions, contact:
          </p>
          <ul className="mt-3 text-muted text-[14px] leading-relaxed space-y-2">
            <li>
              <span className="font-medium text-foreground">Email:</span>{" "}
              <a
                href="mailto:support@maxmaxmax.today"
                className="text-foreground underline underline-offset-2"
              >
                support@maxmaxmax.today
              </a>
            </li>
            <li>
              <span className="font-medium text-foreground">Phone:</span>{" "}
              <a
                href="tel:+15103626544"
                className="text-foreground underline underline-offset-2"
              >
                +1 (510) 362-6544
              </a>
            </li>
            <li>
              <span className="font-medium text-foreground">Business address:</span>{" "}
              1481 Peralta Boulevard
            </li>
          </ul>
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
