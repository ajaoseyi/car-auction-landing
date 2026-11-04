"use client";
/* eslint-disable @next/next/no-img-element -- fleet photos mix local files and Unsplash URLs, shown at fixed aspect ratios */

import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import type { AnimationItem } from "lottie-web";
import { joinWaitlist } from "@/lib/waitlistApi";
import HeroJourney from "./HeroJourney";
import styles from "./Site.module.css";

type Props = { whatsappUrl?: string; defaultTab?: Tab; showAuctions?: boolean };
type Tab = "vehicles" | "boats";
type SplashPhase = "in" | "out" | "gone";
type Stored = { email: string; name?: string; no?: string };

const STORAGE_KEY = "carlot-waitlist";
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
type RateRow = [string, ...(number | null)[]];
type Item = {
  key: string; src: string; credit?: string; creditHref?: string; tag: string; extra: string; name: string; meta: string;
  badge?: [string, string, string]; rows: RateRow[]; isV?: boolean;
};

const f = (n: number) => "₦" + n.toLocaleString("en-US");
const vRows = (c: number[]): RateRow[] => [["Airport (1–3 hrs)", c[0], c[1], null], ["6 hours", c[2], c[3], null], ["12 hours", c[4], c[5], null], ["24 hours", c[6], c[7], c[8]]];
const bRows = (c: (number | null)[]): RateRow[] => [["2 hours", c[0]], ["3 hours", c[1]], ["4 hours", c[2]], ["Full day (8 hrs)", c[3]]];
const HOT: [string, string, string] = ["HOT", "#FF5A36", "#fff"], NEW: [string, string, string] = ["NEW", "#FFD60A", "#121212"];

const V: Item[] = [
  { key: "prado", src: "/rentals/prado-front.jpeg", tag: "SUV · 7 seats", extra: "Fresh · driver", name: "Toyota Land Cruiser Prado TX-L", meta: "Island, outskirts, interstate", badge: HOT, rows: vRows([120000, 170000, 120000, 170000, 170000, 220000, 270000, 320000, 350000]) },
  { key: "hilux", src: "https://images.unsplash.com/photo-1641333326784-24a9c21d3c4e?w=900&q=70&auto=format&fit=crop", credit: "Photo: Isaac Mitchell / Unsplash", creditHref: "https://unsplash.com/@isaactmitchell", tag: "Pickup · 5 seats", extra: "Fresh · driver", name: "Toyota Hilux", meta: "Island, outskirts, interstate", badge: NEW, rows: vRows([170000, 200000, 220000, 270000, 320000, 370000, 570000, 670000, 700000]) },
  { key: "lc", src: "https://images.unsplash.com/photo-1650530579355-7ad9d4766043?w=900&q=70&auto=format&fit=crop", credit: "Photo: Tim Vegas / Unsplash", creditHref: "https://unsplash.com/@tim_media", tag: "SUV · 7 seats", extra: "Fresh · driver", name: "Toyota Land Cruiser", meta: "Island, outskirts, interstate", rows: vRows([170000, 220000, 200000, 250000, 270000, 320000, 370000, 420000, 450000]) },
].map(x => ({ ...x, isV: true }));

