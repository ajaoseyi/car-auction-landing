// Carlot waitlist: scroll-scrubbed three.js stage + DOM text reveals.
import * as THREE from "three";

export type SceneOpts = { glow: boolean; sound: boolean };

export type WaitlistScene = {
  celebrate(n: string, instant: boolean): void;
  reset(): void;
  setOpts(n: Partial<SceneOpts>): void;
  destroy(): void;
};

type Ctx = CanvasRenderingContext2D;
type OrbitItem = { s: THREE.Sprite; a0: number };
type Orbit = { g: THREE.Group; ringMat: THREE.MeshBasicMaterial; radius: number; speed: number; items: OrbitItem[] };
type ChipOpts = { bg?: string; fg?: string; dot?: string | null; shadow?: string; size?: number };
type Confetto = { m: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>; v: THREE.Vector3; r: THREE.Vector3; life: number };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const eOut = (t: number) => 1 - Math.pow(1 - t, 3);
const eIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const back = (t: number) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

function rrect(x: Ctx, X: number, Y: number, w: number, h: number, r: number) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }

export async function mount(host: HTMLElement, opts: Partial<SceneOpts> = {}): Promise<WaitlistScene> {
  try { await Promise.all([document.fonts.load('600 32px "Clash Grotesk"'), document.fonts.load('600 32px "Bricolage Grotesque"')]); } catch {}
  let o: SceneOpts = { glow: true, sound: true, ...opts };

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0xffffff, 0);
  const cv = renderer.domElement; cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
  host.appendChild(cv);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100); camera.position.set(0, 0, 12);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xe6e4dc, 1.7));
  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(3, 5, 7); scene.add(key);
  const rim = new THREE.PointLight(0xffd60a, 14, 9); rim.position.set(-2.2, -1.4, 2.4); scene.add(rim);

  const tex = (c: HTMLCanvasElement) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const sprite = (c: HTMLCanvasElement, worldH: number, innerH: number) => {
    const m = new THREE.SpriteMaterial({ map: tex(c), transparent: true, depthWrite: false });
    const s = new THREE.Sprite(m); const u = worldH / innerH; s.scale.set(c.width * u, c.height * u, 1); return s;
  };
  function chip(text: string, { bg = "#fff", fg = "#121212", dot = null, shadow = "rgba(96,165,250,.55)", size = 30 }: ChipOpts = {}) {
    const S = 2, pad = 44 * S, c = document.createElement("canvas"), x = c.getContext("2d")!;
    const font = `600 ${size * S}px "Clash Grotesk", sans-serif`; x.font = font;
    const tw = x.measureText(text).width, h = size * S * 2.1, dw = dot ? size * S * 0.85 : 0, w = tw + h * 0.9 + dw;
    c.width = Math.ceil(w + pad * 2); c.height = Math.ceil(h + pad * 2); x.font = font;
    x.shadowColor = shadow; x.shadowBlur = 38 * S; x.shadowOffsetY = 16 * S;
    rrect(x, pad, pad, w, h, h / 2); x.fillStyle = bg; x.fill(); x.shadowColor = "transparent";
    if (bg === "#fff") { x.strokeStyle = "rgba(0,0,0,.06)"; x.lineWidth = 2; x.stroke(); }
    if (dot) { x.fillStyle = dot; x.beginPath(); x.arc(pad + h * 0.45 + size * S * 0.2, pad + h / 2, size * S * 0.22, 0, 7); x.fill(); }
    x.fillStyle = fg; x.textBaseline = "middle"; x.fillText(text, pad + h * 0.45 + dw, pad + h / 2 + 2);
    return sprite(c, 0.44, h);
  }
  async function card(src: string, title: string, price: string, shadow: string) {
    const S = 2, pad = 50 * S, W = 300 * S, H = 270 * S, c = document.createElement("canvas"), x = c.getContext("2d")!;
    c.width = W + pad * 2; c.height = H + pad * 2;
    x.shadowColor = shadow; x.shadowBlur = 46 * S; x.shadowOffsetY = 22 * S; rrect(x, pad, pad, W, H, 30 * S); x.fillStyle = "#fff"; x.fill(); x.shadowColor = "transparent";
    try {
      const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
      const iw = W - 16 * S, ih = 170 * S, r = Math.max(iw / img.width, ih / img.height), dw = img.width * r, dh = img.height * r;
      x.save(); rrect(x, pad + 8 * S, pad + 8 * S, iw, ih, 24 * S); x.clip(); x.drawImage(img, pad + 8 * S + (iw - dw) / 2, pad + 8 * S + (ih - dh) * 0.6, dw, dh); x.restore();
    } catch {}
    x.fillStyle = "#121212"; x.font = `600 ${20 * S}px "Bricolage Grotesque", sans-serif`; x.fillText(title, pad + 20 * S, pad + 214 * S);
    x.font = `600 ${18 * S}px "Clash Grotesk", sans-serif`; x.fillText(price, pad + 20 * S, pad + 246 * S);
    x.fillStyle = "#FFD60A"; x.beginPath(); x.arc(pad + W - 42 * S, pad + 228 * S, 22 * S, 0, 7); x.fill();
    x.fillStyle = "#121212"; x.font = `600 ${20 * S}px "Clash Grotesk", sans-serif`; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("↗", pad + W - 42 * S, pad + 229 * S);
    return sprite(c, 1.5, H);
  }

  // Paddle (matches the logo: disc, dot, 38° handle)
  const ink = new THREE.MeshPhysicalMaterial({ color: 0x121212, roughness: 0.32, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.18 });
  const yel = new THREE.MeshPhysicalMaterial({ color: 0xffd60a, roughness: 0.38, emissive: 0xffd60a, emissiveIntensity: 0.18 });
  const rig = new THREE.Group(); scene.add(rig);
  const paddle = new THREE.Group(); rig.add(paddle);
  const discG = new THREE.CylinderGeometry(1, 1, 0.22, 96); discG.rotateX(Math.PI / 2);
  const disc = new THREE.Mesh(discG, ink); paddle.add(disc);
  const dotG = new THREE.CylinderGeometry(0.36, 0.36, 0.06, 64); dotG.rotateX(Math.PI / 2);
  const dot = new THREE.Mesh(dotG, yel); dot.position.z = 0.13; paddle.add(dot);
  const hPivot = new THREE.Group(); hPivot.position.set(0, -0.2, 0); hPivot.rotation.z = -38 * Math.PI / 180; paddle.add(hPivot);
  const handle = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.96, 8, 24), ink); handle.scale.z = 0.42; handle.position.y = -0.72; hPivot.add(handle);
  // paddle number face
  const numC = document.createElement("canvas"); numC.width = numC.height = 512;
  const numMat = new THREE.MeshBasicMaterial({ map: tex(numC), transparent: true, opacity: 0, depthWrite: false });
  const numMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), numMat); numMesh.position.z = 0.115; paddle.add(numMesh);
  function drawNumber(n: string) {
    const x = numC.getContext("2d")!; x.clearRect(0, 0, 512, 512); x.textAlign = "center"; x.textBaseline = "middle";
    x.fillStyle = "#FFD60A"; x.font = '600 34px "Clash Grotesk", sans-serif'; x.fillText("P A D D L E", 256, 176);
    x.fillStyle = "#ffffff"; x.font = '600 172px "Clash Grotesk", sans-serif'; x.fillText(String(n), 256, 296);
    numMat.map!.needsUpdate = true;
  }
  // soft colourful shadow behind the paddle
  const gC = document.createElement("canvas"); gC.width = gC.height = 512; { const x = gC.getContext("2d")!;
    ([[256, 300, "rgba(255,214,10,.75)", 230], [150, 250, "rgba(167,139,250,.45)", 190], [370, 250, "rgba(96,165,250,.4)", 190]] as const).forEach(([cx, cy, col, r]) => { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, col); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, 512, 512); }); }
  const glowMat = new THREE.MeshBasicMaterial({ map: tex(gC), transparent: true, depthWrite: false });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 6.4), glowMat); glow.position.set(0.1, -0.7, -1.4); rig.add(glow);

  // Orbits
  function orbit(radius: number, tiltX: number, tiltZ: number, speed: number): Orbit {
    const g = new THREE.Group(); g.rotation.set(tiltX, 0, tiltZ);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xd6d5cf, transparent: true, opacity: 0 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.008, 6, 200), ringMat); g.add(ring);
    rig.add(g); return { g, ringMat, radius, speed, items: [] };
  }
  const add = (orb: Orbit, s: THREE.Sprite, a0: number) => { orb.g.add(s); orb.items.push({ s, a0 }); };
  const origin1 = orbit(2.1, 1.18, 0.25, 0.22), origin2 = orbit(3.2, 1.25, -0.2, -0.14);
  add(origin1, chip("USA", { dot: "#60A5FA" }), 0.3); add(origin1, chip("UK", { dot: "#A78BFA", shadow: "rgba(167,139,250,.55)" }), 2.4); add(origin1, chip("Canada", { dot: "#FF5A36", shadow: "rgba(255,90,54,.45)" }), 4.4);
  add(origin2, chip("Inspected abroad", { dot: "#34D399", shadow: "rgba(52,211,153,.5)" }), 1.2);
  const ship = orbit(2.7, 1.1, -0.35, 0.2);
  add(ship, chip("Shipping", { dot: "#60A5FA" }), 0.2); add(ship, chip("Port clearing", { dot: "#A78BFA", shadow: "rgba(167,139,250,.55)" }), 1.8); add(ship, chip("Lagos", { dot: "#FF5A36", shadow: "rgba(255,90,54,.45)" }), 3.4); add(ship, chip("Your driveway", { dot: "#34D399", shadow: "rgba(52,211,153,.5)" }), 5.0);
  card("/lexus-lx600-sm.jpg", "Lexus LX 600", "₦100,000,000", "rgba(255,214,10,.6)").then(s => add(origin2, s, 3.2));
  card("/mercedes-g63-sm.jpg", "Mercedes-AMG G 63", "₦30,000,000", "rgba(96,165,250,.55)").then(s => add(origin2, s, 5.3));
  const orbits = [origin1, origin2, ship];
  // Bid chips
  const bid = new THREE.Group(); rig.add(bid);
  const bidItems: [THREE.Sprite, number, number][] = [[chip("Paddle 247", { bg: "#121212", fg: "#FFD60A", shadow: "rgba(255,214,10,.6)" }), -1.75, 1.25], [chip("You lead", { bg: "#FFD60A", shadow: "rgba(255,214,10,.7)" }), 1.55, 0.95], [chip("₦100,000 refundable", { dot: "#FF5A36", shadow: "rgba(255,90,54,.45)" }), 1.05, -1.6]];
  bidItems.forEach(([s, x, y]) => { s.position.set(x, y, 0.6); bid.add(s); });

  // Confetti
  const confetti: Confetto[] = []; const cols = [0xffd60a, 0xffd60a, 0x121212, 0xff5a36, 0xd9d8d2];
  const cg = new THREE.PlaneGeometry(0.07, 0.13);
  for (let i = 0; i < 150; i++) { const m = new THREE.Mesh(cg, new THREE.MeshBasicMaterial({ color: cols[i % 5], side: THREE.DoubleSide, transparent: true })); m.visible = false; scene.add(m); confetti.push({ m, v: new THREE.Vector3(), r: new THREE.Vector3(), life: 0 }); }
  function burst(at: THREE.Vector3) {
    confetti.forEach(c => { const a = Math.random() * Math.PI * 2, sp = 2.5 + Math.random() * 4; c.m.position.copy(at); c.v.set(Math.cos(a) * sp, Math.sin(a) * sp * 0.8 + 3.2, (Math.random() - 0.5) * 3); c.r.set(Math.random() * 8, Math.random() * 8, Math.random() * 8); c.life = 2.6 + Math.random() * 0.8; c.m.visible = true; c.m.material.opacity = 1; });
  }

  // Sound (dry iOS-style tap + soft whoosh)
  let actx: AudioContext | null = null;
  function tap(whoosh: boolean) {
    if (!o.sound) return; try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      actx = actx || new AC(); const t = actx.currentTime;
      const os = actx.createOscillator(), g = actx.createGain(); os.frequency.setValueAtTime(1350, t); os.frequency.exponentialRampToValueAtTime(900, t + 0.02); g.gain.setValueAtTime(0.09, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03); os.connect(g); g.connect(actx.destination); os.start(t); os.stop(t + 0.05);
      if (whoosh) { const b = actx.createBuffer(1, actx.sampleRate * 0.5, actx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const n = actx.createBufferSource(); n.buffer = b; const f = actx.createBiquadFilter(); f.type = "bandpass"; f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(4500, t + 0.4); const ng = actx.createGain(); ng.gain.setValueAtTime(0.0001, t); ng.gain.linearRampToValueAtTime(0.05, t + 0.25); ng.gain.linearRampToValueAtTime(0.0001, t + 0.45); n.connect(f); f.connect(ng); ng.connect(actx.destination); n.start(t); }
    } catch {}
  }

  // Pointer
  const ptr = { x: 0, y: 0, sx: 0, sy: 0 }; const ray = new THREE.Raycaster(); const ndc = new THREE.Vector2(); let hover = false;
  const onMove = (e: PointerEvent) => { ptr.x = (e.clientX / innerWidth) * 2 - 1; ptr.y = -(e.clientY / innerHeight) * 2 + 1; };
  let bounceT = -10;
  const interactive = (el: EventTarget | null) => el instanceof Element && el.closest("a,button,input,textarea,select,label");
  const onDown = (e: PointerEvent) => { if (hover && !interactive(e.target)) { bounceT = performance.now() / 1000; tap(true); } };
  addEventListener("pointermove", onMove, { passive: true }); addEventListener("pointerdown", onDown);

  function resize() { const w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  resize(); addEventListener("resize", resize);

  let sS = 0, celebT: number | null = null, raf = 0; const t0 = performance.now() / 1000;
  const reveals = () => [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
  const pose = (m: boolean) => m
    ? [[0, 1.55, 0.05, 0.62], [0, 1.6, 0, 0.48], [0, 1.75, -0.12, 0.58], [0, 1.6, 0.18, 0.46], [0, 1.65, 0, 0.6]]
    : [[0.47, 0.1, 0.08, 1.3], [0.46, 0, 0, 0.92], [0.44, 0.55, -0.16, 1.15], [0.46, -0.1, 0.2, 0.88], [0.43, 0.05, 0, 1.25]];

  let last = 0;
  function loop() { raf = requestAnimationFrame(loop); frame(); }
  function frame() {
    const nowMs = performance.now(); if (nowMs - last < 8) return; last = nowMs;
    const now = performance.now() / 1000, T = now - t0, vh = innerHeight, mobile = innerWidth < 820;
    // scroll position in "scenes"
    const secs = [...document.querySelectorAll("[data-scene]")]; let s = 0;
    if (secs.length > 1) { const cs = secs.map(el => { const r = el.getBoundingClientRect(); return r.top + r.height / 2; }); const mid = vh / 2;
      if (mid <= cs[0]) s = 0; else if (mid >= cs[cs.length - 1]) s = cs.length - 1; else for (let i = 0; i < cs.length - 1; i++) if (mid >= cs[i] && mid <= cs[i + 1]) { s = i + (mid - cs[i]) / (cs[i + 1] - cs[i]); break; } }
    sS += (s - sS) * 0.09;
    const w = (k: number) => clamp(1 - Math.abs(sS - k) * 1.7);
    // DOM reveals
    reveals().forEach(el => {
      const r = el.getBoundingClientRect(), c = (r.top + r.height * 0.5) / vh, ct = (r.top + Math.min(r.height, 60)) / vh, d = +(el.dataset.delay || 0);
      const inP = eOut(clamp((1.0 - ct) / 0.18)), intro = eOut(clamp((T - 0.5 - d * 0.14) / 0.9));
      const e = Math.min(inP, intro), out = eIO(clamp((0.14 - c) / 0.22));
      el.style.opacity = (e * (1 - out)).toFixed(3);
      el.style.transform = `translate3d(0, ${((1 - e) * 56 - out * 48).toFixed(1)}px, 0) rotate(${((1 - e) * 2.5 - out * 1.5).toFixed(2)}deg)`;
      el.style.transformOrigin = "0 100%";
      el.querySelectorAll<HTMLElement>("[data-hl]").forEach(h => { h.style.transform = `scaleX(${eIO(clamp((e - 0.55) / 0.45)).toFixed(3)})`; });
    });
    // camera + rig pose
    const halfH = Math.tan(16 * Math.PI / 180) * 12, halfW = halfH * camera.aspect;
    const P = pose(mobile); const i0 = Math.floor(clamp(sS, 0, P.length - 1)), i1 = Math.min(P.length - 1, i0 + 1), f = eIO(clamp(sS - i0));
    const pp = P[i0].map((v, j) => lerp(v, P[i1][j], f));
    ptr.sx += (ptr.x - ptr.sx) * 0.06; ptr.sy += (ptr.y - ptr.sy) * 0.06;
    rig.position.set(pp[0] * halfW, pp[1] * (mobile ? halfH * 0.42 : 1), 0);
    rig.scale.setScalar(pp[3]);
    // intro: handle grows, disc pops, dot lands (like the logo reveal)
    hPivot.scale.y = Math.max(0.001, eOut(clamp((T - 0.2) / 0.5)));
    const dpop = back(clamp((T - 0.55) / 0.6)); disc.scale.setScalar(Math.max(0.001, dpop));
    // celebration / bounce / bid pulse
    const bidPulse = (() => { const p = (T % 2.4) / 2.4; return p < 0.25 ? back(p / 0.25) : 1 - eIO(clamp((p - 0.25) / 0.45)); })() * w(2);
    const bounce = (() => { const k = now - bounceT; return k > 1.2 ? 0 : (k < 0.3 ? back(k / 0.3) : 1 - eIO(clamp((k - 0.3) / 0.7))); })();
    const ck = celebT === null ? -1 : now - celebT, celeb = ck < 0 ? 0 : back(clamp(ck / 0.7));
    const numIn = ck < 0 ? 0 : eOut(clamp((ck - 0.35) / 0.5));
    numMat.opacity = numIn; dot.scale.setScalar(Math.max(0.001, back(clamp((T - 1.0) / 0.45)) * (1 - numIn)));
    paddle.position.y = Math.sin(T * 1.1) * 0.07 + bidPulse * 0.45 + bounce * 0.5 + celeb * 0.35 * w(4);
    paddle.rotation.set(-ptr.sy * 0.28, ptr.sx * 0.42 + Math.sin(T * 0.6) * 0.08, pp[2] + Math.sin(T * 0.8) * 0.03 - bidPulse * 0.08 - bounce * 0.12);
    glow.material.opacity = o.glow ? 0.85 + 0.15 * Math.sin(T * 1.4) : 0;
    glow.position.y = -0.7 + paddle.position.y * 0.5;
    rim.intensity = o.glow ? 14 : 5;
    // orbits
    const ow = [w(1), w(1), w(3)];
    orbits.forEach((orb, k) => {
      const a = ow[k], spin = T * orb.speed + sS * 0.9 * Math.sign(orb.speed);
      orb.g.visible = a > 0.001; orb.ringMat.opacity = a * 0.9; const grow = 0.55 + 0.45 * eOut(a); orb.g.scale.setScalar(grow);
      orb.g.rotation.y = ptr.sx * 0.15;
      orb.items.forEach(({ s, a0 }) => { const ang = a0 + spin; s.position.set(Math.cos(ang) * orb.radius, Math.sin(ang) * orb.radius, 0); s.material.opacity = a; });
    });
    // bid chips
    const bw = w(2); bid.visible = bw > 0.001;
    bidItems.forEach(([s, , y], k) => { const e = back(clamp((bw - k * 0.15) / 0.6)); s.material.opacity = clamp(bw * 1.4 - k * 0.15); s.position.y = y + Math.sin(T * 1.3 + k) * 0.06 + (1 - e) * -0.4; });
    // hover
    ndc.set(ptr.x, ptr.y); ray.setFromCamera(ndc, camera); hover = ray.intersectObjects([disc, handle], false).length > 0;
    document.documentElement.style.cursor = hover ? "pointer" : "";
    // confetti
    const dt = 1 / 60;
    confetti.forEach(c => { if (!c.m.visible) return; c.life -= dt; c.v.y -= 6.5 * dt; c.v.multiplyScalar(0.985); c.m.position.addScaledVector(c.v, dt); c.m.rotation.x += c.r.x * dt; c.m.rotation.y += c.r.y * dt; c.m.rotation.z += c.r.z * dt; c.m.material.opacity = clamp(c.life / 0.6); if (c.life <= 0) c.m.visible = false; });
    camera.position.x = ptr.sx * 0.25; camera.position.y = ptr.sy * 0.18; camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  loop();
  // keep rendering when rAF is throttled (background tabs, embedded previews)
  const wd = setInterval(() => { if (performance.now() - last > 120) frame(); }, 100);

  return {
    celebrate(n, instant) {
      drawNumber(n); celebT = performance.now() / 1000 - (instant ? 5 : 0);
      if (!instant) { const p = new THREE.Vector3(); paddle.getWorldPosition(p); burst(p); tap(true); }
    },
    reset() { celebT = null; },
    setOpts(n) { o = { ...o, ...n }; },
    destroy() { cancelAnimationFrame(raf); clearInterval(wd); removeEventListener("pointermove", onMove); removeEventListener("pointerdown", onDown); removeEventListener("resize", resize); document.documentElement.style.cursor = ""; renderer.dispose(); cv.remove(); },
  };
}
