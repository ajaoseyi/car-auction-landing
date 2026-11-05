"use client";
/* eslint-disable @next/next/no-img-element -- fleet photos mix local files and Unsplash URLs, shown at fixed aspect ratios */

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import type { AnimationItem } from "lottie-web";
import { isRegistered, useAuth } from "@/lib/auth";
import HeroJourney from "./HeroJourney";
import styles from "./Site.module.css";

type Props = { whatsappUrl?: string; defaultTab?: Tab; showAuctions?: boolean };
type Tab = "vehicles" | "boats";
type SplashPhase = "in" | "out" | "gone";
const lucide = (k: string) => `https://unpkg.com/lucide-static@0.460.0/icons/${k}.svg`;

// Brand curves from the launch + rentals films: enter = easeOutCubic, pop = easeOutBack, draw = easeInOutCubic
const E = { enter: "cubic-bezier(.33,1,.68,1)", pop: "cubic-bezier(.34,1.56,.64,1)", draw: "cubic-bezier(.65,0,.35,1)" };
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function Icon({ name, size, className = styles.icon }: { name: string; size?: number; className?: string }) {
  const mask = `url(${lucide(name)}) center/contain no-repeat`;
  const st: CSSProperties = { WebkitMask: mask, mask, ...(size ? { width: size, height: size } : {}) };
  return <span className={className} style={st} />;
}

function Hl({ children }: { children: ReactNode }) {
  return (
    <span className={styles.hlWrap}>
      <span data-hl="" className={styles.hl} />
      <span className={styles.hlText}>{children}</span>
    </span>
  );
}

function WhatsAppButton({ href, tall, onClick }: { href: string; tall?: boolean; onClick?: () => void }) {
  return (
    <a href={href} target="_blank" rel="noopener" onClick={onClick} className={`${styles.waBtn} ${tall ? styles.waBtnTall : ""}`}>
      <span className={styles.waLabel}>
        <span className={styles.waIcon}><Icon name="message-circle" size={18} /></span>
        Join the WhatsApp group
      </span>
      <span className={styles.circle46}><Icon name="arrow-up-right" /></span>
    </a>
  );
}

// ---------- Fleet + rate cards ----------
/** null: not offered; ON_REQUEST: quoted by message, not booked online. */
type RateRow = [string, ...(number | null | typeof ON_REQUEST)[]];
const ON_REQUEST = "On request";
type Item = {
  /** Route to the listing's booking flow: /rentals/[slug]. */
  slug: string;
  key: string; src: string; credit?: string; creditHref?: string; tag: string; extra: string; name: string; meta: string;
  badge?: [string, string, string]; rows: RateRow[]; isV?: boolean;
};

const f = (n: number) => "₦" + n.toLocaleString("en-US");
const vRows = (c: (number | null)[]): RateRow[] => [["Airport (1–3 hrs)", c[0], c[1], null], ["6 hours", c[2], c[3], null], ["12 hours", c[4], c[5], null], ["24 hours", c[6], c[7], c[8] ?? ON_REQUEST]];
// Boats hidden from the landing page for now.
// const bRows = (c: (number | null)[]): RateRow[] => [["2 hours", c[0]], ["3 hours", c[1]], ["4 hours", c[2]], ["Full day (8 hrs)", c[3]]];
const HOT: [string, string, string] = ["HOT", "#FF5A36", "#fff"], NEW: [string, string, string] = ["NEW", "#FFD60A", "#121212"];