const B: Item[] = [
  { key: "azimut", src: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=900&q=70&auto=format&fit=crop", credit: "Photo: Marcin Ciszewski / Unsplash", creditHref: "https://unsplash.com/@collega", tag: "Yacht · 12 guests", extra: "Captain & crew", name: "Azimut 42 Flybridge", meta: "Lekki Jetty · min. 2 hrs", badge: HOT, rows: bRows([1500000, 2100000, 2600000, 4800000]) },
  { key: "searay", src: "https://images.unsplash.com/photo-1604737637145-48cc31d160eb?w=900&q=70&auto=format&fit=crop", credit: "Photo: Carles Rabada / Unsplash", creditHref: "https://unsplash.com/@carlesrgm", tag: "Speedboat · 8 guests", extra: "Captain included", name: "Sea Ray 280 SLX", meta: "Ikoyi Marina · min. 2 hrs", rows: bRows([350000, 500000, 640000, 1200000]) },
  { key: "princess", src: "https://images.unsplash.com/photo-1562281302-809108fd533c?w=900&q=70&auto=format&fit=crop", credit: "Photo: Eugene Chystiakov / Unsplash", creditHref: "https://unsplash.com/@eugenechystiakov", tag: "Cruiser · 15 guests", extra: "Captain & crew", name: "Princess 52 Cruiser", meta: "Victoria Island · min. 3 hrs", badge: NEW, rows: bRows([null, 2700000, 3400000, 6200000]) },
];

const minOf = (x: Item) => Math.min(...x.rows.flatMap(r => r.slice(1) as (number | null)[]).filter((v): v is number => v != null));

const STEPS = [
  { n: "01", t: "Pick a car or boat", d: "Every car comes with a driver. Every boat comes with a captain.", tag: "Driver or captain", icon: "car", tagIcon: "user-round", dot: "#FFD60A", glow: "rgba(255,214,10,.9)" },
  { n: "02", t: "Choose dates and hours", d: "Book from 1 hour up to 7 days. The price updates as you go.", tag: "1 hr to 7 days", icon: "calendar-clock", tagIcon: "clock", dot: "#BFDBFE", glow: "rgba(96,165,250,.7)" },
  { n: "03", t: "Set your pickup", d: "Island, outskirts or interstate. Boats leave from the jetty.", tag: "Island · Outskirts · Interstate", icon: "map-pin", tagIcon: "route", dot: "#DDD6FE", glow: "rgba(167,139,250,.7)" },
  { n: "04", t: "Pay once. Ride clean.", d: "Pay securely in the app. Your driver or captain messages you before pickup.", tag: "No hidden fees", icon: "credit-card", tagIcon: "badge-check", dot: "#A7F3D0", glow: "rgba(52,211,153,.7)" },
];

function RatesDialog({ sel, onClose }: { sel: Item; onClose: () => void }) {
  const isV = !!sel.isV;
  const incl: [string, string][] = [[isV ? "Driver included" : "Captain included", isV ? "user-round" : "ship"], ["Fuel included", "fuel"], ["No hidden fees", "badge-check"]];
  const grid = isV ? "minmax(0,1.3fr) repeat(3,minmax(0,1fr))" : "minmax(0,1.6fr) minmax(0,1fr)";
  const cols = isV ? ["DURATION", "ISLAND", "OUTSKIRTS", "INTERSTATE"] : ["CHARTER", "PRICE"];
  const note = isV
    ? "Interstate is 24-hour bookings only, with one full tank at departure from Lagos. Extra hours are 15% of the booking rate per hour."
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
                    {v == null ? "—" : f(v) + (isV && i === 2 ? "+" : "")}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <span className={styles.note}>{note}</span>
          <a href="#join" onClick={onClose} className={styles.dialogCta}>
            Get early access<span className={styles.circle44}><Icon name="arrow-right" /></span>
          </a>
        </div>
      </div>
    </div>
  );
}

// ---------- Success screen (after email sign-up or WhatsApp tap) ----------
type Success = "email" | "whatsapp";

const SUCCESS_PICS: [string, string, string, string][] = [
  ["/rentals/prado-front.jpeg", "Toyota Land Cruiser Prado", "rotate(-6deg)", "rgba(255,214,10,.9)"],
  ["https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=400&q=70&auto=format&fit=crop", "Azimut 42 Flybridge", "rotate(4deg)", "rgba(96,165,250,.7)"],
  ["https://images.unsplash.com/photo-1641333326784-24a9c21d3c4e?w=400&q=70&auto=format&fit=crop", "Toyota Hilux", "rotate(-3deg)", "rgba(167,139,250,.7)"],
];

