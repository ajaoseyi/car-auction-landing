import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { CONTACT_EMAIL } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — Carlot",
  description: "How the Carlot app and website collect, use, share and protect your personal data.",
};

export default function PrivacyPage() {
  const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

  return (
    <LegalPage
      title="Privacy Policy"
      updated="24 October 2026"
      intro="This policy covers the Carlot mobile app (Android and iOS) and this website. It explains what personal data we collect, why, who we share it with, and what you can do about it."
    >
      <h2>Who we are</h2>
      <p>
        Carlot (&quot;Carlot&quot;, &quot;we&quot;, &quot;us&quot;) runs online auctions for cars sourced from the USA, UK and Canada for buyers in Nigeria.
        We are based in Lagos, Nigeria, and are the data controller for the personal data described in this policy. We process personal data
        in line with the Nigeria Data Protection Act 2023 (NDPA) and other applicable law.
      </p>
      <p>Questions or requests about your data can go to {mail}.</p>

      <h2>What we collect in the Carlot app</h2>
      <h3>Your account</h3>
      <ul>
        <li>
          <strong>Email address</strong>, which you use to sign in. We email you a one-time code to confirm it&apos;s yours.
        </li>
        <li>
          <strong>Name</strong>, if you give it, and your <strong>paddle number</strong>, the bidder number we assign you.
        </li>
        <li>
          <strong>Phone number</strong>, if you add it. It&apos;s optional, and we use it to contact you about lots you win.
        </li>
        <li>
          If you <strong>sign in with Google or Apple</strong>, we receive your name, email address and an account identifier from them. We
          never receive your Google or Apple password.
        </li>
      </ul>
      <h3>Bidding and payments</h3>
      <ul>
        <li>Your bids, the lots you join, deposits, wins, payments, refunds and your Carlot credit balance.</li>
        <li>
          <strong>Card and bank payments are handled by Paystack.</strong> You enter your card or bank details on Paystack&apos;s secure
          checkout, not in our app, and we never see or store your full card number. Paystack tells us whether a payment succeeded, its
          amount and reference, and limited card details such as the card type and last four digits.
        </li>
      </ul>
      <h3>Delivery</h3>
      <ul>
        <li>If you win a car and ask us to deliver it, your delivery address, city and a contact phone number.</li>
      </ul>
      <h3>Device and technical data</h3>
      <ul>
        <li>
          An <strong>installation ID</strong>: a random identifier the app creates when you first open it, so we can keep you signed in and
          spot fake accounts. It is not your phone&apos;s advertising ID or hardware ID.
        </li>
        <li>
          Your <strong>IP address</strong>, device type and app version, recorded when you sign in and with each request, for security and to
          stop abuse.
        </li>
        <li>Error reports when something goes wrong on our servers, so we can fix it.</li>
      </ul>
      <p>
        The app does not access your location, contacts, photos, camera or microphone, and it does not use advertising IDs or show ads.
      </p>

      <h2>What we collect on this website</h2>
      <h3>When you join the waitlist</h3>
      <ul>
        <li>
          <strong>Email address</strong> (required) and <strong>name</strong> (optional), which you type into the form.
        </li>
        <li>Your paddle number, and the date and page you signed up from.</li>
      </ul>
      <h3>Automatically, when you visit</h3>
      <ul>
        <li>
          Technical data your browser sends with every request, such as your IP address, browser type and the pages you load. Our hosting
          provider and API keep this in server logs for security and to stop abuse.
        </li>
      </ul>
      <h3>Stored in your browser</h3>
      <p>
        After you join, this site saves your email, name and paddle number in your browser&apos;s local storage so it can show your paddle
        when you come back. It stays on your device and is not used for tracking. Clicking &quot;Use a different email&quot;, or clearing
        your browser data, removes it. We do not use advertising or analytics cookies.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>
          <strong>To run your account and auctions</strong>: sign you in, take deposits, place your bids, process payments, refunds and
          deliveries, and send you messages about your bids, wins and payments.
        </li>
        <li>
          <strong>To run the waitlist and send updates</strong> about upcoming lots and auction dates. You can unsubscribe at any time.
        </li>
        <li>
          <strong>To keep Carlot secure and fair</strong>: detect fraud, fake accounts and abuse, and fix errors.
        </li>
        <li>
          <strong>To meet legal obligations</strong>, such as tax, customs and anti-money-laundering record keeping.
        </li>
      </ul>
      <p>
        Our legal bases are <strong>performance of a contract</strong> (your account, bids and purchases), your <strong>consent</strong>{" "}
        (waitlist and marketing emails), our <strong>legitimate interests</strong> (security and improving the service) and{" "}
        <strong>legal obligation</strong>. We do not sell your personal data, and we do not use it for advertising.
      </p>

      <h2>Who we share it with</h2>
      <p>We share personal data only with service providers that help us run Carlot, and only as much as they need:</p>
      <ul>
        <li>
          <strong>Paystack</strong>, our payment processor, for deposits, payments and refunds.
        </li>
        <li>
          <strong>Google and Apple</strong>, if you choose to sign in with them.
        </li>
        <li>Hosting, database and infrastructure providers that run our app servers, API and this website.</li>
        <li>Our email delivery provider, which sends sign-in codes, receipts and updates.</li>
        <li>An error-monitoring provider, which receives technical details when our servers hit an error.</li>
        <li>
          Font providers for this website (Google Fonts and Fontshare). Your browser loads fonts from their servers, so they receive your IP
          address.
        </li>
        <li>Delivery, shipping and clearing agents, when you buy a car, so they can get it to you.</li>
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
      <ul>
        <li>Account data: for as long as your account is open. We delete it within 30 days of a deletion request.</li>
        <li>Waitlist data: until you unsubscribe or ask us to delete it, or until we close the waitlist.</li>
        <li>
          Transaction records (payments, deposits, invoices, customs and anti-money-laundering records): up to 6 years, as Nigerian law
          requires, even after your account is deleted.
        </li>
        <li>Server logs and sign-in records: typically no more than 90 days.</li>
      </ul>

      <h2>Your rights and deleting your account</h2>
      <p>Under the NDPA you can:</p>
      <ul>
        <li>ask for a copy of the personal data we hold about you;</li>
        <li>ask us to correct or delete it;</li>
        <li>withdraw consent or object to processing, including unsubscribing from emails;</li>
        <li>ask us to restrict processing, or to send your data to you or another provider in a portable format.</li>
      </ul>
      <p>
        To delete your Carlot account and its data, use our <Link href="/delete-account">account deletion page</Link>, which explains what we
        delete and what we must keep. For anything else, email {mail} and we&apos;ll respond within 30 days. If you&apos;re not happy with our
        response, you can complain to the Nigeria Data Protection Commission (NDPC).
      </p>

      <h2>Security</h2>
      <p>
        We encrypt data in transit (HTTPS), store sign-in tokens in your device&apos;s secure storage, restrict staff access, and use
        reputable providers. No system is perfectly secure, so if we ever learn of a breach that affects you, we&apos;ll tell you and the NDPC
        as the law requires.
      </p>

      <h2>Children</h2>
      <p>Carlot is for adults. You must be 18 or older to use the app, and we don&apos;t knowingly collect data from anyone under 18.</p>

      <h2>Changes</h2>
      <p>
        We&apos;ll update this policy when what we collect changes. The date at the top shows the latest version. If we make a significant
        change we&apos;ll tell you in the app or by email. See also our <Link href="/terms">Terms and Conditions</Link>.
      </p>
    </LegalPage>
  );
}
