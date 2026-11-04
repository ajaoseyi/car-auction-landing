"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { isRegistered, useAuth } from "@/lib/auth";
import { formatNaira, formatPickup } from "@/lib/format";
import { rentals } from "@/lib/rentals";
import type { RentalBooking } from "@/lib/rentalModels";
import { RENTAL_LATE_CANCEL_BPS, RENTAL_LATE_CANCEL_MINUTES, ZONE_LABEL } from "@/lib/rentalPricing";
import { CONTACT_EMAIL } from "../LegalPage";
import { SignInSheet } from "./SignInSheet";
import {
  BackButton,
  Bar,
  CrewCard,
  Icon,
  LoadState,
  NoticeSheet,
  Photo,
  PrimaryButton,
  Row,
  Segmented,
  Shell,
  StatusPill,
  cx,
  isPastBooking,
  s,
  useRequest,
  type Notice,
} from "./kit";

/** Opens support (NEXT_PUBLIC_SUPPORT_URL: mailto: or wa.me) with `subject` prefilled, as the app's contactSupport does. */
function contactSupport(subject: string) {
  const base = process.env.NEXT_PUBLIC_SUPPORT_URL || `mailto:${CONTACT_EMAIL}`;
  const param = base.startsWith("mailto:") ? "subject" : base.includes("wa.me") ? "text" : null;
  const url = param ? `${base}${base.includes("?") ? "&" : "?"}${param}=${encodeURIComponent(subject)}` : base;
  if (base.startsWith("mailto:")) window.location.href = url;
  else window.open(url, "_blank", "noopener");
}

