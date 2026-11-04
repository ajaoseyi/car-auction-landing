"use client";
/* eslint-disable @next/next/no-img-element -- listing photos come from Cloudinary/Unsplash URLs set by the API */

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { useAuth, isRegistered } from "@/lib/auth";
import type { RentalBooking, RentalBookingStatus } from "@/lib/rentalModels";
import s from "./Booking.module.css";
import { SignInSheet } from "./SignInSheet";

export { s };

const lucide = (k: string) => `https://unpkg.com/lucide-static@0.460.0/icons/${k}.svg`;

export function Icon({ name, size, style }: { name: string; size?: number; style?: CSSProperties }) {
  const mask = `url(${lucide(name)}) center/contain no-repeat`;
  return <span aria-hidden="true" className={s.icon} style={{ WebkitMask: mask, mask, ...(size ? { width: size, height: size } : {}), ...style }} />;
}

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

// ---------- Data loading ----------

/** Loads once per `key`, with a reload for retries; mirrors the app's useRequest. */
export function useRequest<T>(load: () => Promise<T>, key: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    if (key == null) return;
    let live = true;
    loadRef.current().then(
      (d) => {
        if (!live) return;
        setData(d);
        setError(null);
      },
      (e: Error) => live && setError(e),
    );
    return () => {
      live = false;
    };
  }, [key, tick]);

  const reload = useCallback(() => {
    setError(null);
    setTick((t) => t + 1);
  }, []);
  return { data, error, reload, setData };
}

// ---------- Page chrome ----------

function Brand() {
  return (
    <Link href="/" className={s.brand} aria-label="Carlot home">
      <span className={s.mark}>
        <span className={s.markHandle} />
        <span className={s.markDot} />
      </span>
      <span className={s.wordmark}>Carlot</span>
    </Link>
  );
}

/** The brand bar on every booking page, with the account entry point. */
export function Shell({ children }: { children: ReactNode }) {
  const { user, status } = useAuth();
  const [signIn, setSignIn] = useState(false);
  return (
    <div className={s.page}>
      <header className={s.header}>
        <Brand />
        <nav className={s.headerNav}>
          <Link href="/#rent" className={cx(s.headerLink, s.deskOnly)}>
            <Icon name="car" />
            Fleet
          </Link>
          {isRegistered(user) ? (
            <Link href="/bookings" className={cx(s.headerLink, s.headerLinkDark)}>
              <Icon name="calendar-check" />
              My bookings
            </Link>
          ) : status === "signedOut" ? (
            <button type="button" className={cx(s.headerLink, s.headerLinkDark)} onClick={() => setSignIn(true)}>
              <Icon name="user-round" />
              Sign in
            </button>
          ) : null}
        </nav>
      </header>
      <div className={s.wrap}>{children}</div>
      {signIn && <SignInSheet onClose={() => setSignIn(false)} />}
    </div>
  );
}

export function BackButton({ href, onClick, label = "Back" }: { href?: string; onClick?: () => void; label?: string }) {
  if (href)
    return (
      <Link href={href} aria-label={label} className={s.circleBtn}>
        <Icon name="arrow-left" size={18} />
      </Link>
    );
  return (
    <button type="button" aria-label={label} onClick={onClick} className={s.circleBtn}>
      <Icon name="arrow-left" size={18} />
    </button>
  );
}

export function StepHead({ back, eyebrow, title }: { back: string; eyebrow: string; title: string }) {
  return (
    <div className={s.stepHead}>
      <BackButton href={back} />
      <div className={s.stepHeadText}>
        <span className={s.eyebrow}>{eyebrow}</span>
        <h1 className={s.stepTitle}>{title}</h1>
      </div>
    </div>
  );
}

// ---------- Controls ----------

export function PrimaryButton({
  label,
  onClick,
  href,
  disabled,
  loading,
  wide,
  icon = "arrow-right",
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  loading?: boolean;
  wide?: boolean;
  icon?: string;
}) {
  const inner = (
    <>
      {label}
      <span className={s.primaryDisc}>
        <span className={loading ? s.spin : undefined} style={{ display: "flex" }}>
          <Icon name={loading ? "loader" : icon} size={18} />
        </span>
      </span>
    </>
  );
  if (href && !disabled)
    return (
      <Link href={href} className={cx(s.primary, wide && s.primaryWide)}>
        {inner}
      </Link>
    );
  return (
    <button type="button" onClick={onClick} disabled={disabled || loading} aria-busy={loading} className={cx(s.primary, wide && s.primaryWide)}>
      {inner}
    </button>
  );
}

export type SegOption<K extends string> = { key: K; label: string; disabled?: boolean; count?: number };

export function Segmented<K extends string>({
  options,
  value,
  onChange,
  look = "pick",
  label,
}: {
  options: SegOption<K>[];
  value: K;
  onChange: (k: K) => void;
  look?: "pick" | "ink";
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cx(s.seg, look === "ink" && s.segInk)}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <button
            key={o.key}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={o.disabled}
            onClick={() => onChange(o.key)}
            className={cx(s.segBtn, on && (look === "ink" ? s.segOnInk : s.segOnPick))}
          >
            {o.label}
            {o.count != null && <span className={s.segCount}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={s.row}>
      <span className={s.rowLabel}>{label}</span>
      <span className={s.rowValue}>{value}</span>
    </div>
  );
}

