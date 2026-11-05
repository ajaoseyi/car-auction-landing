/* eslint-disable @next/next/no-img-element -- phone mock photos are decorative and animated per frame */
// Phone screens from the Carlot Rentals film, reused by the website hero journey.
// Every screen is a pure function of the timeline position T (seconds) and the cue map C.
import type { CSSProperties, ReactNode } from "react";

export type Cues = { Browse: number; Prado: number; Dates: number; Book: number; Booked: number; Outro: number };
export type ScreenProps = { T: number; C: Cues };

const INK = "#121212", YEL = "#FFD60A", CORAL = "#FF5A36", SLATE = "#6B6A65", ASH = "#9A9993", MIST = "#F5F4F0", PALE = "#FFF6C2";
const DISPLAY = "'Bricolage Grotesque', system-ui, sans-serif", NUM = "'Clash Grotesk', 'Bricolage Grotesque', sans-serif";

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const Easing = {
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInCubic: (t: number) => t * t * t,
  easeInOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  easeOutBack: (t: number) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};
const MOTION = {
  enter: (T: number, s: number, d = 0.7) => Easing.easeOutCubic(clamp((T - s) / d, 0, 1)),
  pop: (T: number, s: number, d = 0.6) => Easing.easeOutBack(clamp((T - s) / d, 0, 1)),
  draw: (T: number, s: number, d = 0.8) => Easing.easeInOutCubic(clamp((T - s) / d, 0, 1)),
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const fmt = (n: number) => "₦" + Math.round(n).toLocaleString("en-US");
const press = (T: number, at: number) => 1 - 0.05 * (MOTION.enter(T, at - 0.08, 0.08) - MOTION.enter(T, at + 0.05, 0.25));
const img = (name: string) => `/rentals/${name}.jpeg`;

// ---------- Phone kit ----------
export function StatusBar() {
  return (
    <div style={{ height: 50, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 30px 0", font: `600 15px ${DISPLAY}`, color: INK }}>
      <span>9:41</span>
      <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <span style={{ width: 16, height: 10, borderRadius: 2, background: INK }} />
        <span style={{ width: 24, height: 11, borderRadius: 3, border: `1.5px solid ${INK}`, boxSizing: "border-box", padding: 1 }}>
          <span style={{ display: "block", width: "70%", height: "100%", background: INK, borderRadius: 1 }} />
        </span>
      </span>
    </div>
  );
}
const Label = ({ children, color = ASH }: { children: ReactNode; color?: string }) => <span style={{ font: `500 11px ${NUM}`, color, letterSpacing: ".06em" }}>{children}</span>;
const Photo = ({ src, style, pos = "50% 60%", zoom = 1 }: { src: string; style?: CSSProperties; pos?: string; zoom?: number }) => (
  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, display: "block", transform: `scale(${zoom})`, ...style }} />
);
const Slant = ({ t, bg, fg, style }: { t: string; bg: string; fg: string; style?: CSSProperties }) => (
  <span style={{ position: "absolute", transform: "rotate(8deg)", font: `700 12px ${NUM}`, letterSpacing: ".08em", background: bg, color: fg, padding: "6px 12px", borderRadius: 999, boxShadow: `0 8px 18px -6px ${bg === CORAL ? "rgba(255,90,54,.7)" : "rgba(200,160,0,.8)"}`, ...style }}>{t}</span>
);
function Tap({ T, at, x, y }: { T: number; at: number; x: number; y: number }) {
  const p = clamp((T - at) / 0.6, 0, 1);
  if (T < at - 0.25 || p >= 1) return null;
  const pre = MOTION.enter(T, at - 0.25, 0.25);
  return (
    <div style={{ position: "absolute", left: x, top: y, pointerEvents: "none", zIndex: 40 }}>
      <div style={{ position: "absolute", left: -22, top: -22, width: 44, height: 44, borderRadius: "50%", background: "rgba(18,18,18,.18)", transform: `scale(${pre * (1 - p * 0.3)})`, opacity: 1 - p }} />
      <div style={{ position: "absolute", left: -22, top: -22, width: 44, height: 44, borderRadius: "50%", border: `2px solid ${YEL}`, transform: `scale(${1 + p * 1.6})`, opacity: (1 - p) * (T > at ? 1 : 0) }} />
    </div>
  );
}
const Arrow = ({ size = 46 }: { size?: number }) => (
  <span style={{ flex: "none", width: size, height: size, borderRadius: "50%", background: YEL, color: INK, display: "flex", alignItems: "center", justifyContent: "center", font: `600 18px ${NUM}` }}>→</span>
);
function BlackCta({ label, sub, scale = 1, center }: { label: string; sub?: string; scale?: number; center?: boolean }) {
  return (
    <div style={{ position: "relative", height: 58, borderRadius: 999, background: INK, color: "#fff", display: "flex", alignItems: "center", justifyContent: center ? "center" : "space-between", padding: "0 6px 0 22px", boxShadow: "0 14px 30px -10px rgba(0,0,0,.45)", transform: `scale(${scale})`, boxSizing: "border-box" }}>
      <span style={{ display: "flex", flexDirection: "column", alignItems: center ? "center" : "flex-start" }}>
        <span style={{ font: `600 16px ${DISPLAY}` }}>{label}</span>
        {sub && <span style={{ font: `400 11px ${NUM}`, color: "#A9A8A2" }}>{sub}</span>}
      </span>
      <span style={center ? { position: "absolute", right: 6, top: 6 } : {}}><Arrow /></span>
    </div>
  );
}
const Back = () => (
  <span style={{ flex: "none", width: 44, height: 44, borderRadius: "50%", background: "#fff", boxShadow: "0 6px 18px -6px rgba(0,0,0,.2),0 0 0 1px rgba(0,0,0,.04)", display: "flex", alignItems: "center", justifyContent: "center", font: `500 18px ${NUM}` }}>←</span>
);
const CalIcon = ({ s = 18, c = INK }: { s?: number; c?: string }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M4 10h16M9 3v4M15 3v4" /></svg>
);
const Row = ({ k, v }: { k: string; v: string }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
    <span style={{ font: `400 14px ${DISPLAY}`, color: SLATE }}>{k}</span>
    <span style={{ font: `600 14px ${NUM}`, textAlign: "right" }}>{v}</span>
  </div>
);
const BottomBar = ({ children }: { children: ReactNode }) => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "16px 20px 30px", background: "#fff", boxShadow: "0 -20px 40px -20px rgba(0,0,0,.18)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, zIndex: 5 }}>{children}</div>
);