/** Booking pages need an account; this shows sign-in instead until there is one. */
function SignedIn({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const [open, setOpen] = useState(false);
  if (status === "loading") return <LoadState error={null} />;
  if (!isRegistered(user))
    return (
      <div className={s.empty} style={{ minHeight: "55vh", justifyContent: "center" }}>
        <span className={s.emptyIcon}>
          <Icon name="calendar-check" size={26} />
        </span>
        <h1 className={s.h2} style={{ fontSize: 22 }}>
          Sign in to see your bookings
        </h1>
        <p className={s.text}>Use the email you booked with.</p>
        <div style={{ marginTop: 10 }}>
          <PrimaryButton label="Sign in" onClick={() => setOpen(true)} />
        </div>
        {open && <SignInSheet onClose={() => setOpen(false)} />}
      </div>
    );
  return <>{children}</>;
}

// ---------- Confirmed ----------

export function BookingConfirmed({ id }: { id: string }) {
  return (
    <Shell>
      <SignedIn>
        <Confirmed id={id} />
      </SignedIn>
    </Shell>
  );
}

function Confirmed({ id }: { id: string }) {
  const { data: b, error, reload } = useRequest(() => rentals.booking(id), id);
  if (!b) return <LoadState error={error} onRetry={reload} back="/bookings" />;
  const isBoat = b.listing.kind === "boat";
  return (
    <div className={s.confirmedLayout}>
      <div className={s.confirmed}>
        <span className={s.paidBadge}>
          <Icon name={isBoat ? "sailboat" : "car"} size={50} />
          <span className={s.paidTick}>
            <Icon name="check" size={18} />
          </span>
        </span>
        <span className={s.eyebrow} style={{ marginTop: 14, color: "#9A9993", letterSpacing: "0.06em" }}>
          Booking confirmed
        </span>
        <h1 className={s.bigTitle}>You&apos;re booked.</h1>
        <p className={s.lead}>
          {isBoat
            ? "Your boat is cleaned and checked before every charter. Your captain will message you 30 minutes before departure."
            : "Your car is cleaned and checked before every trip. Your driver will message you 30 minutes before pickup. Ride clean."}
        </p>
      </div>
      <div className={s.confirmedCard}>
        <CrewCard booking={b} />
        <div className={s.rows} style={{ marginTop: 6 }}>
          <Row label={isBoat ? "Departs" : "Pickup"} value={formatPickup(b.pickupAt)} />
          <Row label="Booking" value={b.summary} />
          <Row label="Total paid" value={formatNaira(b.total)} />
          <Row label="Reference" value={b.ref} />
        </div>
        <div style={{ marginTop: 12 }}>
          <PrimaryButton wide label="View booking" href={`/bookings/${b.id}`} />
        </div>
      </div>
    </div>
  );
}

// ---------- My bookings ----------

export function MyBookings() {
  return (
    <Shell>
      <SignedIn>
        <BookingList />
      </SignedIn>
    </Shell>
  );
}

function BookingList() {
  const [tab, setTab] = useState<"active" | "past">("active");
  const { data, error, reload } = useRequest(() => rentals.myBookings(), "all");
  const all = data ?? [];
  const active = all.filter((b) => !isPastBooking(b.status));
  const past = all.filter((b) => isPastBooking(b.status));
  const shown = tab === "active" ? active : past;

  return (
    <div className={s.col} style={{ paddingTop: 18 }}>
      <div className={s.stepHead} style={{ paddingTop: 0 }}>
        <BackButton href="/" />
      </div>
      <div className={s.titleBlock}>
        <span className={s.eyebrow} style={{ color: "#9A9993", letterSpacing: "0.06em" }}>
          Rentals
        </span>
        <h1 className={s.h1}>My bookings</h1>
      </div>
      <div style={{ maxWidth: 420 }}>
        <Segmented
          look="ink"
          label="Bookings"
          value={tab}
          onChange={setTab}
          options={[
            { key: "active", label: "Active", count: data ? active.length : undefined },
            { key: "past", label: "Completed", count: data ? past.length : undefined },
          ]}
        />
      </div>
      {!data ? (
        <LoadState error={error} onRetry={reload} />
      ) : shown.length ? (
        <div className={s.bookingList}>
          {shown.map((b) => (
            <BookingCard key={b.id} booking={b} />
          ))}
        </div>
      ) : (
        <div className={s.empty}>
          <span className={s.emptyIcon}>
            <Icon name="calendar" size={26} />
          </span>
          <h2 className={s.h2}>{tab === "active" ? "No trips booked" : "Nothing here yet"}</h2>
          <p className={s.text}>{tab === "active" ? "Book a chauffeured car or a boat from the fleet." : "Finished and cancelled bookings show up here."}</p>
          {tab === "active" && (
            <div style={{ marginTop: 10 }}>
              <PrimaryButton label="Browse the fleet" href="/#rent" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking: b }: { booking: RentalBooking }) {
  const past = isPastBooking(b.status);
  return (
    <Link href={`/bookings/${b.id}`} className={s.bookingCard} aria-label={`${b.listing.name}, ${formatPickup(b.pickupAt)}`}>
      <Photo src={b.listing.image} label={b.listing.shortName} className={s.bookingImg}>
        {past && <span className={s.fade} />}
        <span className={s.cardPill}>
          <StatusPill status={b.status} />
        </span>
        <span className={s.ref}>{b.ref}</span>
      </Photo>
      <div className={s.bookingFoot}>
        <div className={s.bookingInfo}>
          <span className={cx(s.bookingName, s.ellipsis)}>{b.listing.name}</span>
          <span className={s.bookingWhen}>
            <Icon name="calendar" size={14} />
            {formatPickup(b.pickupAt)}
          </span>
          <span className={s.meta} style={{ fontWeight: 400 }}>
            {b.summary} · {formatNaira(b.total)}
          </span>
        </div>
        <span className={cx(s.disc, past && s.discMuted)}>
          <Icon name="arrow-up-right" size={18} />
        </span>
      </div>
    </Link>
  );
}

// ---------- One booking ----------

/** How far along the trip is: 0 waiting on payment, 1 paid, 2 crew assigned, 3 under way, 4 done. */
const STAGE: Record<RentalBooking["status"], number> = { pending_payment: 0, confirmed: 1, assigned: 2, in_progress: 3, completed: 4, cancelled: 0 };

/** The late fee the server will keep, so the confirm dialog can say it upfront. */
function lateFee(b: RentalBooking) {
  if (b.status === "pending_payment") return 0;
  const late = new Date(b.pickupAt).getTime() - Date.now() < RENTAL_LATE_CANCEL_MINUTES * 60_000;
  return late ? Math.floor((b.total * RENTAL_LATE_CANCEL_BPS) / 10_000) : 0;
}

export function BookingDetail({ id }: { id: string }) {
  return (
    <Shell>
      <SignedIn>
        <Detail id={id} />
      </SignedIn>
    </Shell>
  );
}

function Detail({ id }: { id: string }) {
  const { data: b, error, reload, setData } = useRequest(() => rentals.booking(id), id);
  const [cancelling, setCancelling] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  if (!b) return <LoadState error={error} onRetry={reload} back="/bookings" />;

  const isBoat = b.listing.kind === "boat";
  const past = isPastBooking(b.status);
  const cancelled = b.status === "cancelled";
  const stage = STAGE[b.status];
  const steps = isBoat ? ["Booked & paid", "Captain assigned", "Boarding", "Back at the jetty"] : ["Booked & paid", "Chauffeur assigned", "Picked up", "Dropped off"];
  const subs = [b.status === "pending_payment" ? "Waiting for your payment" : "Confirmed", b.crew?.name ?? "Pending", formatPickup(b.pickupAt), b.status === "completed" ? "Trip complete" : "Pending"];
  const canCancel = b.status === "pending_payment" || b.status === "confirmed" || b.status === "assigned";

  const cancel = () => {
    const fee = lateFee(b);
    const back = b.status === "pending_payment" ? null : b.total - fee;
    setNotice({
      title: "Cancel this booking?",
      body:
        back == null
          ? "Nothing has been charged yet."
          : fee
            ? `It's within an hour of pickup, so a ${formatNaira(fee)} fee applies. ${formatNaira(back)} goes back to your CarLot credit.`
            : `${formatNaira(back)} goes back to your CarLot credit. Refund it to your card any time from your wallet in the CarLot app.`,
      dismiss: "Keep booking",
      action: {
        label: "Cancel booking",
        danger: true,
        run: async () => {
          setCancelling(true);
          try {
            setData(await rentals.cancel(b.id));
          } catch (err) {
            setNotice({ title: "Couldn't cancel", body: (err as Error).message || "Please try again." });
          } finally {
            setCancelling(false);
          }
        },
      },
    });
  };

  const details = [
    { label: isBoat ? "Departs" : "Pickup", value: b.pickupAddress },
    { label: isBoat ? "Returns to" : "Drop-off", value: b.dropoffAddress ?? (isBoat ? b.pickupAddress : "As you go") },
    { label: "Duration", value: b.plan === "airport" ? "Airport run" : `${b.hours} hrs` },
    ...(b.zone ? [{ label: "Zone", value: ZONE_LABEL[b.zone] }] : []),
    { label: "Included", value: isBoat ? `${b.listing.crewRole}, fuel, life jackets` : "Chauffeur, fuel, 1 free stop" },
    ...(b.note ? [{ label: "Note", value: b.note }] : []),
  ];

  const payment = (
    <div className={s.section}>
      <h2 className={s.h2}>Payment</h2>
      <Row label="Rental" value={formatNaira(b.rental)} />
      <Row label="VAT (7.5%)" value={formatNaira(b.vat)} />
      <div className={s.totalRow}>
        <span className={s.totalLabel}>{b.paidAt ? "Total paid" : "Total"}</span>
        <span className={s.totalValue}>{formatNaira(b.total)}</span>
      </div>
      {b.paidVia && <span className={s.meta}>Paid via {b.paidVia}</span>}
    </div>
  );

  return (
    <div className={s.split}>
      <div className={s.col}>
        <Photo src={b.listing.image} label={b.listing.shortName} className={s.bookingHero}>
          {past && <span className={s.fade} />}
          <span className={s.bookingHeroTop}>
            <BackButton href="/bookings" />
            <StatusPill status={b.status} />
          </span>
        </Photo>

        <div className={s.titleBlock}>
          <span className={s.specs}>
            {b.ref} · {isBoat ? "Boat" : "Car"}
          </span>
          <h1 className={s.h1} style={{ fontSize: 28 }}>
            {b.listing.name}
          </h1>
        </div>

        <div className={s.pickupCard}>
          <div className={s.stepHeadText} style={{ gap: 4 }}>
            <span className={s.pickupLabel}>{cancelled ? "CANCELLED" : past ? "COMPLETED" : isBoat ? "BOARDING" : "PICKUP"}</span>
            <span className={s.pickupWhen}>{formatPickup(b.pickupAt)}</span>
          </div>
          <span className={s.summaryChip}>{b.summary}</span>
        </div>

        {cancelled ? (
          <div className={s.notice}>
            <span className={s.h2} style={{ fontSize: 15 }}>
              {b.refundedToCredit != null ? `${formatNaira(b.refundedToCredit)} back in your CarLot credit` : "Cancelled before payment"}
            </span>
            <p className={s.text}>
              {b.cancellationFee ? `A ${formatNaira(b.cancellationFee)} late-cancellation fee applied. ` : ""}
              {b.refundedToCredit != null ? "Use it on another booking or refund it to your card from your wallet in the CarLot app." : "Nothing was charged."}
            </p>
          </div>
        ) : (
          <div className={s.section}>
            <h2 className={s.h2} style={{ marginBottom: 2 }}>
              Trip progress
            </h2>
            <div className={s.progress}>
              {steps.map((t, i) => {
                const done = i < stage;
                const current = !past && i === Math.max(stage, 1) && !done;
                return (
                  <div key={t} className={s.pStep}>
                    <div className={s.pRail}>
                      <span className={cx(s.pDot, done && s.pDotDone, current && s.pDotNow)}>{done && "✓"}</span>
                      {i < steps.length - 1 && <span className={cx(s.pLine, done && i + 1 < stage && s.pLineDone)} />}
                    </div>
                    <div className={s.pText}>
                      <span className={cx(s.pTitle, (done || current) && s.pTitleOn)}>{t}</span>
                      <span className={s.meta} style={{ fontWeight: 400 }}>
                        {subs[i]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!cancelled && <CrewCard booking={b} live={!past} />}

        <div className={s.section}>
          <h2 className={s.h2}>Trip details</h2>
          {details.map((d) => (
            <Row key={d.label} label={d.label} value={d.value} />
          ))}
        </div>

        <div className={s.mobOnly}>{payment}</div>
      </div>

      <aside className={s.aside}>
        <Bar extra={payment}>
          <div className={s.barActions} style={{ width: "100%" }}>
            {canCancel ? (
              <button type="button" onClick={cancel} disabled={cancelling} className={s.secondary}>
                {cancelling ? "Cancelling…" : "Cancel"}
              </button>
            ) : (
              <button type="button" onClick={() => contactSupport(`Help with booking ${b.ref}`)} className={s.secondary}>
                Get help
              </button>
            )}
            {past ? (
              <PrimaryButton wide label="Book this again" href={`/rentals/${b.listing.id}`} />
            ) : b.status === "pending_payment" ? (
              <PrimaryButton wide label="Check payment" onClick={reload} icon="refresh-cw" />
            ) : (
              <PrimaryButton wide label={isBoat ? "Add hours" : "Add more time"} onClick={() => contactSupport(`More time on booking ${b.ref}`)} />
            )}
          </div>
        </Bar>
      </aside>

      {notice && <NoticeSheet notice={notice} onClose={() => setNotice(null)} />}
    </div>
  );
}