const V: Item[] = [
  { slug: "toyota-prado-txl", key: "prado", src: "/rentals/prado-front.jpeg", tag: "SUV · 7 seats", extra: "Fresh · driver", name: "Toyota Land Cruiser Prado TX-L", meta: "Island, outskirts, interstate", badge: HOT, rows: vRows([120000, 170000, 120000, 170000, 170000, 220000, 270000, 320000, 350000]) },
  { slug: "toyota-tacoma", key: "tacoma", src: "/rentals/toyota-tacoma-side.jpeg", tag: "Pickup · 5 seats", extra: "Fresh · driver", name: "Toyota Tacoma", meta: "Island, outskirts, interstate", rows: vRows([170000, 220000, 170000, 220000, 240000, 440000, 580000, 680000, 780000]) },
  { slug: "lexus-gx460", key: "gx460", src: "/rentals/lexus-gx460-front34.jpeg", tag: "SUV · 7 seats", extra: "Fresh · driver", name: "Lexus GX460", meta: "Island, outskirts", badge: NEW, rows: vRows([170000, 230000, 170000, 230000, 230000, 340000, 400000, 460000, null]) },
  { slug: "cadillac-escalade", key: "escalade", src: "/rentals/cadillac-escalade-front.jpeg", tag: "SUV · 7 seats", extra: "Fresh · driver", name: "Cadillac Escalade", meta: "Island, outskirts", badge: NEW, rows: vRows([690000, 790000, 690000, 790000, 920000, 1040000, 1610000, 1840000, null]) },
  { slug: "lexus-lx600", key: "lx600", src: "/lexus-lx600-sm.jpg", tag: "SUV · 7 seats", extra: "Fresh · driver", name: "Lexus LX600", meta: "Island, outskirts", badge: NEW, rows: vRows([790000, 890000, 790000, 890000, 1150000, 1380000, 1840000, 2070000, null]) },
].map(x => ({ ...x, isV: true }));

/* Boats hidden from the landing page for now.
const B: Item[] = [
  { slug: "azimut-42-flybridge", key: "azimut", src: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=900&q=70&auto=format&fit=crop", credit: "Photo: Marcin Ciszewski / Unsplash", creditHref: "https://unsplash.com/@collega", tag: "Yacht · 12 guests", extra: "Captain & crew", name: "Azimut 42 Flybridge", meta: "Lekki Jetty · min. 2 hrs", badge: HOT, rows: bRows([1500000, 2100000, 2600000, 4800000]) },
  { slug: "sea-ray-280-slx", key: "searay", src: "https://images.unsplash.com/photo-1604737637145-48cc31d160eb?w=900&q=70&auto=format&fit=crop", credit: "Photo: Carles Rabada / Unsplash", creditHref: "https://unsplash.com/@carlesrgm", tag: "Speedboat · 8 guests", extra: "Captain included", name: "Sea Ray 280 SLX", meta: "Ikoyi Marina · min. 2 hrs", rows: bRows([350000, 500000, 640000, 1200000]) },
  { slug: "princess-52-cruiser", key: "princess", src: "https://images.unsplash.com/photo-1562281302-809108fd533c?w=900&q=70&auto=format&fit=crop", credit: "Photo: Eugene Chystiakov / Unsplash", creditHref: "https://unsplash.com/@eugenechystiakov", tag: "Cruiser · 15 guests", extra: "Captain & crew", name: "Princess 52 Cruiser", meta: "Victoria Island · min. 3 hrs", badge: NEW, rows: bRows([null, 2700000, 3400000, 6200000]) },
];
*/

const minOf = (x: Item) => Math.min(...x.rows.flatMap(r => r.slice(1)).filter((v): v is number => typeof v === "number"));

const STEPS = [
  // { n: "01", t: "Pick a car or boat", d: "Every car comes with a driver. Every boat comes with a captain.", tag: "Driver or captain", icon: "car", tagIcon: "user-round", dot: "#FFD60A", glow: "rgba(255,214,10,.9)" },
  { n: "01", t: "Pick a car", d: "Every car comes with a driver.", tag: "Driver included", icon: "car", tagIcon: "user-round", dot: "#FFD60A", glow: "rgba(255,214,10,.9)" },
  { n: "02", t: "Choose dates and hours", d: "Book from 1 hour up to 7 days. The price updates as you go.", tag: "1 hr to 7 days", icon: "calendar-clock", tagIcon: "clock", dot: "#BFDBFE", glow: "rgba(96,165,250,.7)" },
  // { n: "03", t: "Set your pickup", d: "Island, outskirts or interstate. Boats leave from the jetty.", tag: "Island · Outskirts · Interstate", icon: "map-pin", tagIcon: "route", dot: "#DDD6FE", glow: "rgba(167,139,250,.7)" },
  { n: "03", t: "Set your pickup", d: "Island, outskirts or interstate.", tag: "Island · Outskirts · Interstate", icon: "map-pin", tagIcon: "route", dot: "#DDD6FE", glow: "rgba(167,139,250,.7)" },
  // d: "Pay securely with Paystack. Your driver or captain messages you before pickup."
  { n: "04", t: "Pay once. Ride clean.", d: "Pay securely with Paystack. Your driver messages you before pickup.", tag: "No hidden fees", icon: "credit-card", tagIcon: "badge-check", dot: "#A7F3D0", glow: "rgba(52,211,153,.7)" },
];