export function Photo({ src, label, className, style, children }: { src?: string | null; label?: string; className?: string; style?: CSSProperties; children?: ReactNode }) {
  return (
    <div className={cx(s.photoSlot, className)} style={style}>
      {src ? <img src={src} alt={label ?? ""} className={s.cover} /> : <span className={s.photoEmpty}>{label}</span>}
      {children}
    </div>
  );
}

/**
 * The price + CTA. A fixed bottom bar on phones (as in the app); on desktop it
 * becomes the sticky summary card, where `extra` (lines, totals) is shown too.
 */
export function Bar({ summary, amount, extra, children }: { summary?: string; amount?: string; extra?: ReactNode; children: ReactNode }) {
  return (
    <div className={s.bar}>
      {extra && <div className={s.barExtra}>{extra}</div>}
      <div className={s.barRow}>
        {amount != null && (
          <div className={s.barPrice}>
            <span className={s.barSummary}>{summary ?? ""}</span>
            <span className={s.barAmount}>{amount}</span>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function LoadState({ error, onRetry, back }: { error: Error | null; onRetry?: () => void; back?: string }) {
  return (
    <div className={s.loadState}>
      {error ? (
        <>
          <span className={s.emptyIcon}>
            <Icon name="wifi-off" size={26} />
          </span>
          <h2 className={s.h2}>Couldn&apos;t load this</h2>
          <p className={s.text}>{error.message}</p>
          <div className={s.barActions}>
            {back && (
              <Link href={back} className={s.secondary}>
                Go back
              </Link>
            )}
            <button type="button" className={s.secondary} onClick={onRetry}>
              Try again
            </button>
          </div>
        </>
      ) : (
        <div className={s.skeleton} style={{ width: "100%", height: 360 }} />
      )}
    </div>
  );
}

// ---------- Sheets ----------

/** A bottom sheet on phones and a centred dialog from 640px. Escape and the backdrop close it. */
export function Sheet({ title, onClose, children, label }: { title?: string; onClose: () => void; children: ReactNode; label?: string }) {
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close.current();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, []);
  return (
    <div className={s.overlay} onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={label ?? title} className={s.sheet} onClick={(e) => e.stopPropagation()}>
        <span className={s.grabber} />
        <button type="button" aria-label="Close" onClick={onClose} className={s.sheetClose}>
          <Icon name="x" size={18} />
        </button>
        {title && <h2 className={s.sheetTitle}>{title}</h2>}
        {children}
      </div>
    </div>
  );
}

export type Notice = { title: string; body: string; action?: { label: string; danger?: boolean; run: () => void }; dismiss?: string; onDismiss?: () => void };

/** The web stand-in for the app's Alert.alert. */
export function NoticeSheet({ notice, onClose }: { notice: Notice; onClose: () => void }) {
  const dismiss = () => {
    onClose();
    notice.onDismiss?.();
  };
  return (
    <Sheet title={notice.title} onClose={dismiss}>
      <p className={s.text} style={{ fontSize: 15, lineHeight: "22px" }}>
        {notice.body}
      </p>
      <div className={s.sheetActions}>
        {notice.action && (
          <button
            type="button"
            className={cx(s.primary, s.primaryWide, notice.action.danger && s.danger)}
            style={{ justifyContent: "center", paddingRight: 24 }}
            onClick={() => {
              onClose();
              notice.action!.run();
            }}
          >
            {notice.action.label}
          </button>
        )}
        <button type="button" className={s.secondary} onClick={dismiss}>
          {notice.dismiss ?? "OK"}
        </button>
      </div>
    </Sheet>
  );
}

// ---------- Booking bits ----------

const STATUS_LABEL: Record<RentalBookingStatus, string> = {
  pending_payment: "AWAITING PAYMENT",
  confirmed: "ACTIVE",
  assigned: "ACTIVE",
  in_progress: "ON TRIP",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
};

export const isPastBooking = (st: RentalBookingStatus) => st === "completed" || st === "cancelled";

/** Yellow while a booking is live, quiet once it's done. */
export function StatusPill({ status }: { status: RentalBookingStatus }) {
  return (
    <span className={cx(s.pill, isPastBooking(status) && s.pillPast)}>
      <span className={s.pillDot} />
      {STATUS_LABEL[status]}
    </span>
  );
}

/** The chauffeur or captain on a booking, with a call button once they're assigned. */
export function CrewCard({ booking, live = true }: { booking: RentalBooking; live?: boolean }) {
  const { crew, listing } = booking;
  const role = listing.crewRole;
  const initials = crew
    ? crew.name
        .split(/\s+/)
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";
  const callable = live && !!crew?.phone;
  return (
    <div className={s.crew}>
      <span className={s.avatar}>{initials}</span>
      <div className={s.chipText} style={{ flex: 1 }}>
        <span className={cx(s.chipName, s.ellipsis)}>{crew ? `${crew.name} · ${role}` : `${role} assigned soon`}</span>
        <span className={cx(s.meta, s.ellipsis)}>{crew ? [listing.shortName, crew.detail].filter(Boolean).join(" · ") : "We'll message you their details before pickup"}</span>
      </div>
      <a
        href={callable ? `tel:${crew!.phone}` : undefined}
        aria-label={crew ? `Call ${crew.name}` : `${role} not assigned yet`}
        aria-disabled={!callable}
        className={cx(s.call, !callable && s.callOff)}
      >
        <Icon name="phone" size={18} />
      </a>
    </div>
  );
}
