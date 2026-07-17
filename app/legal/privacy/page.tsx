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
        <p className="mt-3 text-muted text-[13px]">
          <span className="font-medium text-foreground">Effective date:</span>{" "}
          April 6, 2026
        </p>
        <p className="mt-4 text-muted text-[15px] leading-relaxed">
          Max (&ldquo;Max,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or
          &ldquo;us&rdquo;) respects your privacy. This Privacy Policy explains
          what information we collect, how we use it, when we share it, and the
          choices you have when using our website, mobile application, and
          related services (collectively, the &ldquo;Services&rdquo;).
        </p>

        <div className="h-px bg-border/40 my-10" />

        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            1. Information We Collect
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            We may collect the following categories of information:
          </p>

          <h3 className="mt-6 text-[15px] font-medium text-foreground">
            a. Contact Information
          </h3>
          <ul className="mt-2 text-muted text-[14px] leading-relaxed list-disc pl-5 space-y-1">
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
          </ul>

          <h3 className="mt-6 text-[15px] font-medium text-foreground">
            b. Account and Identifier Information
          </h3>
          <ul className="mt-2 text-muted text-[14px] leading-relaxed list-disc pl-5 space-y-1">
            <li>User ID</li>
            <li>Account-related identifiers</li>
          </ul>

          <h3 className="mt-6 text-[15px] font-medium text-foreground">
            c. User Content
          </h3>
          <ul className="mt-2 text-muted text-[14px] leading-relaxed list-disc pl-5 space-y-1">
            <li>Photos or videos you upload</li>
            <li>
              Messages, prompts, responses, or other content you submit in the
              app
            </li>
          </ul>

          <h3 className="mt-6 text-[15px] font-medium text-foreground">
            d. Purchase Information
          </h3>
          <ul className="mt-2 text-muted text-[14px] leading-relaxed list-disc pl-5 space-y-1">
            <li>Subscription status</li>
            <li>Purchase history</li>
            <li>Transaction status</li>
            <li>Limited billing-related metadata</li>
          </ul>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            We do not store full payment card numbers on our own servers.
          </p>
        </section>

        <div className="h-px bg-border/40 my-10" />

        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            2. How We Use Information
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            We use the information we collect to:
          </p>
          <ul className="mt-2 text-muted text-[14px] leading-relaxed list-disc pl-5 space-y-1">
            <li>Provide, operate, and maintain the Services</li>
            <li>Create and manage user accounts</li>
            <li>Process purchases and manage subscriptions</li>
            <li>Deliver app features and personalized results</li>
            <li>
              Analyze photos, videos, prompts, and other submitted content to
              generate app outputs
            </li>
            <li>Respond to support requests and communicate with you</li>
            <li>
              Improve the performance, reliability, and safety of the Services
            </li>
            <li>Detect fraud, abuse, security incidents, or misuse</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <div className="h-px bg-border/40 my-10" />

        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            3. How We Share Information
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            We may share information in the following situations:
          </p>
          <ul className="mt-2 text-muted text-[14px] leading-relaxed list-disc pl-5 space-y-2">
            <li>
              <strong className="text-foreground font-medium">
                Service providers:
              </strong>{" "}
              We may share information with vendors that help us operate the
              Services, such as hosting providers, analytics providers, AI
              infrastructure providers, customer support tools, and payment
              processors.
            </li>
            <li>
              <strong className="text-foreground font-medium">
                Payment processing:
              </strong>{" "}
              Payments and subscription processing may be handled by third-party
              providers such as Stripe. These providers process payment
              information according to their own privacy policies and terms.
            </li>
            <li>
              <strong className="text-foreground font-medium">
                Legal reasons:
              </strong>{" "}
              We may disclose information if required by law, regulation, legal
              process, or governmental request, or if necessary to protect
              rights, safety, and security.
            </li>
            <li>
              <strong className="text-foreground font-medium">
                Business transfers:
              </strong>{" "}
              We may share or transfer information in connection with a merger,
              acquisition, financing, reorganization, sale of assets, or
              similar transaction.
            </li>
          </ul>
        </section>

        <div className="h-px bg-border/40 my-10" />

        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            4. Data Linked to Your Identity
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            The information described above may be linked to your identity and
            used to provide app functionality, account management,
            personalization, subscription access, and support.
          </p>
        </section>

        <div className="h-px bg-border/40 my-10" />

        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            5. Data Retention
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            We retain personal information for as long as reasonably necessary
            to provide the Services, maintain your account, complete
            transactions, resolve disputes, enforce our agreements, comply with
            legal obligations, and protect the security and integrity of the
            Services.
          </p>
        </section>

        <div className="h-px bg-border/40 my-10" />

        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            6. Data Deletion
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            You may request deletion of your account and personal information by
            contacting us at{" "}
            <a
              href="mailto:mog.max123@gmail.com"
              className="text-foreground underline underline-offset-2"
            >
              mog.max123@gmail.com
            </a>
            . We may retain certain information where required for legal,
            security, fraud prevention, billing, or compliance purposes.
          </p>
        </section>

        <div className="h-px bg-border/40 my-10" />

        <section>
          <h2 className="text-xl font-semibold tracking-tight">7. Security</h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            We use reasonable administrative, technical, and organizational
            measures to help protect personal information. However, no method of
            transmission over the internet or method of electronic storage is
            completely secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <div className="h-px bg-border/40 my-10" />

        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            8. Children&apos;s Privacy
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            The Services are not directed to children under 13, and we do not
            knowingly collect personal information from children under 13. If
            you believe a child has provided personal information to us, please
            contact us and we will take appropriate steps to delete it.
          </p>
        </section>

        <div className="h-px bg-border/40 my-10" />

        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            9. Your Choices
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            You may choose not to provide certain information, but some
            features of the Services may not function properly as a result. You
            may also contact us to request access, correction, or deletion of
            your information where applicable.
          </p>
        </section>

        <div className="h-px bg-border/40 my-10" />

        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            10. Third-Party Services
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            The Services may rely on third-party tools, platforms, and
            infrastructure. Your use of certain third-party services may also be
            subject to those third parties&apos; privacy policies and terms.
          </p>
        </section>

        <div className="h-px bg-border/40 my-10" />

        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            11. Changes to This Privacy Policy
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            We may update this Privacy Policy from time to time. If we make
            material changes, we will update the effective date above and may
            provide additional notice where appropriate.
          </p>
        </section>

        <div className="h-px bg-border/40 my-10" />

        <section>
          <h2 className="text-xl font-semibold tracking-tight">
            12. Contact Us
          </h2>
          <p className="mt-3 text-muted text-[14px] leading-relaxed">
            If you have questions about this Privacy Policy or our data
            practices, you can contact us at:
          </p>
          <div className="mt-4 text-muted text-[14px] leading-relaxed space-y-1">
            <p className="font-medium text-foreground">Max</p>
            <p>
              Email:{" "}
              <a
                href="mailto:mog.max123@gmail.com"
                className="text-foreground underline underline-offset-2"
              >
                mog.max123@gmail.com
              </a>
            </p>
            <p>
              Website:{" "}
              <a
                href="https://maxmaxmax.today"
                className="text-foreground underline underline-offset-2"
              >
                https://maxmaxmax.today
              </a>
            </p>
          </div>
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
