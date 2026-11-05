"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { readDraft, writeDraft, type StoredDraft } from "@/lib/draft";
import { formatHour, formatNaira } from "@/lib/format";
import { isValidPhone, normalizePhone } from "@/lib/phone";
import { getListing } from "@/lib/rentals";
import type { BoatRates, RentalListing } from "@/lib/rentalModels";
import { BOAT_DAY_HOURS, RENTAL_MAX_ADVANCE_DAYS, RENTAL_MAX_HOURS, RENTAL_MIN_LEAD_MINUTES, boatCharters, tryQuote, ZONE_LABEL } from "@/lib/rentalPricing";
import { Bar, Icon, LoadState, Photo, PrimaryButton, Sheet, Shell, StepHead, cx, s, useRequest } from "./kit";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/** Pickup slots, 24-hour "HH:MM". */
const TIMES = ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];

const pad = (n: number) => String(n).padStart(2, "0");
const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromDayKey = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
};
const atTime = (day: string, time: string) => {
  const d = fromDayKey(day);
  const [h, m] = time.split(":").map(Number);
  d.setHours(h!, m!, 0, 0);
  return d;
};
const formatSlot = (t: string) => formatHour(Number(t.slice(0, 2)));
const bookable = (day: string, time: string) => atTime(day, time).getTime() >= Date.now() + RENTAL_MIN_LEAD_MINUTES * 60_000;
const lastDay = () => {
  const d = new Date();
  d.setDate(d.getDate() + RENTAL_MAX_ADVANCE_DAYS - 1);
  return dayKey(d);
};

/** The first day with a slot left, and its first slot. */
function firstSlot(): { day: string; time: string } {
  const d = new Date();
  for (let i = 0; i < 2; i++) {
    const day = dayKey(d);
    const time = TIMES.find((t) => bookable(day, t));
    if (time) return { day, time };
    d.setDate(d.getDate() + 1);
  }
  return { day: dayKey(d), time: TIMES[0]! };
}

export default function RentalBook({ slug }: { slug: string }) {
  const router = useRouter();
  const { data: listing, error, reload } = useRequest(() => getListing(slug), slug);
  const [draft, setDraft] = useState<StoredDraft | null | undefined>(undefined);

  // The draft is in sessionStorage, so it's read after mount; without one, start from the listing.
  useEffect(() => {
    const d = readDraft(slug);
    if (!d) router.replace(`/rentals/${slug}`);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage is only readable after hydration
    else setDraft(d);
  }, [slug, router]);

  return <Shell>{listing && draft ? <BookForm listing={listing} initial={draft} /> : <LoadState error={error} onRetry={reload} back={`/rentals/${slug}`} />}</Shell>;
}

