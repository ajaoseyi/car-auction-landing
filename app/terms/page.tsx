import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { CONTACT_EMAIL } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms and Conditions — Carlot",
  description: "The terms that apply when you use the Carlot website and join the waitlist.",
};

export default function TermsPage() {
  const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

  return (
    <LegalPage
      title="Terms and Conditions"
      updated="24 October 2026"
      intro="These terms apply when you use the Carlot website and join our waitlist. Please read them. By using the site, you agree to them."
    >
      <h2>1. About these terms</h2>
      <p>
        These terms are an agreement between you and Carlot (&quot;Carlot&quot;, &quot;we&quot;, &quot;us&quot;). They cover this website, the
        waitlist and our updates. Bidding is not open yet. When it opens, separate <strong>Auction Rules</strong> will set out how bidding,
        deposits, payment, shipping and clearing work, and you&apos;ll need to accept them before you can bid. If the Auction Rules conflict
        with these terms, the Auction Rules apply to the auction.
      </p>

      <h2>2. Who can use Carlot</h2>
      <p>You must be at least 18 and able to enter into a binding contract under Nigerian law.</p>

      <h2>3. The waitlist</h2>
      <ul>
        <li>Joining the waitlist is free and doesn&apos;t commit you to buy anything.</li>
        <li>
          Your paddle number shows your place on the waitlist. It doesn&apos;t guarantee access to any particular car, auction or price.
        </li>
        <li>Give us accurate details. One sign-up per person; we may remove duplicate, fake or automated sign-ups.</li>
        <li>You can leave at any time by unsubscribing or emailing {mail}.</li>
      </ul>

      <h2>4. How auctions are planned to work</h2>
      <p>
        We describe our plans on this website so you know what to expect. They are a summary, not a promise, and the Auction Rules published
        when bidding opens will be the binding version. Currently we plan that:
      </p>
      <ul>
        <li>Cars are sourced from the USA, UK and Canada and inspected overseas before they are listed.</li>
        <li>
          A <strong>refundable deposit of ₦100,000</strong> gets you a bidding paddle. If you don&apos;t win, the deposit is returned to you.
        </li>
        <li>If you win, you pay the balance in full or in parts within <strong>48 hours</strong> of the auction closing.</li>
        <li>Shipping to Nigeria and customs clearing are optional services you can add.</li>
      </ul>
      <p>Amounts, timelines and services may change before launch.</p>

      <h2>5. Vehicle information</h2>
      <p>
        We work to describe every car accurately, but photos, specifications and history on the website or in our updates are for
        information only and may be provided by third parties. The cars on this landing page are illustrations, not live lots.
      </p>

      <h2>6. Updates and the WhatsApp group</h2>
      <p>
        Our emails and WhatsApp messages share early lots, auction dates and news. They are not offers to sell. In our WhatsApp group,
        please be respectful and don&apos;t post spam, scams or other people&apos;s personal information. We may remove anyone who
        doesn&apos;t follow these rules. WhatsApp&apos;s own terms also apply.
      </p>

      <h2>7. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>use the site for anything unlawful or fraudulent, or impersonate anyone;</li>
        <li>interfere with the site, overload it, or try to get around its security or rate limits;</li>
        <li>scrape, copy or reuse our content or listings without our written permission.</li>
      </ul>

      <h2>8. Our content</h2>
      <p>
        The Carlot name, logo, design, text, animations and other content on this site belong to us or our licensors. You may view them for
        personal use, but you may not reuse them without our permission.
      </p>

      <h2>9. Availability</h2>
      <p>
        We provide the website &quot;as is&quot;. We aim to keep it running smoothly, but we don&apos;t guarantee it will always be available
        or free of errors, and we may change, pause or stop any part of it, including the waitlist.
      </p>

      <h2>10. Liability</h2>
      <p>
        To the extent the law allows, we are not liable for indirect or consequential losses, or for loss of profit or opportunity, arising
        from your use of the website or waitlist. Nothing in these terms limits liability that cannot be limited under Nigerian law, including
        your rights under the Federal Competition and Consumer Protection Act 2018.
      </p>

      <h2>11. Privacy</h2>
      <p>
        Our <Link href="/privacy">Privacy Policy</Link> explains how we handle your personal data.
      </p>

      <h2>12. Changes to these terms</h2>
      <p>
        We may update these terms as Carlot develops. The date at the top shows the latest version. If a change is significant, we&apos;ll
        let people on the waitlist know by email. Continuing to use the site after a change means you accept the updated terms.
      </p>

      <h2>13. Governing law</h2>
      <p>
        These terms are governed by the laws of the Federal Republic of Nigeria. We&apos;ll try to resolve any dispute with you informally
        first. If we can&apos;t, it will be settled by the courts of Nigeria.
      </p>

      <h2>14. Contact</h2>
      <p>Questions about these terms? Email {mail}.</p>
    </LegalPage>
  );
}