function SuccessScreen({ kind, email, whatsappUrl, needsEmail, onWhatsApp, onClose }: {
  kind: Success; email: string; whatsappUrl: string; needsEmail: boolean; onWhatsApp: () => void; onClose: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const isEmail = kind === "email";

  // Lock page scroll while open, and play the celebration each time the variant changes.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    el.scrollTop = 0;
    document.body.style.overflow = "hidden";
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (!reduced()) {
      const q = (s: string) => [...el.querySelectorAll<HTMLElement>(s)];
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: E.enter });
      q("[data-s=badge]").forEach(n => n.animate([{ transform: "scale(0) rotate(-30deg)" }, { transform: "none" }], { duration: 700, easing: E.pop, delay: 150, fill: "backwards" }));
      q("[data-s=tick]").forEach(n => n.animate([{ transform: "scale(0)" }, { transform: "none" }], { duration: 500, easing: E.pop, delay: 650, fill: "backwards" }));
      q("[data-s=h]").forEach(n => n.animate([{ opacity: 0, transform: "translateY(.4em)" }, { opacity: 1, transform: "none" }], { duration: 650, easing: E.pop, delay: 420, fill: "backwards" }));
      q("[data-s=hl]").forEach(n => n.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 520, easing: E.draw, delay: 950, fill: "backwards" }));
      q("[data-s=up]").forEach((n, i) => n.animate([{ opacity: 0, transform: "translateY(20px)" }, { opacity: 1, transform: "none" }], { duration: 600, easing: E.enter, delay: 320 + i * 120, fill: "backwards" }));
      q("[data-s=pop]").forEach((n, i) => { const r = n.style.transform; n.animate([{ opacity: 0, transform: r + " translateY(30px) scale(.5)" }, { opacity: 1, transform: r }], { duration: 650, easing: E.pop, delay: 800 + i * 110, fill: "backwards" }); });
      const b = q("[data-s=badge]")[0];
      if (b) {
        const r = b.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        [250, 400, 550].forEach(t => timers.push(setTimeout(() => ripple(cx, cy, 140), t)));
        const cols = ["#FFD60A", "#FF5A36", "#60A5FA", "#A78BFA", "#34D399", "#121212"];
        for (let i = 0; i < 46; i++) {
          const c = document.createElement("span"), a = Math.random() * Math.PI * 2, d = 160 + Math.random() * 320, w = 6 + Math.random() * 8;
          c.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:${w}px;height:${w * (Math.random() > 0.5 ? 1 : 2.2)}px;border-radius:${Math.random() > 0.5 ? "50%" : "2px"};background:${cols[i % cols.length]};pointer-events:none;z-index:61`;
          document.body.appendChild(c);
          const dx = Math.cos(a) * d, dy = Math.sin(a) * d * 0.7 - 120;
          c.animate([
            { transform: "translate(-50%,-50%) scale(0)", opacity: 1 },
            { transform: `translate(calc(-50% + ${dx * 0.8}px),calc(-50% + ${dy}px)) rotate(${Math.random() * 360}deg) scale(1)`, opacity: 1, offset: 0.55 },
            { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy + 260}px)) rotate(${Math.random() * 720}deg) scale(.8)`, opacity: 0 },
          ], { duration: 1500 + Math.random() * 700, easing: E.enter, delay: 200 }).onfinish = () => c.remove();
        }
      }
    }
    return () => { timers.forEach(clearTimeout); document.body.style.overflow = ""; };
  }, [kind]);

  return (
    <div ref={root} data-success="" role="dialog" aria-label="Success" className={styles.success}>
      <div aria-hidden="true" className={styles.successGlow} />
      <div className={styles.successTop}>
        <span className={styles.brand}>
          <span className={styles.mark}><span className={styles.markHandle} /><span className={styles.markDot} /></span>
          <span className={styles.wordmark}>Carlot</span>
        </span>
        <button type="button" onClick={onClose} aria-label="Close" className={styles.successClose}><Icon name="x" size={20} /></button>
      </div>
      <div className={styles.successBody}>
        <div data-s="badge" className={styles.successBadge}>
          <Icon name={isEmail ? "mail-check" : "message-circle-heart"} size={54} />
          <span data-s="tick" className={styles.successTick}><Icon name="check" size={20} /></span>
        </div>
        <span data-s="up" className={styles.eyebrow}>{isEmail ? "YOU'RE ON THE LIST" : "YOU'RE IN THE GROUP"}</span>
        <h2 data-s="h" className={styles.successTitle}>
          {isEmail ? "See you on " : "Welcome to the "}
          <span className={styles.hlWrap}>
            <span data-s="hl" className={styles.hl} />
            <span className={styles.hlText}>{isEmail ? "launch day." : "front row."}</span>
          </span>
        </h2>
        <p data-s="up" className={styles.successText}>
          {isEmail
            ? <>We&apos;ll email <span className={styles.successEmail}>{email}</span> when bookings open.</>
            : "Launch rates, new cars and boats, and auction dates land in the group first."}
        </p>
        <div className={styles.successPics}>
          {SUCCESS_PICS.map(([src, alt, rot, glow], i) => (
            <div key={alt} data-s="pop" className={styles.successPic} style={{ marginLeft: i ? -14 : 0, transform: rot, boxShadow: `0 20px 40px -18px ${glow},0 0 0 1px rgba(0,0,0,.05)` }}>
              <img src={src} alt={alt} className={styles.cover} />
            </div>
          ))}
        </div>
        <div data-s="up" className={styles.successActions}>
          {isEmail && (
            <a href={whatsappUrl} target="_blank" rel="noopener" onClick={onWhatsApp} className={styles.successBtnDark}>
              <span className={styles.waIcon}><Icon name="message-circle" size={18} /></span>Join the WhatsApp group too
              <span className={styles.circle44}><Icon name="arrow-up-right" size={18} /></span>
            </a>
          )}
          {needsEmail && (
            <a href="#join" onClick={onClose} className={styles.successBtnDark}>
              <Icon name="mail" size={18} />Get it by email too
              <span className={styles.circle44}><Icon name="arrow-right" size={18} /></span>
            </a>
          )}
          <a href="#rent" onClick={onClose} className={styles.successBtnLight}>
            Browse the fleet<span className={`${styles.circle44} ${styles.circleMist}`}><Icon name="car" size={18} /></span>
          </a>
        </div>
      </div>
      <div className={styles.successFoot}>RIDE CLEAN.</div>
    </div>
  );
}

