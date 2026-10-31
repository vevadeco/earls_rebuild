import type { Metadata } from "next";
import Link from "next/link";
import { Leaf } from "lucide-react";

import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | Earl's Landscaping",
  description:
    "How Earl's Landscaping in Ontario collects, uses, and protects personal information from quote requests, email notifications, and website measurement."
};

const linkClass = "text-primary underline underline-offset-2 hover:text-primary/80";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white/95 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-xl text-foreground leading-tight">Earl&apos;s</span>
              <span className="text-xs text-muted-foreground font-body tracking-wide">LANDSCAPING</span>
            </div>
          </Link>
          <Link
            href="/#hero"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-body font-semibold px-6 py-2 rounded-md"
          >
            Get Free Quote
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <p className="font-body text-sm text-muted-foreground mb-3">Effective October 30, 2026</p>
        <h1 className="font-heading text-4xl sm:text-5xl text-foreground mb-4">Privacy Policy</h1>
        <p className="font-body text-lg text-muted-foreground leading-relaxed mb-12">
          This policy explains what Earl&apos;s Landscaping collects on this website, why we collect it, and the
          choices you have. We are a landscaping business in Hamilton, Ontario, Canada.
        </p>

        <div className="space-y-10 font-body text-foreground/90 leading-relaxed">
          <section>
            <h2 className="font-heading text-2xl text-foreground mb-3">Information from the quote form</h2>
            <p>
              When you request a quote, we collect your name, email address, phone number, and the service you ask
              about. If a message is included with the request, we store that too. We use this information to respond
              to your quote and to contact you about the landscaping services you inquired about.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-foreground mb-3">Where quote requests are stored</h2>
            <p>
              This website is hosted on Vercel. Quote requests are saved in a database connected to that hosting. A
              limited number of people at Earl&apos;s Landscaping can view those records in a private admin area so we
              can follow up.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-foreground mb-3">Email notifications</h2>
            <p>
              When a quote is saved, we send one email notification to our team through Resend, an email delivery
              service. The message includes the details you submitted and the time of the request. Your email address
              is set as the reply-to address so we can write back to you. Resend processes that message on our behalf.
              Their privacy policy is at{" "}
              <a href="https://resend.com/legal/privacy-policy" className={linkClass} rel="noopener noreferrer">
                resend.com/legal/privacy-policy
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-foreground mb-3">Meta Pixel, cookies, and advertising</h2>
            <p className="mb-3">
              We use the Meta (Facebook) Pixel to measure visits and advertising. It records a page view when you
              open a page, and a lead event when a quote form is submitted successfully. Meta may set cookies and
              receive technical information your browser sends, such as the page you viewed. We use this to understand
              which ads lead to quote requests. We do not sell that information.
            </p>
            <p className="mb-3">You can opt out or limit this in either of these ways:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <a
                  href="https://www.facebook.com/ads/preferences"
                  className={linkClass}
                  rel="noopener noreferrer"
                >
                  Facebook ad preferences
                </a>
              </li>
              <li>
                Your browser settings, where you can block or delete cookies. Guides:{" "}
                <a
                  href="https://support.google.com/chrome/answer/95647"
                  className={linkClass}
                  rel="noopener noreferrer"
                >
                  Chrome
                </a>
                ,{" "}
                <a
                  href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop"
                  className={linkClass}
                  rel="noopener noreferrer"
                >
                  Firefox
                </a>
                ,{" "}
                <a
                  href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
                  className={linkClass}
                  rel="noopener noreferrer"
                >
                  Safari
                </a>
                , and{" "}
                <a
                  href="https://support.microsoft.com/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                  className={linkClass}
                  rel="noopener noreferrer"
                >
                  Edge
                </a>
                .
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-foreground mb-3">Our own page-view records</h2>
            <p>
              On the main page of this site we also keep a first-party page view in our database. That record includes
              the page address, the referring site if your browser sends one, and a random session identifier stored in
              your browser for that visit (session storage, not an advertising cookie). We use it to understand traffic
              on our own site. It is separate from the Meta Pixel, and we do not sell it. Closing the browser tab or
              clearing site data for this website removes the session identifier.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-foreground mb-3">We do not sell personal information</h2>
            <p>
              We do not sell, rent, or trade your personal information. We share it only with service providers who
              host the site, store the database, deliver email, or measure advertising as described above, and when the
              law requires us to.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-foreground mb-3">How long we keep it</h2>
            <p>
              We keep quote information for as long as we need it to respond, do the work you asked about, and keep
              ordinary business records. After that we delete it or remove details that identify you. You can ask us to
              delete it sooner, as described below.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-foreground mb-3">Security</h2>
            <p>
              We use HTTPS for the site and restrict the admin area to signed-in staff. No method of storage or
              transmission is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-foreground mb-3">Your rights under PIPEDA</h2>
            <p className="mb-3">
              Personal information we collect through this commercial website is handled under Canada&apos;s Personal
              Information Protection and Electronic Documents Act (PIPEDA). You may ask us to:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-3">
              <li>access the personal information we hold about you</li>
              <li>correct information that is inaccurate or incomplete</li>
              <li>delete information we no longer need to keep</li>
            </ul>
            <p>
              Email{" "}
              <a href="mailto:info@earlslandscaping.ca" className={linkClass}>
                info@earlslandscaping.ca
              </a>{" "}
              with your request. We may need enough detail to find the right record. If a law requires us to keep
              something, we will tell you. If you are not satisfied with our response, you can contact the{" "}
              <a href="https://www.priv.gc.ca/en/report-a-concern/" className={linkClass} rel="noopener noreferrer">
                Office of the Privacy Commissioner of Canada
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-foreground mb-3">Children</h2>
            <p>
              This website is not directed at children under 13, and we do not knowingly collect personal information
              from them. If you believe a child has sent us a quote request, email us and we will delete it.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-foreground mb-3">Changes to this policy</h2>
            <p>
              We may update this policy when our practices change. The new version will be posted on this page with a
              new effective date. The date at the top of this page is the current one.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl text-foreground mb-3">Contact</h2>
            <p>
              Earl&apos;s Landscaping
              <br />
              Hamilton, Ontario, Canada
              <br />
              <a href="mailto:info@earlslandscaping.ca" className={linkClass}>
                info@earlslandscaping.ca
              </a>
              <br />
              <a href="tel:+19055173275" className={linkClass}>
                (905) 517-3275
              </a>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
