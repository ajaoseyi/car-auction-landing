"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import type { AnimationItem } from "lottie-web";
import type { WaitlistScene } from "@/lib/waitlistScene";
import { joinWaitlist } from "@/lib/waitlistApi";
import styles from "./Waitlist.module.css";

type Props = {
  whatsappUrl?: string;
  glow?: boolean;
  sound?: boolean;
};

type Stored = { email: string; name?: string; no: string };
type SplashPhase = "in" | "out" | "gone";

const STORAGE_KEY = "carlot-waitlist";

function Hl({ children }: { children: ReactNode }) {
  return (
    <span className={styles.hlWrap}>
      <span data-hl="" className={styles.hl} />
      <span className={styles.hlText}>{children}</span>
    </span>
  );
}

function WhatsAppButton({ href, tall }: { href: string; tall?: boolean }) {
  return (
    <a href={href} target="_blank" rel="noopener" className={`${styles.waBtn} ${tall ? styles.waBtnTall : ""}`}>
      <span className={styles.waLabel}>
        <span className={styles.waDot} />
        Join the WhatsApp group
      </span>
      <span className={styles.ctaArrowLg}>↗</span>
    </a>
  );
}

export default function Waitlist({ whatsappUrl = "https://chat.whatsapp.com/", glow = true, sound = true }: Props) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [no, setNo] = useState<string | null>(null);
  const [splash, setSplash] = useState<SplashPhase>("in");

  const host = useRef<HTMLDivElement>(null);
  const splashEl = useRef<HTMLDivElement>(null);
  const scene = useRef<WaitlistScene | null>(null);
  const opts = useRef({ glow, sound });

  // Splash: Lottie logo reveal, then the yellow curtain slides up.
  useEffect(() => {
    let phase: SplashPhase = "in";
    let anim: AnimationItem | null = null;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const endSplash = () => {
      if (phase !== "in") return;
      phase = "out";
      document.body.style.overflow = "";
      timers.push(setTimeout(() => setSplash("out"), 250));
      timers.push(setTimeout(() => { setSplash("gone"); anim?.destroy(); anim = null; }, 1250));
    };

    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    timers.push(setTimeout(endSplash, 4500));

    import("lottie-web").then(({ default: lottie }) => {
      if (cancelled || !splashEl.current) return;
      anim = lottie.loadAnimation({ container: splashEl.current, renderer: "svg", loop: false, autoplay: true, path: "/lottie/splash.json" });
      anim.addEventListener("complete", endSplash);
      anim.addEventListener("data_failed", endSplash);
    });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      anim?.destroy();
      document.body.style.overflow = "";
    };
  }, []);

  // Restore a previous sign-up and mount the three.js stage.
  useEffect(() => {
    let cancelled = false;
    let stored: Stored | null = null;
    try { stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch {}
    if (stored && stored.email) {
      // localStorage is only readable after mount; reading it during render would break hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSubmitted(true); setEmail(stored.email); setName(stored.name || ""); setNo(stored.no);
    }

    import("@/lib/waitlistScene")
      .then(m => m.mount(host.current!, opts.current))
      .then(sc => {
        if (cancelled) return sc.destroy();
        scene.current = sc;
        if (stored && stored.email) sc.celebrate(stored.no, true);
      })
      .catch(e => console.error("scene", e));

    return () => {
      cancelled = true;
      scene.current?.destroy();
      scene.current = null;
    };
  }, []);

  useEffect(() => {
    opts.current = { glow, sound };
    scene.current?.setOpts(opts.current);
  }, [glow, sound]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;
    const em = email.trim(), nm = name.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return setError("Enter a valid email address.");
    setPending(true); setError("");
    try {
      // The API saves the email to the mailing list and sends the welcome email.
      const { paddleNo } = await joinWaitlist(em, nm);
      const n = String(paddleNo).padStart(3, "0");
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ email: em, name: nm, no: n })); } catch {}
      setSubmitted(true); setNo(n);
      scene.current?.celebrate(n, false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  };

  const onReset = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setSubmitted(false); setEmail(""); setName(""); setNo(null); setError("");
    scene.current?.reset();
  };

  const greeting = name ? `Thanks, ${name}. ` : "";

  return (
    <div className={styles.root}>
      <div ref={host} className={styles.stage} />

      {splash !== "gone" && (
        <div aria-hidden="true" className={styles.splash} style={{ transform: splash === "out" ? "translateY(-100%)" : "translateY(0)" }}>
          <span className={styles.splashWord}>Carlot</span>
          <div ref={splashEl} className={styles.splashAnim} />
        </div>
      )}

      <header className={styles.header}>
        <a href="#top" className={styles.brand}>
          <span className={styles.mark}>
            <span className={styles.markHandle} />
            <span className={styles.markDot} />
          </span>
          <span className={styles.wordmark}>Carlot</span>
        </a>
        <a href="#join" className={styles.navCta}>
          Join the waitlist<span className={styles.navArrow}>→</span>
        </a>
      </header>

      <main id="top" className={styles.main}>
        <section data-scene="hero" className={styles.hero}>
          <span data-reveal="" data-delay="0" className={styles.badge}>
            <span className={styles.badgeDot} />Waitlist open
          </span>
          <h1 data-reveal="" data-delay="1" className={styles.h1}>
            Your first car is no longer a <Hl>dream.</Hl>
          </h1>
          <p data-reveal="" data-delay="2" className={styles.lead}>
            Trusted cars from the USA, UK and Canada, auctioned at prices you can save for. Shipping and clearing if you want them.
          </p>
          <div data-reveal="" data-delay="3" className={styles.heroActions}>
            <a href="#join" className={styles.heroCta}>
              Join the waitlist<span className={styles.ctaArrowLg}>→</span>
            </a>
            <span className={styles.hint}>Tap the paddle</span>
          </div>
        </section>

        <section data-scene="sourced" className={styles.step}>
          <span data-reveal="" className={styles.eyebrow}>01 · SOURCED</span>
          <h2 data-reveal="" data-delay="1" className={styles.h2}>
            Trusted cars from <Hl>abroad,</Hl> priced for you.
          </h2>
          <p data-reveal="" data-delay="2" className={styles.body}>Every car is inspected overseas before it goes up for auction.</p>
        </section>

        <section data-scene="bid" className={styles.step}>
          <span data-reveal="" className={styles.eyebrow}>02 · BID</span>
          <h2 data-reveal="" data-delay="1" className={styles.h2}>
            Bid what you&apos;ve <Hl>saved.</Hl>
          </h2>
          <p data-reveal="" data-delay="2" className={styles.body}>A refundable ₦100,000 deposit gets you a paddle. Don&apos;t win? It comes straight back to you.</p>
        </section>

        <section data-scene="ship" className={styles.step}>
          <span data-reveal="" className={styles.eyebrow}>03 · DELIVERED</span>
          <h2 data-reveal="" data-delay="1" className={styles.h2}>
            We ship it. We clear it. You <Hl>drive it.</Hl>
          </h2>
          <p data-reveal="" data-delay="2" className={styles.body}>Shipping and clearing are optional. Pay in full or in parts within 48 hours.</p>
        </section>

        <section id="join" data-scene="join" className={styles.join}>
          <span data-reveal="" className={styles.eyebrow}>WAITLIST</span>
          <h2 data-reveal="" data-delay="1" className={`${styles.h2} ${styles.joinTitle}`}>
            Be first in line when <Hl>bidding opens.</Hl>
          </h2>

          <div data-reveal="" data-delay="2" className={styles.card}>
            {!submitted ? (
              <>
                <span className={styles.cardText}>Get early lots, auction dates and updates straight on WhatsApp.</span>
                <WhatsAppButton href={whatsappUrl} />
                <div className={styles.or}>
                  <span className={styles.orLine} />OR<span className={styles.orLine} />
                </div>
                <form onSubmit={onSubmit} className={styles.form}>
                  <div className={styles.field}>
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(""); }}
                      placeholder="Join with your email"
                      aria-label="Email address"
                      autoComplete="email"
                      className={styles.input}
                    />
                    <button type="submit" aria-label="Join with email" disabled={pending} aria-busy={pending} className={styles.submit}>
                      {pending ? "…" : "→"}
                    </button>
                  </div>
                  {error && <span className={styles.error}>{error}</span>}
                </form>
              </>
            ) : (
              <>
                <div className={styles.done}>
                  <div className={styles.doneCol}>
                    <span className={styles.doneEyebrow}>YOU&apos;RE ON THE LIST</span>
                    <span className={styles.doneTitle}>Your paddle is ready.</span>
                  </div>
                  <div className={styles.paddleCol}>
                    <span className={styles.paddleLabel}>Paddle</span>
                    <span className={styles.paddleNo}>{no || ""}</span>
                  </div>
                </div>
                <span className={styles.cardText}>
                  {greeting}We&apos;ll email {email} when bidding opens. Join the WhatsApp group for early lots and updates.
                </span>
                <button type="button" onClick={onReset} className={styles.reset}>Use a different email</button>
                <WhatsAppButton href={whatsappUrl} tall />
              </>
            )}
          </div>

          <div className={styles.footer}>
            <span>© Carlot</span>
            <span>Trusted cars from abroad, for first-time buyers in Nigeria</span>
          </div>
        </section>
      </main>
    </div>
  );
}
