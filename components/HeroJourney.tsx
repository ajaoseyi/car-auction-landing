"use client";

// Website hero: looping booking journey, reusing the rentals film's phone screens.
import { useEffect, useRef, useState, type ComponentType } from "react";
import { BookedScreen, DatesScreen, Easing, PradoScreen, RentalsScreen, ReviewScreen, StatusBar, type Cues, type ScreenProps } from "./rentalScreens";

const HJ_C: Cues = { Browse: 0, Prado: 5.5, Dates: 11, Book: 18.5, Booked: 22.5, Outro: 28 };
const HJ_LOOP = 28.6;
const HJ_STEPS: [string, keyof Cues][] = [["Browse", "Browse"], ["Pick", "Prado"], ["Dates", "Dates"], ["Pay", "Book"], ["Booked", "Booked"]];
const hjC = (v: number) => Math.min(1, Math.max(0, v));
const hjEnter = (T: number, s: number, d: number) => Easing.easeOutCubic(hjC((T - s) / d));
const hjPop = (T: number, s: number, d: number) => Easing.easeOutBack(hjC((T - s) / d));
const hjWin = (T: number, a: number, b: number, f = 0.3) => Math.min(hjEnter(T, a - f, f), 1 - hjEnter(T, b - f, f));

const HJ_CHIPS = [
  { at: 1.2, out: 5.3, side: "L", y: 0.18, r: -6, glow: "rgba(96,165,250,.6)", icon: "badge-check", t: "No hidden fees" },
  { at: 6.4, out: 10.8, side: "R", y: 0.3, r: 6, glow: "rgba(255,214,10,.85)", icon: "sparkles", t: "Cleaned before every trip" },
  { at: 16.2, out: 18.3, side: "L", y: 0.62, r: -5, glow: "rgba(255,214,10,.85)", icon: "calendar-clock", t: "12 → 15 Dec · 72 hrs" },
  { at: 19.2, out: 22.3, side: "R", y: 0.5, r: 5, glow: "rgba(167,139,250,.6)", icon: "fuel", t: "Driver + full tank" },
  { at: 24.2, out: 28.0, side: "L", y: 0.26, r: -6, glow: "rgba(52,211,153,.6)", icon: "map-pin", t: "Arriving Sat · 10am" },
];

const hjIcon = (n: string, s = 16) => {
  const mask = `url(https://unpkg.com/lucide-static@0.460.0/icons/${n}.svg) center/contain no-repeat`;
  return <span style={{ flex: "none", width: s, height: s, background: "currentColor", WebkitMask: mask, mask }} />;
};