function RatesDialog({ sel, onClose }: { sel: Item; onClose: () => void }) {
  const isV = !!sel.isV;
  const incl: [string, string][] = [[isV ? "Driver included" : "Captain included", isV ? "user-round" : "ship"], ["Fuel included", "fuel"], ["No hidden fees", "badge-check"]];
  const grid = isV ? "minmax(0,1.3fr) repeat(3,minmax(0,1fr))" : "minmax(0,1.6fr) minmax(0,1fr)";
  const cols = isV ? ["DURATION", "ISLAND", "OUTSKIRTS", "INTERSTATE"] : ["CHARTER", "PRICE"];
  const onRequest = sel.rows.some(r => r.includes(ON_REQUEST));
  const note = isV
    ? onRequest
      ? "Interstate trips are quoted on request. Extra hours are 15% of the booking rate per hour."
      : "Interstate is 24-hour bookings only, with one full tank at departure from Lagos. Extra hours are 15% of the booking rate per hour."
    : "Fuel, captain and life jackets included. Departure times are confirmed by your captain after booking.";
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div role="dialog" aria-label="Rates" className={styles.dialog} onClick={e => e.stopPropagation()}>
        <div className={styles.dialogMedia}>
          <img src={sel.src} alt={sel.name} className={styles.cover} />
          <button type="button" onClick={onClose} aria-label="Close" className={styles.close}><Icon name="x" /></button>
        </div>
        <div className={styles.dialogBody}>
          <div className={styles.cardTitleCol}>
            <span className={styles.dialogKind}>{isV ? "CHAUFFEURED · RATES" : "PER CHARTER · RATES"}</span>
            <span className={styles.dialogName}>{sel.name}</span>
          </div>
          <div className={styles.inclRow}>
            {incl.map(([t, k]) => <span key={t} className={styles.incl}><Icon name={k} size={14} />{t}</span>)}
          </div>
          <div className={styles.table}>
            <div className={styles.tableHead} style={{ gridTemplateColumns: grid }}>
              {cols.map((t, i) => <span key={t} style={{ textAlign: i ? "right" : "left" }}>{t}</span>)}
            </div>
            {sel.rows.map(([label, ...cells]) => (
              <div key={label} className={styles.tableRow} style={{ gridTemplateColumns: grid }}>
                <span className={styles.rowLabel}>{label}</span>
                {cells.map((v, i) => (
                  <span key={i} className={styles.cell} style={{ color: v == null ? "#C9C8C2" : "#121212" }}>
                    {v == null ? "—" : v === ON_REQUEST ? v : f(v) + (isV && i === 2 ? "+" : "")}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <span className={styles.note}>{note}</span>
          <Link href={`/rentals/${sel.slug}`} className={styles.dialogCta}>
            {isV ? "Book this car" : "Book this boat"}<span className={styles.circle44}><Icon name="arrow-right" /></span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ---------- Motion helpers (Web Animations, run after the splash) ----------
type Anim = Animation & { _d?: number };

function revealAll(root: HTMLElement): IntersectionObserver {
  const groups = new Map<Element, Anim[]>();
  const add = (trig: Element, el: Element, kf: Keyframe[], o: KeyframeAnimationOptions) => {
    const a = el.animate(kf, { fill: "backwards", ...o }) as Anim;
    a.pause();
    a._d = (o.delay as number) || 0;
    if (!groups.has(trig)) groups.set(trig, []);
    groups.get(trig)!.push(a);
  };
  root.querySelectorAll("h1,h2").forEach(h => {
    // Split heading text into word spans so each word can pop in.
    const words: HTMLSpanElement[] = [];
    const walk = (n: Node) => [...n.childNodes].forEach(c => {
      if (c.nodeType === 3 && c.textContent?.trim()) {
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
          const s = document.createElement("span");
          s.style.cssText = "display:inline-block;transform-origin:50% 100%";
          s.textContent = p;
          words.push(s);
          frag.appendChild(s);
        });
        (c as ChildNode).replaceWith(frag);
      } else if (c.nodeType === 1 && !(c as Element).hasAttribute("data-hl")) walk(c);
    });
    walk(h);
    words.forEach((w, i) => {
      const dir = i % 2 ? 1 : -1;
      add(h, w, [{ opacity: 0, transform: `translateY(1.1em) rotate(${14 * dir}deg)` }, { opacity: 1, transform: "none" }], { duration: 650, easing: E.pop, delay: i * 70 });
    });
    h.querySelectorAll("[data-hl]").forEach((hl, j) => add(h, hl, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 520, easing: E.draw, delay: 500 + words.length * 40 + j * 100 }));
  });
  root.querySelectorAll("[data-reveal]").forEach(el => {
    if (!el.matches("h1,h2")) add(el, el, [{ opacity: 0, transform: "translateY(28px)" }, { opacity: 1, transform: "none" }], { duration: 700, easing: E.enter });
  });
  root.querySelectorAll("[data-card]").forEach(el => add(el, el, [{ opacity: 0, transform: "translateY(40px) scale(.96)" }, { opacity: 1, transform: "none" }], { duration: 600, easing: E.pop }));
  const io = new IntersectionObserver(es => es.filter(e => e.isIntersecting).forEach((e, bi) => {
    (groups.get(e.target) || []).forEach(a => { a.effect?.updateTiming({ delay: (a._d || 0) + bi * 90 }); a.play(); });
    io.unobserve(e.target);
  }), { threshold: 0.15 });
  groups.forEach((_, t) => io.observe(t));
  return io;
}

export default function Site({ whatsappUrl = "https://chat.whatsapp.com/", defaultTab = "vehicles", showAuctions = true }: Props) {
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [rateOf, setRateOf] = useState<string | null>(null);
  const [splash, setSplash] = useState<SplashPhase>("in");
  // Cards follow the Dec 2026 rate card; each one opens the booking flow, which prices from the API.
  const fleetV = V;
  // const fleetB = B;
  const fleetB: Item[] = []; // Boats hidden from the landing page for now.
  const { user } = useAuth();
  const signedIn = isRegistered(user);

  const mainEl = useRef<HTMLElement>(null);
  const splashEl = useRef<HTMLDivElement>(null);
  const revealed = useRef(false);

  // Splash: Lottie logo reveal, then the yellow curtain slides up and the page reveal starts.
  useEffect(() => {
    let phase: SplashPhase = "in";
    let anim: AnimationItem | null = null;
    let cancelled = false;
    let io: IntersectionObserver | null = null;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const endSplash = () => {
      if (phase !== "in") return;
      phase = "out";
      document.body.style.overflow = "";
      timers.push(setTimeout(() => {
        setSplash("out");
        if (!reduced() && mainEl.current) { io = revealAll(mainEl.current); revealed.current = true; }
      }, 250));
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
      io?.disconnect();
      document.body.style.overflow = "";
    };
  }, []);

  const pickTab = useCallback((t: Tab) => {
    setTab(t);
    if (!revealed.current || reduced()) return;
    requestAnimationFrame(() => document.querySelectorAll("[data-card]").forEach((el, i) =>
      el.animate([{ opacity: 0, transform: "translateY(40px) scale(.96)" }, { opacity: 1, transform: "none" }], { duration: 600, easing: E.pop, delay: i * 70, fill: "backwards" })));
  }, []);

  const openRates = (key: string) => {
    setRateOf(key);
    if (reduced()) return;
    requestAnimationFrame(() => {
      const d = document.querySelector("[role=dialog]");
      if (!d) return;
      d.parentElement?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: E.enter });
      d.animate([{ opacity: 0, transform: "translateY(40px) scale(.92)" }, { opacity: 1, transform: "none" }], { duration: 520, easing: E.pop });
    });
  };

  const isV = tab === "vehicles";
  const fleet = isV ? fleetV : fleetB;
  const sel = [...fleetV, ...fleetB].find(x => x.key === rateOf);

  return (
    <div className={styles.root}>
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
        <nav className={styles.nav}>
          <a href="#rent" onClick={() => pickTab("vehicles")} className={styles.navLink}><Icon name="car" />Cars</a>
          {/* <a href="#rent" onClick={() => pickTab("boats")} className={styles.navLink}><Icon name="sailboat" />Boats</a> */}
          <a href="#how" className={styles.navLink}><Icon name="list-ordered" />How it works</a>
          {showAuctions && <a href="#auctions" className={styles.navLink}><Icon name="gavel" />Auctions</a>}
        </nav>
        {signedIn ? (
          <Link href="/bookings" className={styles.headerCta}>
            My bookings<span className={styles.headerCtaArrow}><Icon name="calendar-check" /></span>
          </Link>
        ) : (
          <a href="#rent" className={styles.headerCta}>
            Book now<span className={styles.headerCtaArrow}><Icon name="arrow-right" /></span>
          </a>
        )}
      </header>

      <main id="top" ref={mainEl} className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            {/* <span data-reveal="" className={styles.pill}><Icon name="map-pin" />Car &amp; boat rentals · Lagos</span> */}
            <span data-reveal="" className={styles.pill}><Icon name="map-pin" />Car rentals · Lagos</span>
            {/* <h1 data-reveal="" className={styles.h1}>Book a car or a boat. <Hl>Ride clean.</Hl></h1> */}
            <h1 data-reveal="" className={styles.h1}>Book a car. <Hl>Ride clean.</Hl></h1>
            {/* <p data-reveal="" className={styles.lead}>Fresh cars with a driver. Boats with a captain. Pick your hours, see the price, pay once. No hidden fees.</p> */}
            <p data-reveal="" className={styles.lead}>Fresh cars with a driver. Pick your hours, see the price, pay once. No hidden fees.</p>
            <div data-reveal="" className={styles.heroActions}>
              <a href="#rent" onClick={() => pickTab("vehicles")} className={styles.btnDark}>
                Rent a car<span className={styles.circle46}><Icon name="car" /></span>
              </a>
            </div>
          </div>
          <div data-reveal="" className={styles.heroVisual}>
            <HeroJourney height={640} />
          </div>
        </section>

        <section id="rent" className={`${styles.section} ${styles.rent}`}>
          <div className={styles.sectionHead}>
            <div className={styles.headCol}>
              <span data-reveal="" className={styles.eyebrow}>01 · THE FLEET</span>
              {/* <h2 data-reveal="" className={styles.h2}>On the road or on the <Hl>water.</Hl></h2> */}
              <h2 data-reveal="" className={styles.h2}>Ready for the <Hl>road.</Hl></h2>
            </div>
            <div data-reveal="" className={styles.tabs}>
              <button type="button" onClick={() => pickTab("vehicles")} className={`${styles.tab} ${isV ? styles.tabOn : ""}`}>
                <Icon name="car" />Vehicles<span className={styles.tabCount}>{fleetV.length}</span>
              </button>
              {/* <button type="button" onClick={() => pickTab("boats")} className={`${styles.tab} ${!isV ? styles.tabOn : ""}`}>
                <Icon name="sailboat" />Boats<span className={styles.tabCount}>{fleetB.length}</span>
              </button> */}
            </div>
          </div>

          <div className={styles.grid}>
            {fleet.map(x => (
              <article key={x.key} data-card="" className={styles.card}>
                <div className={styles.cardMedia}>
                  <Link href={`/rentals/${x.slug}`} aria-label={`Book the ${x.name}`} className={styles.cardMediaLink}>
                    <img src={x.src} alt={x.name} loading="lazy" className={styles.cover} />
                  </Link>
                  {x.badge && <span className={styles.badge} style={{ background: x.badge[1], color: x.badge[2] }}>{x.badge[0]}</span>}
                  <span className={styles.seats}><Icon name="users" />{x.tag}</span>
                  {x.credit && <a href={x.creditHref} target="_blank" rel="noopener" className={styles.credit}>{x.credit}</a>}
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardTitleCol}>
                    <Link href={`/rentals/${x.slug}`} className={styles.cardName}>{x.name}</Link>
                    <span className={styles.cardMeta}><Icon name="map-pin" />{x.extra} · {x.meta}</span>
                  </div>
                  <div className={styles.cardFoot}>
                    <div className={styles.fromCol}>
                      <span className={styles.fromLabel}>FROM</span>
                      <span className={styles.fromValue}>{f(minOf(x))}</span>
                      <button type="button" onClick={() => openRates(x.key)} className={styles.ratesLink}>See all rates</button>
                    </div>
                    <Link href={`/rentals/${x.slug}`} className={styles.rateBtn}>
                      Book now<span className={styles.circle34}><Icon name="arrow-right" /></span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="how" className={`${styles.section} ${styles.how}`}>
          <div className={styles.headCol}>
            <span data-reveal="" className={styles.eyebrow}>02 · HOW IT WORKS</span>
            <h2 data-reveal="" className={styles.h2}>Booked in <Hl>four taps.</Hl></h2>
          </div>
          <ol className={styles.steps}>
            {STEPS.map(st => (
              <li key={st.n} data-reveal="" className={styles.stepRow}>
                <span className={styles.stepDot} style={{ background: st.dot, boxShadow: `0 18px 34px -18px ${st.glow}` }}>
                  <Icon name={st.icon} className={styles.stepDotIcon} />
                </span>
                <div className={styles.stepContent}>
                  <span className={styles.stepTitleCol}>
                    <span className={styles.eyebrow}>STEP {st.n}</span>
                    <span className={styles.stepTitle}>{st.t}</span>
                  </span>
                  <span className={styles.stepDesc}>{st.d}</span>
                  <span className={styles.stepTag}><Icon name={st.tagIcon} size={14} />{st.tag}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {showAuctions && (
          <section id="auctions" className={styles.auctions}>
            <div className={styles.auctionCopy}>
              <span data-reveal="" className={`${styles.eyebrow} ${styles.auctionEyebrow}`}><Icon name="gavel" size={15} />ALSO ON CARLOT · AUCTIONS</span>
              <h2 data-reveal="" className={styles.h2Small}>Ready to own? Bid what you&apos;ve saved.</h2>
              <p data-reveal="" className={styles.auctionText}>Trusted cars from the USA, UK and Canada, inspected overseas and auctioned at prices you can save for. A refundable ₦100,000 deposit gets you a paddle. Shipping and clearing if you want them.</p>
            </div>
            <div data-reveal="" className={styles.auctionCars}>
              <div className={styles.auctionCar}>
                <div className={styles.auctionImg} style={{ boxShadow: "0 24px 50px -30px rgba(255,214,10,.9)" }}>
                  <img src="/lexus-lx600-sm.jpg" alt="Lexus LX 600" loading="lazy" className={styles.cover} />
                </div>
                <span className={styles.auctionName}>Lexus LX 600</span>
              </div>
              <div className={`${styles.auctionCar} ${styles.auctionCarOffset}`}>
                <div className={styles.auctionImg} style={{ boxShadow: "0 24px 50px -30px rgba(96,165,250,.8)" }}>
                  <img src="/mercedes-g63-sm.jpg" alt="Mercedes-AMG G 63" loading="lazy" className={styles.cover} />
                </div>
                <span className={styles.auctionName}>Mercedes-AMG G 63</span>
              </div>
            </div>
          </section>
        )}

        <section id="join" className={styles.join}>
          <span data-reveal="" className={styles.eyebrow}>READY WHEN YOU ARE</span>
          <h2 data-reveal="" className={`${styles.h2} ${styles.joinTitle}`}>Your ride is a few taps <Hl>away.</Hl></h2>

          <div data-reveal="" className={styles.joinCard}>
            {/* <span className={styles.cardText}>Pick a car with a driver or a boat with a captain, choose your hours and pay securely with Paystack.</span> */}
            <span className={styles.cardText}>Pick a car with a driver, choose your hours and pay securely with Paystack.</span>
            <div className={styles.joinActions}>
              <a href="#rent" onClick={() => pickTab("vehicles")} className={styles.btnDark}>
                Rent a car<span className={styles.circle46}><Icon name="car" /></span>
              </a>
            </div>
            {signedIn && <Link href="/bookings" className={styles.reset}>View my bookings</Link>}
            <div className={styles.or}><span className={styles.orLine} />UPDATES<span className={styles.orLine} /></div>
            {/* <span className={styles.cardText}>New cars and boats, launch rates and auction dates land in the WhatsApp group first.</span> */}
            <span className={styles.cardText}>New cars, launch rates and auction dates land in the WhatsApp group first.</span>
            <WhatsAppButton href={whatsappUrl} />
          </div>

          <div className={styles.footer}>
            <span>© Carlot</span>
            {/* <span>Car and boat rentals in Lagos. Car auctions too.</span> */}
            <span>Car rentals in Lagos. Car auctions too.</span>
            <nav className={styles.footerNav}>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </nav>
          </div>
        </section>
      </main>

      {sel && <RatesDialog sel={sel} onClose={() => setRateOf(null)} />}
    </div>
  );
}