function BookForm({ listing, initial }: { listing: RentalListing; initial: StoredDraft }) {
  const router = useRouter();
  const isBoat = listing.kind === "boat";
  const charters = isBoat ? boatCharters(listing.rates as BoatRates, listing.minHours) : [];
  const zone = isBoat ? undefined : (initial.zone ?? "island");
  const minHours = isBoat ? (charters[0] ?? 1) : zone === "interstate" ? 24 : 1;

  // A saved pickup that's no longer bookable falls back to the first open slot.
  const [initialSlot] = useState(() => {
    const saved = initial.pickupAt ? new Date(initial.pickupAt) : null;
    if (saved && bookable(dayKey(saved), `${pad(saved.getHours())}:${pad(saved.getMinutes())}`)) {
      return { day: dayKey(saved), time: `${pad(saved.getHours())}:${pad(saved.getMinutes())}` };
    }
    return firstSlot();
  });
  const [day, setDay] = useState(initialSlot.day);
  const [time, setTime] = useState(initialSlot.time);
  const [plan, setPlan] = useState(initial.plan);
  const [hours, setHours] = useState(initial.hours);
  const [hoursText, setHoursText] = useState(String(initial.hours));
  const [pickup, setPickup] = useState(initial.pickupAddress ?? (isBoat ? (listing.base ?? "") : ""));
  const [drop, setDrop] = useState(initial.dropoffAddress ?? "");
  const [note, setNote] = useState(initial.note ?? "");
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const quote = tryQuote(listing, { plan, hours, zone });
  const slotOk = bookable(day, time);
  const addressOk = pickup.trim().length >= 3;
  const phoneOk = isValidPhone(phone);
  const canContinue = !!quote && slotOk && addressOk && phoneOk;

  const setH = (v: number) => {
    const clamped = Math.max(minHours, Math.min(isBoat ? BOAT_DAY_HOURS : RENTAL_MAX_HOURS, v));
    // Boats charter in set lengths: snap to the next one on offer.
    const next = isBoat ? (charters.find((c) => c >= clamped) ?? charters[charters.length - 1]!) : clamped;
    setPlan("hours");
    setHours(next);
    setHoursText(String(next));
  };
  const step = (dir: 1 | -1) => {
    if (isBoat) {
      const i = charters.indexOf(hours);
      setH(charters[Math.max(0, Math.min(charters.length - 1, i + dir))]!);
    } else setH((plan === "airport" ? 3 : hours) + dir);
  };

  // The strip shows eight days from today, or around the picked day once it is further out.
  const strip = useMemo(() => {
    const first = new Date();
    const picked = fromDayKey(day);
    if ((picked.getTime() - first.getTime()) / 86_400_000 > 6) first.setTime(picked.getTime() - 3 * 86_400_000);
    return Array.from({ length: 8 }, (_, i) => {
      const d = new Date(first);
      d.setDate(first.getDate() + i);
      return d;
    });
  }, [day]);

  const quick: { label: string; on: boolean; go: () => void }[] = isBoat
    ? charters.map((h) => ({ label: h === BOAT_DAY_HOURS ? "Full day" : `${h} hrs`, on: hours === h, go: () => setH(h) }))
    : [
        ...(zone !== "interstate"
          ? [
              {
                label: "Airport",
                on: plan === "airport",
                go: () => {
                  setPlan("airport");
                  setHours(3);
                  setHoursText("3");
                },
              },
            ]
          : []),
        ...[6, 12, 24, 48, 72].filter((h) => h >= minHours).map((h) => ({ label: h > 24 ? `${h / 24} days` : `${h} hrs`, on: plan === "hours" && hours === h, go: () => setH(h) })),
      ];

  const next = () => {
    writeDraft(listing.slug, {
      plan,
      hours,
      zone,
      pickupAt: atTime(day, time).toISOString(),
      pickupAddress: pickup.trim(),
      dropoffAddress: drop.trim() || undefined,
      note: note.trim() || undefined,
      phone: normalizePhone(phone),
      // Changing the trip means a new booking attempt.
      attemptKey: undefined,
    });
    router.push(`/rentals/${listing.slug}/review`);
  };

  const quoteBox = quote && (
    <div className={s.quote}>
      {[...quote.lines, ...(quote.lines.length > 1 ? [{ label: "Rental total", amount: quote.rental }] : [])].map((l) => (
        <div key={l.label} className={s.quoteLine}>
          <span>{l.label}</span>
          <b>{formatNaira(l.amount)}</b>
        </div>
      ))}
      <p className={s.quoteNote}>
        {isBoat
          ? "The price you see is the price you pay. Charters are billed on the shortest length that covers your time."
          : "The price you see is the price you pay. Bookings over 24 hours are billed per day, with leftover hours on the best-fit tier."}
      </p>
    </div>
  );

  return (
    <>
      <StepHead back={`/rentals/${listing.slug}`} eyebrow="Step 1 of 2" title={`Book the ${listing.shortName}`} />
      <div className={s.split} style={{ marginTop: 20 }}>
        <div className={s.col}>
          <div className={cx(s.listingChip, s.mobOnly)}>
            <Photo src={listing.images[0]} label={listing.shortName} className={s.listingChipImg} />
            <div className={s.chipText}>
              <span className={cx(s.chipName, s.ellipsis)}>{listing.name}</span>
              <span className={cx(s.meta, s.ellipsis)}>
                {quote?.summary ?? ""} · {isBoat ? `${listing.crewRole} + fuel` : "Chauffeur + fuel"}
              </span>
            </div>
          </div>

          <div className={s.section}>
            <div className={s.sectionHead} style={{ alignItems: "center" }}>
              <h2 className={s.h2}>{isBoat ? "Departure date" : "Pickup date"}</h2>
              <button type="button" className={s.calBtn} onClick={() => setCalendarOpen(true)} aria-label="Open calendar">
                <Icon name="calendar" size={18} />
                {MONTHS[fromDayKey(day).getMonth()]!.slice(0, 3)}
              </button>
            </div>
            <div className={s.days}>
              {strip.map((d) => {
                const k = dayKey(d);
                const on = k === day;
                const open = TIMES.some((t) => bookable(k, t)) && k <= lastDay();
                return (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={on}
                    aria-label={`${DOW[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`}
                    disabled={!open}
                    onClick={() => {
                      setDay(k);
                      if (!bookable(k, time)) setTime(TIMES.find((t) => bookable(k, t)) ?? time);
                    }}
                    className={cx(s.day, on && s.dayOn)}
                  >
                    <span className={s.dow}>{DOW[d.getDay()]}</span>
                    <span className={s.dnum}>{d.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={s.section}>
            <h2 className={s.h2}>{isBoat ? "Departure time" : "Pickup time"}</h2>
            <div className={s.times}>
              {TIMES.map((t) => {
                const ok = bookable(day, t);
                return (
                  <button key={t} type="button" aria-pressed={t === time} disabled={!ok} onClick={() => setTime(t)} className={cx(s.time, t === time && ok && s.timeOn)}>
                    {formatSlot(t)}
                  </button>
                );
              })}
            </div>
            {!slotOk && <p className={s.err}>Pick a time at least an hour from now.</p>}
          </div>

          <div className={s.section}>
            <div className={s.sectionHead}>
              <h2 className={s.h2}>{isBoat ? "How long on the water?" : "How long do you need it?"}</h2>
              {zone && <span className={s.meta}>{ZONE_LABEL[zone]} rates</span>}
            </div>
            <div className={s.stepper}>
              <button type="button" aria-label="Fewer hours" onClick={() => step(-1)} className={s.stepBtn} disabled={plan === "hours" && hours <= minHours}>
                −
              </button>
              <div className={s.stepValue}>
                {plan === "airport" ? (
                  <span className={s.airportRun}>Airport run</span>
                ) : (
                  <>
                    <input
                      aria-label="Rental hours"
                      value={hoursText}
                      inputMode="numeric"
                      readOnly={isBoat}
                      onChange={(e) => setHoursText(e.target.value.replace(/\D/g, "").slice(0, 3))}
                      onBlur={() => setH(Number(hoursText) || minHours)}
                      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                      className={s.hoursInput}
                    />
                    <span className={s.hoursUnit}>{hours === 1 ? "hour" : "hours"}</span>
                  </>
                )}
              </div>
              <button type="button" aria-label="More hours" onClick={() => step(1)} className={cx(s.stepBtn, s.stepBtnInk)}>
                +
              </button>
            </div>
            <div className={s.quick}>
              {quick.map((q) => (
                <button key={q.label} type="button" aria-pressed={q.on} onClick={q.go} className={cx(s.quickBtn, q.on && s.quickOn)}>
                  {q.label}
                </button>
              ))}
            </div>
            <div className={s.mobOnly} style={{ display: "block" }}>
              {quoteBox}
            </div>
          </div>

          <div className={s.section}>
            <h2 className={s.h2}>{isBoat ? "Where do you board?" : "Where should we pick you up?"}</h2>
            {isBoat ? (
              <div className={cx(s.field, s.fieldStatic)}>{pickup}</div>
            ) : (
              <>
                <input value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="Pickup address" aria-label="Pickup address" maxLength={200} autoComplete="street-address" className={s.field} />
                <input value={drop} onChange={(e) => setDrop(e.target.value)} placeholder="Drop-off (optional)" aria-label="Drop-off address" maxLength={200} className={s.field} />
              </>
            )}
          </div>

          <div className={s.section}>
            <h2 className={s.h2}>Your phone number</h2>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => setPhoneTouched(true)}
              placeholder="e.g. 0803 123 4567"
              aria-label="Phone number"
              aria-invalid={phoneTouched && !phoneOk}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={20}
              className={s.field}
            />
            {phoneTouched && !phoneOk ? (
              <p className={s.err}>Enter a phone number we can reach you on, like 0803 123 4567.</p>
            ) : (
              <p className={s.meta}>Your {listing.crewRole.toLowerCase()} calls this number on the day.</p>
            )}
          </div>

          <div className={s.section}>
            <h2 className={s.h2}>Note for your {listing.crewRole.toLowerCase()}</h2>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={isBoat ? "e.g. Birthday cake on board, a stop at Tarkwa Bay" : "e.g. Gate code, extra stop"}
              aria-label="Note"
              maxLength={200}
              className={s.field}
            />
          </div>
        </div>

        <aside className={s.aside}>
          <Bar
            summary={quote?.summary}
            amount={quote ? `${formatNaira(quote.rental)}${quote.fromPrice ? "+" : ""}` : "—"}
            extra={
              <>
                <div className={s.listingChip} style={{ boxShadow: "none", padding: 0 }}>
                  <Photo src={listing.images[0]} label={listing.shortName} className={s.listingChipImg} />
                  <div className={s.chipText}>
                    <span className={cx(s.chipName, s.ellipsis)}>{listing.name}</span>
                    <span className={cx(s.meta, s.ellipsis)}>{isBoat ? `${listing.crewRole} + fuel` : "Chauffeur + fuel"}</span>
                  </div>
                </div>
                {slotOk && <span className={s.meta}>{`${DOW[fromDayKey(day).getDay()]} ${fromDayKey(day).getDate()} ${MONTHS[fromDayKey(day).getMonth()]!.slice(0, 3)} · ${formatSlot(time)}`}</span>}
                {quoteBox}
              </>
            }
          >
            <PrimaryButton label="Continue" disabled={!canContinue} onClick={next} />
          </Bar>
          {!canContinue && quote && slotOk && (
            <p className={cx(s.meta, s.deskOnly)} style={{ justifyContent: "center" }}>
              {!addressOk && !phoneOk ? "Add a pickup address and phone number to continue" : !addressOk ? "Add a pickup address to continue" : "Add your phone number to continue"}
            </p>
          )}
        </aside>
      </div>

      {calendarOpen && (
        <CalendarSheet
          value={day}
          isBoat={isBoat}
          onClose={() => setCalendarOpen(false)}
          onPick={(k) => {
            setDay(k);
            if (!bookable(k, time)) setTime(TIMES.find((t) => bookable(k, t)) ?? time);
          }}
          isOpenDay={(k) => k <= lastDay() && TIMES.some((t) => bookable(k, t))}
        />
      )}
    </>
  );
}

/** Month grid for picking a day further out than the strip shows. */
function CalendarSheet({ value, isBoat, onClose, onPick, isOpenDay }: { value: string; isBoat: boolean; onClose: () => void; onPick: (day: string) => void; isOpenDay: (day: string) => boolean }) {
  const picked = fromDayKey(value);
  const [view, setView] = useState({ y: picked.getFullYear(), m: picked.getMonth() });
  const today = dayKey(new Date());
  const now = new Date();
  const canPrev = view.y > now.getFullYear() || view.m > now.getMonth();
  const last = fromDayKey(lastDay());
  const canNext = view.y < last.getFullYear() || view.m < last.getMonth();
  const lead = new Date(view.y, view.m, 1).getDay();
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (string | null)[] = [...Array<null>(lead).fill(null), ...Array.from({ length: days }, (_, i) => dayKey(new Date(view.y, view.m, i + 1)))];
  const shift = (dir: 1 | -1) => setView(({ y, m }) => (m + dir < 0 ? { y: y - 1, m: 11 } : m + dir > 11 ? { y: y + 1, m: 0 } : { y, m: m + dir }));

  return (
    <Sheet onClose={onClose} label="Pick a date">
      <div className={s.calHead} style={{ paddingRight: 44 }}>
        <div className={s.stepHeadText}>
          <span className={s.eyebrow}>{isBoat ? "Departure date" : "Pickup date"}</span>
          <span className={s.sheetTitle}>
            {MONTHS[view.m]} {view.y}
          </span>
        </div>
        <div className={s.calNav}>
          <button type="button" aria-label="Previous month" disabled={!canPrev} onClick={() => shift(-1)} className={s.calArrow}>
            <Icon name="arrow-left" size={18} />
          </button>
          <button type="button" aria-label="Next month" disabled={!canNext} onClick={() => shift(1)} className={cx(s.calArrow, s.calArrowInk)}>
            <Icon name="arrow-right" size={18} />
          </button>
        </div>
      </div>
      <div className={s.calGrid}>
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((w) => (
          <span key={w} className={s.calDow}>
            {w}
          </span>
        ))}
        {cells.map((k, i) => {
          if (!k) return <span key={`lead-${i}`} className={s.calCell} />;
          const open = isOpenDay(k);
          const on = k === value;
          return (
            <span key={k} className={s.calCell}>
              <button type="button" aria-pressed={on} disabled={!open} onClick={() => onPick(k)} className={cx(s.calDay, on ? s.calOn : k === today && s.calToday)}>
                {Number(k.slice(8))}
              </button>
            </span>
          );
        })}
      </div>
      <div className={s.legend}>
        <span>
          <i style={{ boxShadow: "inset 0 0 0 1.5px #121212" }} />
          Today
        </span>
        <span>
          <i style={{ background: "#FFD60A" }} />
          Selected
        </span>
      </div>
      <PrimaryButton wide label={`${isBoat ? "Depart" : "Pick up"} ${DOW[picked.getDay()]} ${picked.getDate()} ${MONTHS[picked.getMonth()]!.slice(0, 3)}`} onClick={onClose} />
    </Sheet>
  );
}
