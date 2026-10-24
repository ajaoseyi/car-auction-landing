import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./LegalPage.module.css";

// Where privacy requests and legal notices go. Shown on both legal pages.
export const CONTACT_EMAIL = "carlotngn@gmail.com";

type Props = {
  title: string;
  updated: string;
  intro: ReactNode;
  children: ReactNode;
};

export default function LegalPage({ title, updated, intro, children }: Props) {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          <span className={styles.mark}>
            <span className={styles.markHandle} />
            <span className={styles.markDot} />
          </span>
          <span className={styles.wordmark}>Carlot</span>
        </Link>
        <Link href="/#join" className={styles.navCta}>
          Join the waitlist<span className={styles.navArrow}>→</span>
        </Link>
      </header>

      <main className={styles.main}>
        <span className={styles.eyebrow}>LEGAL · UPDATED {updated.toUpperCase()}</span>
        <h1 className={styles.h1}>{title}</h1>
        <p className={styles.intro}>{intro}</p>
        <article className={styles.article}>{children}</article>
      </main>

      <footer className={styles.footer}>
        <span>© Carlot</span>
        <nav className={styles.footerNav}>
          <Link href="/">Home</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/delete-account">Delete account</Link>
        </nav>
      </footer>
    </div>
  );
}
