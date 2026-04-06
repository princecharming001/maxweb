import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Max",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="mt-3 text-muted text-[13px]">Last updated: April 6, 2026</p>
        <p className="mt-4 text-muted text-[15px] leading-relaxed">
          Max (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;)
          respects your privacy. This Privacy Policy explains what information
          we collect, how we use it, and your rights when using the Max mobile
          application.
        </p>

        <div className="h-px bg-border/40 my-10" />

        {/* 1 */}
        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            1. Information We Collect
          </h2>

          <h3 className="mt-6 text-[15px] font-medium text-foreground">
            Account Information
          </h3>
          <p className="mt-2 text-muted text-[14px] leading-relaxed">
            We collect information you provide when creating or using an
            account, including:
          </p>
          <ul className="mt-2 text-muted text-[14px] leading-relaxed list-disc pl-5 space-y-1">
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>User ID</li>
          </ul>
          <p className="mt-2 text-muted text-[14px] leading-relaxed">
            This information is used to create and manage your account and is
            linked to your identity.
          </p>

          <div className="h-px bg-border/40 my-8" />

          <h3 className="text-[15px] font-medium text-foreground">
            User Content
          </h3>
          <p className="mt-2 text-muted text-[14px] leading-relaxed">
            We collect content you provide within the app, including:
          </p>
          <ul className="mt-2 text-muted text-[14px] leading-relaxed list-disc pl-5 space-y-1">
            <li>
              Text inputs (such as messages, prompts, and interactions with the
              app)
            </li>
            <li>
              Photos or images you upload (including progress photos)
            </li>
          </ul>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            This data is used solely to:
          </p>
          <ul className="mt-2 text-muted text-[14px] leading-relaxed list-disc pl-5 space-y-1">
            <li>
              Provide core app functionality (such as analysis, ratings, and
              responses)
            </li>
            <li>Generate results requested by the user</li>
            <li>Deliver personalized results</li>
            <li>Track progress over time</li>
          </ul>
          <p className="mt-2 text-muted text-[14px] leading-relaxed">
            This information is linked to your identity.
          </p>

          <div className="h-px bg-border/40 my-8" />

          <h3 className="text-[15px] font-medium text-foreground">
            Purchase Information
          </h3>
          <p className="mt-2 text-muted text-[14px] leading-relaxed">
            If you make purchases in the app, we collect:
          </p>
          <ul className="mt-2 text-muted text-[14px] leading-relaxed list-disc pl-5 space-y-1">
            <li>Purchase history (e.g., subscription status)</li>
          </ul>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            This data is used to:
          </p>
          <ul className="mt-2 text-muted text-[14px] leading-relaxed list-disc pl-5 space-y-1">
            <li>Provide access to paid features</li>
            <li>Manage subscriptions</li>
          </ul>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            Subscription management and billing are handled by Apple through
            your Apple ID settings. We do not collect or store full payment
            details such as credit card numbers.
          </p>
          <p className="mt-2 text-muted text-[14px] leading-relaxed">
            This information is linked to your identity.
          </p>

          <div className="h-px bg-border/40 my-8" />

          <h3 className="text-[15px] font-medium text-foreground">
            Support Communications
          </h3>
          <p className="mt-2 text-muted text-[14px] leading-relaxed">
            If you contact us, we may collect:
          </p>
          <ul className="mt-2 text-muted text-[14px] leading-relaxed list-disc pl-5 space-y-1">
            <li>Your email address</li>
            <li>Your phone number (if provided)</li>
            <li>The contents of your message</li>
          </ul>
          <p className="mt-2 text-muted text-[14px] leading-relaxed">
            This is used solely to respond to support requests.
          </p>
        </section>

        <div className="h-px bg-border/40 my-10" />

        {/* 2 */}
        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            2. How We Use Your Information
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            We use your information to:
          </p>
          <ul className="mt-2 text-muted text-[14px] leading-relaxed list-disc pl-5 space-y-1">
            <li>Provide and operate the app</li>
            <li>Process user-submitted content</li>
            <li>Generate results and responses</li>
            <li>Personalize your experience</li>
            <li>Manage accounts and subscriptions</li>
            <li>
              Communicate with you (including support or important updates)
            </li>
            <li>Improve app performance and features</li>
          </ul>
        </section>

        <div className="h-px bg-border/40 my-10" />

        {/* 3 */}
        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            3. Data Linking
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            The information we collect (including account information, user
            content, purchase data, and phone number) may be linked to your
            identity through your account.
          </p>
        </section>

        <div className="h-px bg-border/40 my-10" />

        {/* 4 */}
        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            4. Data Sharing
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            We may share your information with trusted third-party service
            providers solely to operate the app, including:
          </p>
          <ul className="mt-2 text-muted text-[14px] leading-relaxed list-disc pl-5 space-y-1">
            <li>
              AI processing services (for generating responses or analyzing
              content)
            </li>
            <li>Cloud hosting and infrastructure providers</li>
          </ul>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            We may share user-provided content (such as text inputs and images)
            with third-party AI service providers solely for the purpose of
            generating responses and analyzing content within the app.
          </p>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            We do not sell your personal data and do not share your data for
            advertising purposes.
          </p>
        </section>

        <div className="h-px bg-border/40 my-10" />

        {/* 5 */}
        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            5. Data Retention
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            We retain your data only as long as necessary to provide the
            app&apos;s functionality and improve our services, unless a longer
            retention period is required by law.
          </p>
        </section>

        <div className="h-px bg-border/40 my-10" />

        {/* 6 */}
        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            6. Your Rights
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            You may request access to, correction of, or deletion of your data
            by contacting:
          </p>
          <p className="mt-2 text-muted text-[14px] leading-relaxed">
            Email:{" "}
            <a
              href="mailto:mog.max123@gmail.com"
              className="text-foreground underline underline-offset-2"
            >
              mog.max123@gmail.com
            </a>
          </p>
          <p className="mt-2 text-muted text-[14px] leading-relaxed">
            We will respond within a reasonable timeframe.
          </p>
        </section>

        <div className="h-px bg-border/40 my-10" />

        {/* 7 */}
        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            7. Security
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            We take reasonable measures to protect your information from
            unauthorized access, loss, misuse, or alteration.
          </p>
        </section>

        <div className="h-px bg-border/40 my-10" />

        {/* 8 */}
        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            8. Children&apos;s Privacy
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            Max is not intended for children under the age of 13. We do not
            knowingly collect personal information from children.
          </p>
        </section>

        <div className="h-px bg-border/40 my-10" />

        {/* 9 */}
        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            9. Changes to This Policy
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            We may update this Privacy Policy from time to time. Continued use
            of the app after changes constitutes acceptance of the updated
            policy.
          </p>
        </section>

        <div className="h-px bg-border/40 my-10" />

        {/* 10 */}
        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            10. Contact Us
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            If you have any questions about this Privacy Policy, contact us at:
          </p>
          <p className="mt-2 text-muted text-[14px] leading-relaxed">
            <a
              href="mailto:mog.max123@gmail.com"
              className="text-foreground underline underline-offset-2"
            >
              mog.max123@gmail.com
            </a>
          </p>
        </section>

        <div className="h-px bg-border/40 my-10" />

        {/* 11 */}
        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            11. Tracking
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            We do not use your data for tracking purposes and do not share your
            data with third parties for advertising or cross-app tracking.
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
