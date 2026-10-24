import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { CONTACT_EMAIL } from "@/components/LegalPage";
import styles from "@/components/LegalPage.module.css";

export const metadata: Metadata = {
  title: "Delete your account — Carlot",
  description: "Request deletion of your Carlot account and personal data.",
};

const SUBJECT = "Delete my Carlot account and data";
const BODY = `Hello Carlot,

Please delete my Carlot account and all personal data associated with it.

Email address on my account:
Name on my account (optional):
Phone number on my account (if any):
Paddle number (if known):

I understand this cannot be undone.

Thank you.`;

// Opens the user's mail app with the request ready to send.
const DELETE_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(BODY)}`;

export default function DeleteAccountPage() {
  return (
    <LegalPage
      title="Delete your account"
      updated="24 October 2026"
      intro="You can ask Carlot to delete your account and the personal data we hold about you at any time. It takes one email."
    >
      <a href={DELETE_MAILTO} className={styles.actionBtn}>
        Email a deletion request<span className={styles.navArrow}>→</span>
      </a>
      <p>
        The button opens your email app with the request already written to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. If it
        doesn&apos;t open, send an email to that address with the subject &quot;{SUBJECT}&quot;.
      </p>

      <h2>How it works</h2>
      <ul>
        <li><strong>Send the request</strong> from the email address linked to your Carlot account, so we can confirm it&apos;s you.</li>
        <li><strong>We confirm</strong> receipt within 3 working days, and may ask one question to verify your identity.</li>
        <li><strong>We delete</strong> your account and data within 30 days and email you when it&apos;s done.</li>
      </ul>

      <h2>What we delete</h2>
      <ul>
        <li>Your account and profile: name, email address, phone number and paddle number.</li>
        <li>Your waitlist entry and email preferences.</li>
        <li>Bids, saved cars and any other activity linked to your account.</li>
      </ul>

      <h2>What we may keep</h2>
      <p>
        If you have paid a deposit or bought a car, Nigerian law requires us to keep transaction records, such as payment, invoice, customs and
        anti-money-laundering records, for up to <strong>6 years</strong>. We keep only what the law requires, and use it for nothing else.
        Server logs are deleted automatically within 90 days.
      </p>
      <p>
        Any refundable deposit you&apos;re owed will be returned before your account is closed. Messages you posted in our WhatsApp group are
        controlled by WhatsApp; you can delete them yourself or leave the group.
      </p>

      <h2>Only want to stop emails?</h2>
      <p>
        Use the unsubscribe link at the bottom of any Carlot email. More detail is in our <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </LegalPage>
  );
}