// ---------- Motion helpers (Web Animations, run after the splash) ----------
type Anim = Animation & { _d?: number };

function ripple(x: number, y: number, size = 30) {
  const r = document.createElement("span");
  r.style.cssText = `position:fixed;left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px;border-radius:50%;border:2px solid #FFD60A;box-sizing:border-box;pointer-events:none;z-index:299`;
  document.body.appendChild(r);
  r.animate([{ transform: "scale(1)", opacity: 1 }, { transform: "scale(2.8)", opacity: 0 }], { duration: 650, easing: E.enter }).onfinish = () => r.remove();
}

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

// Paddle-shaped custom cursor with a yellow ripple on click (fine pointers only).
function setupCursor(): (() => void) | undefined {
  if (!matchMedia("(pointer:fine)").matches || reduced()) return;
  const st = document.createElement("style");
  st.textContent = "html,body,a,button,label,[role=button]{cursor:none!important}input,textarea{cursor:text!important}";
  document.head.appendChild(st);
  const w = document.createElement("div");
  w.setAttribute("aria-hidden", "true");
  w.style.cssText = "position:fixed;left:0;top:0;z-index:300;pointer-events:none;opacity:0;transition:opacity .2s;will-change:transform";
  w.innerHTML = '<div style="position:relative;transition:transform .45s cubic-bezier(.34,1.56,.64,1)"><span style="position:absolute;left:-3.6px;top:3px;width:7.2px;height:22px;border-radius:8px;background:#121212;box-shadow:0 0 0 2px #fff;transform:rotate(38deg);transform-origin:50% 0"></span><span style="position:absolute;left:-15px;top:-15px;width:30px;height:30px;border-radius:50%;background:#121212;box-shadow:0 0 0 2px #fff,0 10px 22px -8px rgba(255,214,10,.9);display:flex;align-items:center;justify-content:center"><span style="width:11px;height:11px;border-radius:50%;background:#FFD60A;transition:transform .45s cubic-bezier(.34,1.56,.64,1)"></span></span></div>';
  document.body.appendChild(w);
  const inner = w.firstChild as HTMLElement, dot = (inner.lastChild as HTMLElement).firstChild as HTMLElement;
  let tx = -100, ty = -100, x = tx, y = ty, rot = 0, hover = false, down = false;
  const paint = () => {
    inner.style.transform = down ? "translateY(-7px) rotate(-16deg) scale(.86)" : hover ? "rotate(-8deg) scale(1.3)" : "none";
    dot.style.transform = hover ? "scale(1.3)" : "none";
  };
  let raf = 0;
  const tick = () => {
    const px = x; x += (tx - x) * 0.32; y += (ty - y) * 0.32;
    rot += (Math.max(-24, Math.min(24, (x - px) * 1.4)) - rot) * 0.14;
    w.style.transform = `translate(${x}px,${y}px) rotate(${rot}deg)`;
    raf = requestAnimationFrame(tick);
  };
  const move = (e: MouseEvent) => {
    tx = e.clientX; ty = e.clientY;
    if (x < -50) { x = tx; y = ty; }
    const t = e.target instanceof Element ? e.target : null;
    w.style.opacity = t && t.closest("input,textarea") ? "0" : "1";
    const h = !!(t && t.closest("a,button,[role=button],label"));
    if (h !== hover) { hover = h; paint(); }
  };
  const dn = () => { down = true; paint(); };
  const up = (e: MouseEvent) => { down = false; paint(); ripple(e.clientX, e.clientY); };
  const out = (e: MouseEvent) => { if (!e.relatedTarget) w.style.opacity = "0"; };
  addEventListener("mousemove", move); addEventListener("mousedown", dn); addEventListener("mouseup", up); document.addEventListener("mouseout", out);
  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    removeEventListener("mousemove", move); removeEventListener("mousedown", dn); removeEventListener("mouseup", up); document.removeEventListener("mouseout", out);
    w.remove(); st.remove();
  };
}