function TabBar() {
  const ic = (d: ReactNode, on?: boolean) => (
    <span style={{ width: 52, height: 52, borderRadius: "50%", background: on ? YEL : "#2A2A28", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={on ? INK : "#fff"} strokeWidth="2" strokeLinecap="round">{d}</svg>
    </span>
  );
  return (
    <div style={{ position: "absolute", left: "50%", bottom: 26, transform: "translateX(-50%)", display: "flex", gap: 6, padding: 6, borderRadius: 999, background: INK, boxShadow: "0 20px 40px -12px rgba(0,0,0,.5)", zIndex: 6 }}>
      {ic(<><rect x="4" y="4" width="7" height="7" rx="2" /><rect x="13" y="4" width="7" height="7" rx="2" /><rect x="4" y="13" width="7" height="7" rx="2" /><rect x="13" y="13" width="7" height="7" rx="2" /></>)}
      {ic(<><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></>)}
      {ic(<><circle cx="8" cy="15" r="4" /><path d="M11 12l8-8M16 7l2 2M14 9l2 2" /></>, true)}
      {ic(<><circle cx="12" cy="9" r="4" /><path d="M4 20c1.5-4 4.5-5 8-5s6.5 1 8 5" /></>)}
    </div>
  );
}

// ---------- Screens ----------
type Card = { img: string; tag: string; name: string; credit?: string; badge?: [string, string, string] };

export function RentalsScreen({ T, C }: ScreenProps) {
  const t0 = C.Browse;
  const scroll = MOTION.draw(T, t0 + 1.9, 1.0) * 230 - MOTION.draw(T, t0 + 3.2, 0.9) * 230;
  const glow = MOTION.enter(T, t0 + 3.9, 0.4);
  const cards: Card[] = [
    { img: img("prado-front"), tag: "SUV · 7 seats", name: "Toyota Land Cruiser Prado TX-L", badge: ["HOT", CORAL, "#fff"] },
    { img: img("toyota-tacoma-side"), tag: "Pickup · 5 seats", name: "Toyota Tacoma", badge: ["NEW", YEL, INK] },
    { credit: "Tim Vegas", img: "https://images.unsplash.com/photo-1650530579355-7ad9d4766043?w=900&q=70&auto=format&fit=crop", tag: "SUV · 7 seats", name: "Toyota Land Cruiser" },
  ];
  return (
    <div style={{ position: "relative", height: 794 }}>
      <div style={{ position: "absolute", left: 24, right: 24, top: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ font: `600 32px/1 ${DISPLAY}`, letterSpacing: "-.03em" }}>Rentals</span>
        <span style={{ width: 44, height: 44, borderRadius: "50%", background: "#fff", boxShadow: "0 6px 18px -6px rgba(0,0,0,.2),0 0 0 1px rgba(0,0,0,.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="2"><circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" /></svg>
        </span>
      </div>
      <div style={{ position: "absolute", left: 24, right: 24, top: 66, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, padding: 4, borderRadius: 999, background: "#F4F3EF" }}>
        <span style={{ height: 44, borderRadius: 999, background: "#fff", boxShadow: "0 6px 14px -8px rgba(0,0,0,.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, font: `600 14px ${DISPLAY}` }}>Vehicles<span style={{ font: `500 11px ${NUM}`, color: SLATE }}>3</span></span>
        <span style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, font: `600 14px ${DISPLAY}` }}>Boats<span style={{ font: `500 11px ${NUM}`, color: SLATE }}>3</span></span>
      </div>
      <div style={{ position: "absolute", left: 24, right: 24, top: 138, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ font: `600 18px ${DISPLAY}` }}>Fresh for every ride</span>
        <span style={{ font: `500 12px ${NUM}`, color: SLATE }}>Fresh · driver</span>
      </div>
      <div style={{ position: "absolute", left: 16, right: 16, top: 170, bottom: 0, overflow: "hidden", padding: "6px 8px 0" }}>
        <div style={{ position: "relative", transform: `translateY(${-scroll}px)` }}>
          {cards.map((c, i) => (
            <div key={i} style={{ position: "absolute", left: 0, right: 0, top: i * 326, height: 308, borderRadius: 28, background: "#fff", padding: 8, boxSizing: "border-box", transform: i === 0 ? `scale(${press(T, t0 + 4.4)})` : "none", boxShadow: i === 0 ? `0 18px 40px -20px rgba(0,0,0,.35),0 0 0 ${2 * glow}px ${INK},0 30px 50px -24px rgba(255,214,10,${0.8 * glow})` : "0 18px 40px -20px rgba(0,0,0,.35),0 0 0 1px rgba(0,0,0,.04)" }}>
              <div style={{ height: 190, borderRadius: 22, overflow: "hidden", position: "relative", background: MIST }}>
                <Photo src={c.img} zoom={1.04 + 0.04 * Math.sin(T * 0.6)} />
                {c.credit && <span style={{ position: "absolute", right: 10, bottom: 10, font: `500 9px ${NUM}`, color: "#fff", background: "rgba(0,0,0,.45)", padding: "3px 6px", borderRadius: 6 }}>Photo: {c.credit} / Unsplash</span>}
                <span style={{ position: "absolute", top: 12, left: 12, font: `500 11px ${NUM}`, background: "#fff", padding: "5px 9px", borderRadius: 999 }}>{c.tag}</span>
                {c.badge && <Slant t={c.badge[0]} bg={c.badge[1]} fg={c.badge[2]} style={{ top: 14, right: 10 }} />}
                <span style={{ position: "absolute", bottom: 12, left: 12, font: `700 12px ${NUM}`, background: INK, color: "#fff", padding: "7px 11px", borderRadius: 999 }}>Chauffeur + fuel</span>
              </div>
              <div style={{ padding: "14px 10px 0", display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ font: `600 16px ${DISPLAY}`, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 250 }}>{c.name}</span>
                <span style={{ font: `400 11px ${NUM}`, color: SLATE }}>Island &amp; outskirts · Interstate</span>
                <span style={{ alignSelf: "flex-start", marginTop: 6, height: 34, padding: "0 14px", borderRadius: 999, background: INK, color: "#fff", font: `600 13px ${DISPLAY}`, display: "flex", alignItems: "center", gap: 8 }}>Check rates<span style={{ width: 6, height: 6, borderRadius: "50%", background: YEL }} /></span>
              </div>
              <span style={{ position: "absolute", right: 18, bottom: 16, width: 46, height: 46, borderRadius: "50%", background: YEL, display: "flex", alignItems: "center", justifyContent: "center", font: `600 18px ${NUM}` }}>↗</span>
            </div>
          ))}
        </div>
      </div>
      <TabBar />
      <Tap T={T} at={t0 + 4.4} x={325} y={445} />
    </div>
  );
}

export function PradoScreen({ T, C }: ScreenProps) {
  const t0 = C.Prado;
  const shots = ["prado-front", "prado-side", "prado-rear34"];
  const idx = T < t0 + 1.8 ? 0 : T < t0 + 3.2 ? 1 : 2;
  const perks = ["Cleaned before every trip", "Driver included", "Full tank, no extra", "1 free stop"];
  return (
    <div style={{ position: "relative", height: 794 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: -50, height: 390, overflow: "hidden", background: INK }}>
        {shots.map((s, i) => {
          const a = i === 0 ? 1 : MOTION.enter(T, t0 + (i === 1 ? 1.8 : 3.2) - 0.25, 0.4);
          return <div key={s} style={{ position: "absolute", inset: 0, opacity: a }}><Photo src={img(s)} pos="50% 55%" zoom={1.12 - 0.08 * MOTION.enter(T, t0 + i * 1.4, 3)} /></div>;
        })}
        <div style={{ position: "absolute", left: 20, right: 20, top: 108, display: "flex", justifyContent: "space-between" }}>
          <Back />
          <span style={{ width: 44, height: 44, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round"><path d="M12 3v12M7 8l5-5 5 5M5 14v6h14v-6" /></svg>
          </span>
        </div>
        <Slant t="HOT" bg={CORAL} fg="#fff" style={{ top: 170, right: 20, transform: `rotate(8deg) scale(${MOTION.pop(T, t0 + 0.5, 0.5)})` }} />
        <span style={{ position: "absolute", right: 20, bottom: 20, font: `600 12px ${NUM}`, background: INK, color: "#fff", padding: "7px 11px", borderRadius: 999 }}>{idx + 1} / 6</span>
      </div>
      <div style={{ position: "absolute", left: 24, top: 352, display: "flex", gap: 8 }}>
        {["prado-front", "prado-side", "prado-rear34", "prado-rear", "prado-front-seats", "prado-rear-seats"].map((s, i) => (
          <span key={s} style={{ width: 46, height: 46, borderRadius: 12, overflow: "hidden", opacity: i === idx ? 1 : 0.5, boxShadow: i === idx ? `0 0 0 2px ${INK}` : "none" }}><Photo src={img(s)} /></span>
        ))}
      </div>
      <div style={{ position: "absolute", left: 24, right: 24, top: 420, display: "flex", flexDirection: "column", gap: 6 }}>
        <Label color={SLATE}>SUV · 7 SEATS · BLACK · TX-L</Label>
        <span style={{ font: `600 28px/1.04 ${DISPLAY}`, letterSpacing: "-.03em" }}>Toyota Land Cruiser Prado</span>
      </div>
      <div style={{ position: "absolute", left: 24, right: 24, top: 500, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {perks.map((p, i) => {
          const e = MOTION.pop(T, t0 + 1.0 + i * 0.28, 0.5);
          return (
            <div key={p} style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 16, background: "#F4F3EF", opacity: clamp(e * 1.5, 0, 1), transform: `translateY(${(1 - e) * 16}px)` }}>
              <span style={{ flex: "none", width: 28, height: 28, borderRadius: "50%", background: INK, color: YEL, display: "flex", alignItems: "center", justifyContent: "center", font: `700 13px ${NUM}`, transform: `scale(${e})` }}>✓</span>
              <span style={{ font: `600 13px/1.25 ${DISPLAY}` }}>{p}</span>
            </div>
          );
        })}
      </div>
      <BottomBar>
        <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ font: `400 12px ${NUM}`, color: SLATE }}>From · 6 hrs</span>
          <span style={{ font: `700 22px ${NUM}`, letterSpacing: "-.02em" }}>{fmt(120000)}</span>
        </span>
        <div style={{ height: 58, display: "flex", alignItems: "center", gap: 12, padding: "0 6px 0 22px", borderRadius: 999, background: INK, color: "#fff", font: `600 16px ${DISPLAY}`, transform: `scale(${press(T, t0 + 4.6)})`, boxShadow: "0 16px 30px -12px rgba(0,0,0,.5)" }}>Book now<Arrow /></div>
      </BottomBar>
      <Tap T={T} at={t0 + 4.6} x={290} y={735} />
    </div>
  );
}

export function DatesScreen({ T, C }: ScreenProps) {
  const t0 = C.Dates;
  const open = MOTION.enter(T, t0 + 1.0, 0.5) - MOTION.draw(T, t0 + 4.45, 0.45);
  const S = 254;
  const pickA = MOTION.pop(T, t0 + 2.0, 0.45), pickB = MOTION.pop(T, t0 + 3.0, 0.45);
  const done = MOTION.enter(T, t0 + 4.7, 0.4);
  const hrs = Math.round(lerp(6, 72, MOTION.draw(T, t0 + 5.0, 0.9)));
  const price = T < t0 + 5.0 ? 120000 : hrs >= 72 ? 810000 : Math.round(lerp(120000, 810000, (hrs - 6) / 66) / 1000) * 1000;
  const strip = [10, 11, 12, 13, 14, 15, 16];
  const dows = ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed"];
  const cells: ReactNode[] = [];
  for (let d = 1; d <= 31; d++) {
    const col = d % 7, row = Math.floor(d / 7);
    const isA = d === 12, isB = d === 15, mid = d > 12 && d < 15;
    const m = mid ? MOTION.enter(T, t0 + 3.05 + (d - 13) * 0.08, 0.3) : 0;
    const sel = isA ? pickA : isB ? pickB : 0;
    cells.push(
      <span key={d} style={{ position: "absolute", left: 22 + col * 50, top: 134 + row * 50, width: 46, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {mid && <span style={{ position: "absolute", inset: "0 -2px", borderRadius: 14, background: PALE, transform: `scaleX(${m})` }} />}
        {(isA || isB) && <span style={{ position: "absolute", left: 1, top: 0, width: 44, height: 44, borderRadius: "50%", background: YEL, transform: `scale(${sel})`, boxShadow: `0 0 0 4px rgba(255,214,10,.25),0 8px 18px -6px rgba(200,160,0,${0.8 * clamp(sel, 0, 1)})` }} />}
        <span style={{ position: "relative", font: `600 15px ${NUM}`, color: INK }}>{d}</span>
      </span>
    );
  }
  return (
    <div style={{ position: "relative", height: 794 }}>
      <div style={{ position: "absolute", left: 24, right: 24, top: 6, display: "flex", alignItems: "center", gap: 14 }}>
        <Back />
        <span style={{ display: "flex", flexDirection: "column", gap: 2 }}><Label color={SLATE}>STEP 1 OF 2</Label><span style={{ font: `600 18px ${DISPLAY}`, letterSpacing: "-.02em" }}>Book the Prado</span></span>
      </div>
      <div style={{ position: "absolute", left: 24, right: 24, top: 74, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ font: `600 16px ${DISPLAY}` }}>Pickup → return</span>
        <span style={{ height: 40, display: "flex", alignItems: "center", gap: 8, padding: "0 6px", font: `600 13px ${DISPLAY}`, transform: `scale(${press(T, t0 + 0.8)})` }}><CalIcon />Dec 2026</span>
      </div>
      <div style={{ position: "absolute", left: 24, right: 24, top: 124, display: "flex", gap: 6 }}>
        {strip.map((n, i) => {
          const end = n === 12 || n === 15, mid = n === 13 || n === 14;
          const on = done * (end ? 1 : 0), md = done * (mid ? 1 : 0);
          return (
            <span key={n} style={{ flex: 1, height: 66, borderRadius: 18, background: on ? INK : md ? PALE : "#fff", color: on ? "#fff" : INK, boxShadow: on || md ? "none" : "0 4px 14px -6px rgba(0,0,0,.2),0 0 0 1px rgba(0,0,0,.05)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, transform: `scale(${end ? 1 + 0.08 * Math.sin(Math.PI * done) : 1})` }}>
              <span style={{ font: `500 10px ${NUM}`, opacity: 0.7 }}>{dows[i]}</span>
              <span style={{ font: `700 18px ${NUM}` }}>{n}</span>
            </span>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 24, right: 24, top: 212, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ font: `600 16px ${DISPLAY}` }}>How long do you need it?</span>
        <span style={{ font: `500 12px ${NUM}`, color: SLATE }}>Island rates</span>
      </div>
      <div style={{ position: "absolute", left: 24, right: 24, top: 244, height: 60, borderRadius: 999, background: "#F4F3EF", display: "flex", alignItems: "center", padding: "0 6px", gap: 8, boxShadow: T > t0 + 4.9 && T < t0 + 6.1 ? `0 0 0 2px ${INK}` : "none" }}>
        <span style={{ width: 48, height: 48, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", font: `600 22px ${NUM}` }}>−</span>
        <span style={{ flex: 1, textAlign: "center", font: `700 30px ${NUM}`, letterSpacing: "-.02em" }}>{hrs}<span style={{ font: `500 15px ${NUM}`, color: SLATE, marginLeft: 6 }}>hours</span></span>
        <span style={{ width: 48, height: 48, borderRadius: "50%", background: INK, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", font: `600 22px ${NUM}` }}>+</span>
      </div>
      <div style={{ position: "absolute", left: 24, right: 24, top: 318, padding: "14px 16px", borderRadius: 18, background: PALE, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", font: `500 13px ${NUM}` }}><span>{hrs >= 72 ? "3 × 24 hrs" : "6 hrs rate"}</span><span style={{ fontWeight: 700 }}>{fmt(price)}</span></div>
        <span style={{ font: `400 12px/1.45 ${DISPLAY}`, color: SLATE }}>Priced from the Prado rate card.</span>
      </div>
      <div style={{ position: "absolute", left: 24, right: 24, top: 418, display: "flex", flexDirection: "column", gap: 10 }}>
        <span style={{ font: `600 16px ${DISPLAY}` }}>Where should we pick you up?</span>
        <span style={{ height: 54, borderRadius: 18, background: "#F4F3EF", display: "flex", alignItems: "center", padding: "0 18px", font: `500 15px ${NUM}` }}>14 Admiralty Way, Lekki Phase 1</span>
      </div>
      <BottomBar>
        <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ font: `400 12px ${NUM}`, color: SLATE }}>{hrs} hrs · Island</span>
          <span style={{ font: `700 22px ${NUM}`, letterSpacing: "-.02em" }}>{fmt(price)}</span>
        </span>
        <div style={{ height: 58, display: "flex", alignItems: "center", gap: 12, padding: "0 6px 0 22px", borderRadius: 999, background: INK, color: "#fff", font: `600 16px ${DISPLAY}`, transform: `scale(${press(T, t0 + 6.6)})`, boxShadow: "0 16px 30px -12px rgba(0,0,0,.5)" }}>Continue<Arrow /></div>
      </BottomBar>
      {open > 0.001 && <div style={{ position: "absolute", left: 0, right: 0, top: -50, bottom: 0, background: INK, opacity: 0.5 * open, zIndex: 10 }} />}
      {open > 0.001 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: S, height: 540, background: "#fff", borderRadius: "32px 32px 0 0", transform: `translateY(${(1 - open) * 560}px)`, boxShadow: "0 -30px 60px -24px rgba(255,214,10,.55)", zIndex: 11 }}>
          <span style={{ position: "absolute", left: 175, top: 10, width: 40, height: 5, borderRadius: 3, background: "#E3E2DD" }} />
          <div style={{ position: "absolute", left: 22, right: 22, top: 34, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ display: "flex", flexDirection: "column", gap: 3 }}><Label color={SLATE}>PICKUP → RETURN</Label><span style={{ font: `600 24px ${DISPLAY}`, letterSpacing: "-.03em" }}>December 2026</span></span>
            <span style={{ display: "flex", gap: 8 }}>
              <span style={{ width: 44, height: 44, borderRadius: "50%", background: "#F4F3EF", display: "flex", alignItems: "center", justifyContent: "center", font: `500 18px ${NUM}` }}>←</span>
              <span style={{ width: 44, height: 44, borderRadius: "50%", background: INK, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", font: `500 18px ${NUM}` }}>→</span>
            </span>
          </div>
          {["MO", "TU", "WE", "TH", "FR", "SA", "SU"].map((w, i) => <span key={w} style={{ position: "absolute", left: 22 + i * 50, top: 104, width: 46, textAlign: "center", font: `600 11px ${NUM}`, color: ASH, letterSpacing: ".04em" }}>{w}</span>)}
          {cells}
          <span style={{ position: "absolute", left: 22, right: 22, top: 404, font: `500 13px ${NUM}`, color: SLATE, opacity: pickB > 0.05 ? 1 : 0.4 }}>{pickB > 0.05 ? "Sat 12 → Tue 15 Dec · 3 days" : pickA > 0.05 ? "Sat 12 Dec → pick a return date" : "Pick your pickup date"}</span>
          <div style={{ position: "absolute", left: 22, right: 22, top: 448 }}><BlackCta label="Confirm dates" center scale={press(T, t0 + 4.2)} /></div>
        </div>
      )}
      <Tap T={T} at={t0 + 0.8} x={318} y={94} />
      <Tap T={T} at={t0 + 2.0} x={295} y={S + 134 + 50 + 22} />
      <Tap T={T} at={t0 + 3.0} x={95} y={S + 134 + 100 + 22} />
      <Tap T={T} at={t0 + 4.2} x={195} y={S + 448 + 29} />
      <Tap T={T} at={t0 + 6.6} x={292} y={735} />
    </div>
  );
}

export function ReviewScreen({ T, C }: ScreenProps) {
  const t0 = C.Book;
  const count = MOTION.draw(T, t0 + 0.6, 1.1);
  return (
    <div style={{ position: "relative", height: 794 }}>
      <div style={{ position: "absolute", left: 24, right: 24, top: 6, display: "flex", alignItems: "center", gap: 14 }}>
        <Back />
        <span style={{ display: "flex", flexDirection: "column", gap: 2 }}><Label color={SLATE}>STEP 2 OF 2</Label><span style={{ font: `600 18px ${DISPLAY}`, letterSpacing: "-.02em" }}>Review and book</span></span>
      </div>
      <div style={{ position: "absolute", left: 24, right: 24, top: 70, height: 170, borderRadius: 24, overflow: "hidden" }}>
        <Photo src={img("prado-side")} zoom={1.1 - 0.08 * MOTION.enter(T, t0, 4)} />
        <span style={{ position: "absolute", left: 12, bottom: 12, font: `700 12px ${NUM}`, background: INK, color: "#fff", padding: "7px 11px", borderRadius: 999 }}>Driver + full tank</span>
      </div>
      <div style={{ position: "absolute", left: 24, right: 24, top: 262, display: "flex", flexDirection: "column", gap: 12 }}>
        <Row k="Vehicle" v="Land Cruiser Prado TX-L" />
        <Row k="Pickup" v="Sat 12 Dec · 10am" />
        <Row k="Return" v="Tue 15 Dec · 10am" />
        <Row k="Booking" v="72 hrs · Island" />
      </div>
      <div style={{ position: "absolute", left: 24, right: 24, top: 420, paddingTop: 18, borderTop: "1px solid #ECEBE6", display: "flex", flexDirection: "column", gap: 12 }}>
        <Row k="3 × 24 hrs" v={fmt(810000)} />
        <Row k="VAT (7.5%)" v={fmt(60750)} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 12, borderTop: `1.5px solid ${INK}` }}>
          <span style={{ font: `600 16px ${DISPLAY}` }}>Total</span>
          <span style={{ font: `700 26px ${NUM}`, letterSpacing: "-.02em" }}>{fmt(Math.round((870750 * count) / 250) * 250 || 0)}</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 24, right: 24, top: 604, display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ flex: "none", width: 24, height: 24, borderRadius: 8, background: INK, color: YEL, display: "flex", alignItems: "center", justifyContent: "center", font: `700 13px ${NUM}` }}>✓</span>
        <span style={{ font: `400 13px/1.45 ${DISPLAY}`, color: "#3A3935" }}>I agree to the booking terms.</span>
      </div>
      <div style={{ position: "absolute", left: 20, right: 20, bottom: 30, zIndex: 5 }}><BlackCta label="Book & pay" sub="Secure checkout" center scale={press(T, t0 + 2.8)} /></div>
      <Tap T={T} at={t0 + 2.8} x={195} y={735} />
    </div>
  );
}

const CONF = (() => {
  let s = 11;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const cols = [YEL, YEL, INK, CORAL, "#D9D8D2"];
  return Array.from({ length: 44 }, (_, i) => {
    const a = r() * Math.PI * 2, d = 80 + r() * 140, w = 6 + r() * 6, round = r() < 0.3;
    return { dx: Math.cos(a) * d * 1.25, dy: Math.sin(a) * d - 110, w, h: round ? w : w * (1.6 + r()), round, c: cols[i % 5], rot: r() * 720 - 360, delay: r() * 0.15 };
  });
})();

export function BookedScreen({ T, C }: ScreenProps) {
  const t0 = C.Booked;
  const badge = MOTION.pop(T, t0 + 0.4, 0.6);
  const thump = MOTION.pop(T, t0 + 1.3, 0.3) - MOTION.enter(T, t0 + 1.45, 0.3);
  const ring = clamp((T - (t0 + 1.3)) / 1.0, 0, 1);
  const ticket = MOTION.pop(T, t0 + 1.7, 0.6);
  return (
    <div style={{ position: "relative", height: 794, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 50, textAlign: "center" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {CONF.map((p, i) => {
          const t = T - (t0 + 1.3) - p.delay;
          if (t < 0) return null;
          const e = Easing.easeOutCubic(clamp(t / 0.6, 0, 1));
          const o = 1 - clamp((t - 1.6) / 0.6, 0, 1);
          return <span key={i} style={{ position: "absolute", left: 195 + p.dx * e - p.w / 2, top: 120 + p.dy * e + 140 * t * t, width: p.w, height: p.h, borderRadius: p.round ? "50%" : 2, background: p.c, opacity: o, transform: `rotate(${p.rot * Math.min(t, 1.5)}deg)` }} />;
        })}
      </div>
      <div style={{ position: "relative", width: 140, height: 140 }}>
        <span style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${YEL}`, transform: `scale(${1 + ring})`, opacity: ring > 0 ? 1 - ring : 0 }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: YEL, transform: `scale(${badge * (1 + thump * 0.08)}) rotate(${(1 - clamp(badge, 0, 1)) * -24}deg)`, boxShadow: "0 0 0 8px rgba(255,214,10,.22),0 0 34px 6px rgba(255,214,10,.5),0 24px 44px -16px rgba(200,160,0,.6)" }} />
        <svg width="62" height="62" viewBox="0 0 24 24" style={{ position: "absolute", left: 39, top: 39 }}>
          <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - MOTION.draw(T, t0 + 0.8, 0.5)} />
        </svg>
      </div>
      <div style={{ marginTop: 24 }}><Label>BOOKING CONFIRMED · CRL-RNT-1212</Label></div>
      <div style={{ marginTop: 12, font: `600 34px/1.02 ${DISPLAY}`, letterSpacing: "-.03em", padding: "0 30px", opacity: MOTION.enter(T, t0 + 1.0, 0.6) }}>You&apos;re booked.<br />Ride clean.</div>
      <div style={{ marginTop: 12, font: `400 14px/1.5 ${DISPLAY}`, color: SLATE, padding: "0 40px", opacity: MOTION.enter(T, t0 + 1.3, 0.6) }}>Cleaned and checked before every trip. Your driver messages you 30 minutes before.</div>
      <div style={{ margin: "22px 20px 0", width: "calc(100% - 40px)", borderRadius: 26, overflow: "hidden", background: "#fff", boxShadow: "0 24px 44px -22px rgba(0,0,0,.35),0 0 0 1px rgba(0,0,0,.04)", textAlign: "left", transform: `translateY(${(1 - ticket) * 40}px) rotate(${(1 - clamp(ticket, 0, 1)) * -4}deg)`, opacity: clamp(ticket * 1.4, 0, 1) }}>
        <div style={{ height: 130, position: "relative", overflow: "hidden" }}><Photo src={img("prado-front")} zoom={1.06} /></div>
        <div style={{ padding: "14px 18px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
          <Row k="Dates" v="Sat 12 → Tue 15 Dec" />
          <Row k="Booking" v="72 hrs · Driver" />
          <Row k="Total" v={fmt(870750)} />
        </div>
      </div>
    </div>
  );
}