export default function HeroJourney({ height = 640 }: { height?: number }) {
  const [T, setT] = useState(0);
  const tRef = useRef(0), box = useRef<HTMLDivElement>(null), vis = useRef(true);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      tRef.current = 23.8;
      // matchMedia is client-only, so the reduced-motion still frame is chosen after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setT(23.8);
      return;
    }
    const io = new IntersectionObserver(([e]) => { vis.current = e.isIntersecting; }, { threshold: 0.05 });
    if (box.current) io.observe(box.current);
    let raf: number, last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (vis.current && !document.hidden) { tRef.current = (tRef.current + dt) % HJ_LOOP; setT(tRef.current); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, []);

  const jump = (k: keyof Cues) => { tRef.current = HJ_C[k] + 0.01; setT(tRef.current); };
  const C = HJ_C, railH = 64, s = (height - railH - 24) / 844;
  const screens: [number, number, ComponentType<ScreenProps>][] = [
    [C.Browse, C.Prado, RentalsScreen], [C.Prado, C.Dates, PradoScreen], [C.Dates, C.Book, DatesScreen], [C.Book, C.Booked, ReviewScreen], [C.Booked, C.Outro + 1, BookedScreen],
  ];
  const loopFade = Math.min(hjEnter(T, 0, 0.45), 1 - hjEnter(T, HJ_LOOP - 0.5, 0.45));
  const zoom = hjEnter(T, C.Dates + 0.4, 0.7) - hjEnter(T, C.Book - 0.4, 0.6);
  const tilt = Math.sin(T * 0.6) * 1.6 + (T > C.Prado && T < C.Dates ? 1.2 : -1.2) * hjEnter(T % 5.5, 0, 0.8);
  const bob = Math.sin(T * 1.1) * 5;
  const phoneW = 390 * s;

  return (
    <div ref={box} style={{ position: "relative", width: "100%", height, fontFamily: "'Bricolage Grotesque', sans-serif", color: "#121212" }}>
      <div style={{ position: "absolute", left: "50%", top: 8 + bob, width: 390, height: 844, transformOrigin: "50% 0", transform: `translateX(-50%) scale(${s * (1 + zoom * 0.04)}) rotate(${tilt}deg)`, borderRadius: 56, background: "#fff", overflow: "hidden", boxShadow: "0 70px 120px -50px rgba(255,214,10,.75), -50px 40px 110px -50px rgba(167,139,250,.55), 50px 40px 110px -50px rgba(96,165,250,.5), 0 0 0 1px rgba(0,0,0,.05), 0 30px 60px -30px rgba(0,0,0,.25)" }}>
        <div style={{ position: "relative", zIndex: 30 }}><StatusBar /></div>
        <div style={{ position: "absolute", inset: 0, opacity: loopFade }}>
          {screens.map(([a, b, Scr], i) => {
            const o = i === 0 ? 1 - hjEnter(T, b - 0.3, 0.3) : hjWin(T, a, b, 0.3);
            if (o <= 0.001) return null;
            return <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 50, height: 794, opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}><Scr T={T} C={C} /></div>;
          })}
        </div>
      </div>
      {HJ_CHIPS.map((c, i) => {
        const o = hjWin(T, c.at, c.out, 0.4);
        if (o <= 0) return null;
        const p = hjPop(T, c.at - 0.4, 0.6);
        const pos = c.side === "L" ? { right: `calc(50% + ${phoneW / 2 - 40}px)` } : { left: `calc(50% + ${phoneW / 2 - 40}px)` };
        return (
          <div key={i} style={{ position: "absolute", ...pos, top: (height - railH) * c.y + Math.sin(T * 1.3 + i) * 7, zIndex: 5, opacity: o, transform: `rotate(${c.r}deg) scale(${p})`, transformOrigin: c.side === "L" ? "100% 50%" : "0 50%" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", borderRadius: 999, background: "#fff", font: "600 14px 'Clash Grotesk'", whiteSpace: "nowrap", boxShadow: `0 20px 40px -14px ${c.glow},0 0 0 1px rgba(0,0,0,.05)` }}>{hjIcon(c.icon)}{c.t}</span>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: railH, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: 4, padding: 5, height: 48, boxSizing: "border-box", borderRadius: 999, background: "#F5F4F0", alignSelf: "flex-end" }}>
          {HJ_STEPS.map(([label, k], i) => {
            const a = C[k], b = i < HJ_STEPS.length - 1 ? C[HJ_STEPS[i + 1][1]] : HJ_LOOP;
            const on = T >= a && T < b, prog = hjC((T - a) / (b - a));
            return (
              <button key={k} type="button" onClick={() => jump(k)} style={{ position: "relative", overflow: "hidden", border: 0, cursor: "pointer", height: 38, padding: "0 14px", borderRadius: 999, background: on ? "#fff" : "transparent", boxShadow: on ? "0 6px 14px -8px rgba(0,0,0,.3)" : "none", font: "500 13px 'Clash Grotesk'", color: on || T >= b ? "#121212" : "#9A9993", transition: "background .3s, color .3s" }}>
                <span style={{ position: "relative", zIndex: 1 }}>{label}</span>
                {on && <span style={{ position: "absolute", left: 10, right: 10, bottom: 5, height: 2, borderRadius: 2, background: "#FFD60A", transformOrigin: "left", transform: `scaleX(${prog})` }} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
