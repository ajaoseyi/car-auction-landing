import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { CONTACT_EMAIL } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — Carlot",
  description: "How Carlot collects, uses and protects your personal data.",
};

export default function PrivacyPage() {
  const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

  return (
    <LegalPage
      title="Privacy Policy"
      updated="24 October 2026"
      intro="We only collect what we need to keep you on the waitlist and, later, to run fair auctions. Here's what that is, why, and what you can do about it."
    >
      <h2>Who we are</h2>
      <p>
        Carlot (&quot;Carlot&quot;, &quot;we&quot;, &quot;us&quot;) runs online auctions for cars sourced from the USA, UK and Canada for buyers in Nigeria.
        We are the data controller for the personal data described in this policy. We process personal data in line with the Nigeria Data
        Protection Act 2023 (NDPA) and other applicable law.
      </p>
      <p>Questions or requests about your data can go to {mail}.</p>

      <h2>What we collect</h2>
      <h3>When you join the waitlist</h3>
      <ul>
        <li><strong>Email address</strong> (required) and <strong>name</strong> (optional), which you type into the form.</li>
        <li>Your <strong>paddle number</strong>, the waitlist number we assign you.</li>
        <li>The date you signed up and that you signed up from this website.</li>
      </ul>
      <h3>Automatically, when you visit</h3>
      <ul>
        <li>
          Technical data your browser sends with every request, such as your IP address, browser type and the pages you load. Our hosting
          provider and API keep this in server logs for security and to stop abuse, such as rate limiting repeated sign-ups.
        </li>
      </ul>
      <h3>When bidding opens</h3>
      <p>
        To register a bidder, take deposits and deliver cars we will also need details such as your phone number, delivery address,
        government ID (for identity and customs checks) and payment records. We will tell you exactly what we collect, and why, before you
        provide it.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li><strong>To run the waitlist</strong>: save your spot, send your welcome email and tell you when bidding opens.</li>
        <li><strong>To send updates</strong> about upcoming lots and auction dates. You can unsubscribe at any time.</li>
        <li><strong>To keep the service secure</strong>: detect spam, fraud and abuse.</li>
        <li><strong>To meet legal obligations</strong>, such as tax, customs and anti-money-laundering record keeping once auctions are live.</li>
      </ul>
      <p>
        Our legal bases are your <strong>consent</strong> (waitlist and marketing emails), <strong>performance of a contract</strong> (when you
        register to bid or buy), our <strong>legitimate interests</strong> (security and improving the service) and <strong>legal
        obligation</strong>. We do not sell your personal data.
      </p>

      <h2>Stored on your device</h2>
      <p>
        After you join, this site saves your email, name and paddle number in your browser&apos;s local storage so it can show your paddle
        when you come back. It stays on your device and is not used for tracking. Clicking &quot;Use a different email&quot;, or clearing
        your browser data, removes it. We do not use advertising or analytics cookies.
      </p>

      <h2>Who we share it with</h2>
      <p>We share personal data only with service providers that help us run Carlot, and only as much as they need:</p>
      <ul>
        <li>Hosting and infrastructure providers that run this website and our API.</li>
        <li>Our email delivery provider, which sends waitlist and update emails.</li>
        <li>
          Font providers (Google Fonts and Fontshare). Your browser loads fonts from their servers, which means they receive your IP address.
        </li>
        <li>Once auctions are live: payment processors, shipping agents and clearing agents handling your car.</li>
        <li>Authorities, where the law requires it.</li>
      </ul>
      <p>
        <strong>WhatsApp group.</strong> If you join our WhatsApp community, WhatsApp (Meta) processes your data under its own privacy policy,
        and other members of the group can see your phone number and profile. We don&apos;t control that, so please only join if you&apos;re
        comfortable with it.
      </p>

      <h2>International transfers</h2>
      <p>
        Some of our providers store data outside Nigeria. Where they do, we rely on safeguards recognised under the NDPA, such as contractual
        protections, to keep your data protected to the same standard.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep waitlist data until you unsubscribe or ask us to delete it, or until we close the waitlist. Server logs are kept for a short
        period, typically no more than 90 days. Records we must keep by law, such as transaction records, are kept for as long as the law
        requires.
      </p>

      <h2>Your rights</h2>
      <p>Under the NDPA you can:</p>
      <ul>
        <li>ask for a copy of the personal data we hold about you;</li>
        <li>ask us to correct or delete it;</li>
        <li>withdraw consent or object to processing, including unsubscribing from emails;</li>
        <li>ask us to restrict processing, or to send your data to you or another provider in a portable format.</li>
      </ul>
      <p>
        Email {mail} and we&apos;ll respond within 30 days. To delete your account, use our{" "}
        <Link href="/delete-account">account deletion page</Link>. If you&apos;re not happy with our response, you can complain to the Nigeria Data
        Protection Commission (NDPC).
      </p>

      <h2>Security</h2>
      <p>
        We use encryption in transit (HTTPS), access controls and reputable providers to protect your data. No system is perfectly secure, so
        if we ever learn of a breach that affects you, we&apos;ll tell you and the NDPC as the law requires.
      </p>

      <h2>Children</h2>
      <p>Carlot is for adults. We don&apos;t knowingly collect data from anyone under 18.</p>

      <h2>Changes</h2>
      <p>
        We&apos;ll update this policy as Carlot grows, and in particular before auctions open. The date at the top shows the latest version.
        If we make a significant change we&apos;ll email people on the waitlist. See also our <Link href="/terms">Terms and Conditions</Link>.
      </p>
    </LegalPage>
  );
}