export default function Site({ whatsappUrl = "https://chat.whatsapp.com/", defaultTab = "vehicles", showAuctions = true }: Props) {
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [rateOf, setRateOf] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [splash, setSplash] = useState<SplashPhase>("in");
  const [success, setSuccess] = useState<Success | null>(null);

  const mainEl = useRef<HTMLElement>(null);
  const splashEl = useRef<HTMLDivElement>(null);
  const joinEl = useRef<HTMLDivElement>(null);
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

    const cursorOff = setupCursor();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      anim?.destroy();
      io?.disconnect();
      cursorOff?.();
      document.body.style.overflow = "";
    };
  }, []);

  // Restore a previous sign-up.
  useEffect(() => {
    let stored: Stored | null = null;
    try { stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch {}
    if (stored && stored.email) {
      // localStorage is only readable after mount; reading it during render would break hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSubmitted(true); setEmail(stored.email);
    }
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

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;
    const em = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return setError("Enter a valid email address.");
    setPending(true); setError("");
    try {
      // The API saves the email to the mailing list and sends the welcome email.
      const { paddleNo } = await joinWaitlist(em);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ email: em, no: String(paddleNo).padStart(3, "0") })); } catch {}
      setSubmitted(true);
      setSuccess("email");
      if (!reduced()) requestAnimationFrame(() => {
        const j = joinEl.current;
        if (!j) return;
        j.animate([{ transform: "scale(.94)" }, { transform: "none" }], { duration: 600, easing: E.pop });
        const r = j.getBoundingClientRect();
        [0, 120, 240].forEach(t => setTimeout(() => ripple(r.left + r.width / 2, r.top + 60, 80), t));
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  };

  const onReset = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setSubmitted(false); setEmail(""); setError("");
  };

  const isV = tab === "vehicles";
  const fleet = isV ? V : B;
  const sel = [...V, ...B].find(x => x.key === rateOf);

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
          <a href="#rent" onClick={() => pickTab("boats")} className={styles.navLink}><Icon name="sailboat" />Boats</a>
          <a href="#how" className={styles.navLink}><Icon name="list-ordered" />How it works</a>
          {showAuctions && <a href="#auctions" className={styles.navLink}><Icon name="gavel" />Auctions</a>}
        </nav>
        <a href="#join" className={styles.headerCta}>
          Get early access<span className={styles.headerCtaArrow}><Icon name="arrow-right" /></span>
        </a>
      </header>

      <main id="top" ref={mainEl} className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span data-reveal="" className={styles.pill}><Icon name="map-pin" />Car &amp; boat rentals · Lagos</span>
            <h1 data-reveal="" className={styles.h1}>Book a car or a boat. <Hl>Ride clean.</Hl></h1>
            <p data-reveal="" className={styles.lead}>Fresh cars with a driver. Boats with a captain. Pick your hours, see the price, pay once. No hidden fees.</p>
            <div data-reveal="" className={styles.heroActions}>
              <a href="#rent" onClick={() => pickTab("vehicles")} className={styles.btnDark}>
                Rent a car<span className={styles.circle46}><Icon name="car" /></span>
              </a>
              <a href="#rent" onClick={() => pickTab("boats")} className={styles.btnLight}>
                Charter a boat<span className={`${styles.circle46} ${styles.circleMist}`}><Icon name="sailboat" /></span>
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
              <h2 data-reveal="" className={styles.h2}>On the road or on the <Hl>water.</Hl></h2>
            </div>
            <div data-reveal="" className={styles.tabs}>
              <button type="button" onClick={() => pickTab("vehicles")} className={`${styles.tab} ${isV ? styles.tabOn : ""}`}>
                <Icon name="car" />Vehicles<span className={styles.tabCount}>{V.length}</span>
              </button>
              <button type="button" onClick={() => pickTab("boats")} className={`${styles.tab} ${!isV ? styles.tabOn : ""}`}>
                <Icon name="sailboat" />Boats<span className={styles.tabCount}>{B.length}</span>
              </button>
            </div>
          </div>

          <div className={styles.grid}>
            {fleet.map(x => (
              <article key={x.key} data-card="" className={styles.card}>
                <div className={styles.cardMedia}>
                  <img src={x.src} alt={x.name} loading="lazy" className={styles.cover} />
                  {x.badge && <span className={styles.badge} style={{ background: x.badge[1], color: x.badge[2] }}>{x.badge[0]}</span>}
                  <span className={styles.seats}><Icon name="users" />{x.tag}</span>
                  {x.credit && <a href={x.creditHref} target="_blank" rel="noopener" className={styles.credit}>{x.credit}</a>}
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardTitleCol}>
                    <span className={styles.cardName}>{x.name}</span>
                    <span className={styles.cardMeta}><Icon name="map-pin" />{x.extra} · {x.meta}</span>
                  </div>
                  <div className={styles.cardFoot}>
                    <div className={styles.fromCol}>
                      <span className={styles.fromLabel}>FROM</span>
                      <span className={styles.fromValue}>{f(minOf(x))}</span>
                    </div>
                    <button type="button" onClick={() => openRates(x.key)} className={styles.rateBtn}>
                      Check rates<span className={styles.circle34}><Icon name="arrow-right" /></span>
                    </button>
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
          <span data-reveal="" className={styles.eyebrow}>EARLY ACCESS</span>
          <h2 data-reveal="" className={`${styles.h2} ${styles.joinTitle}`}>Be first to book when we <Hl>launch.</Hl></h2>

          <div data-reveal="" ref={joinEl} className={styles.joinCard}>
            {!submitted ? (
              <>
                <span className={styles.cardText}>Launch rates, new cars and boats, and auction dates, straight on WhatsApp.</span>
                <WhatsAppButton href={whatsappUrl} onClick={() => setSuccess("whatsapp")} />
                <div className={styles.or}><span className={styles.orLine} />OR<span className={styles.orLine} /></div>
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
                      <Icon name={pending ? "loader" : "arrow-right"} />
                    </button>
                  </div>
                  {error && <span className={styles.error}>{error}</span>}
                  <span className={styles.legalNote}>
                    By joining you agree to our <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.
                  </span>
                </form>
              </>
            ) : (
              <>
                <div className={styles.doneCol}>
                  <span className={styles.doneEyebrow}>YOU&apos;RE ON THE LIST</span>
                  <span className={styles.doneTitle}>See you on launch day.</span>
                </div>
                <span className={styles.cardText}>We&apos;ll email {email} when bookings open. Join the WhatsApp group for launch rates and updates.</span>
                <button type="button" onClick={onReset} className={styles.reset}>Use a different email</button>
                <WhatsAppButton href={whatsappUrl} tall />
              </>
            )}
          </div>

          <div className={styles.footer}>
            <span>© Carlot</span>
            <span>Car and boat rentals in Lagos. Car auctions too.</span>
            <nav className={styles.footerNav}>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </nav>
          </div>
        </section>
      </main>

      {sel && <RatesDialog sel={sel} onClose={() => setRateOf(null)} />}
      {success && (
        <SuccessScreen
          kind={success}
          email={email}
          whatsappUrl={whatsappUrl}
          needsEmail={success === "whatsapp" && !submitted}
          onWhatsApp={() => setSuccess("whatsapp")}
          onClose={() => setSuccess(null)}
        />
      )}
    </div>
  );
}
