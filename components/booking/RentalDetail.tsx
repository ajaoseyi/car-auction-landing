"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { readDraft, writeDraft } from "@/lib/draft";
import { formatNaira } from "@/lib/format";
import { getListing } from "@/lib/rentals";
import type { BoatRates, RentalListing, RentalZone, VehicleRates } from "@/lib/rentalModels";
import { BOAT_DAY_HOURS, boatCharters, tryQuote, ZONE_LABEL } from "@/lib/rentalPricing";
import { BackButton, Bar, Icon, LoadState, Photo, PrimaryButton, Segmented, Shell, cx, s, useRequest } from "./kit";

type Duration = "airport" | "6" | "12" | "24";

const VEHICLE_RULES = [
  "One free stop of up to 20 minutes is included. Extra stops are 50% of the hourly rate.",
  "Need more time? Extra hours are 15% of your booking rate, per hour.",
  "Cancelling within 60 minutes of pickup costs 25% of the booking.",
  "To change your pickup, tell us at least 60 minutes before.",
];
const BOAT_RULES = [
  "Board up to 15 minutes before departure; the charter starts at the booked time.",
  "Extra time on the water is billed per hour at your charter's rate.",
  "Cancelling within 60 minutes of departure costs 25% of the booking.",
  "Weather may delay or reschedule departure. If we cancel, it all goes back to your credit.",
];

export default function RentalDetail({ slug }: { slug: string }) {
  const { data: listing, error, reload } = useRequest(() => getListing(slug), slug);
  return <Shell>{listing ? <Detail listing={listing} /> : <LoadState error={error} onRetry={reload} back="/#rent" />}</Shell>;
}

function Detail({ listing }: { listing: RentalListing }) {
  const router = useRouter();
  const isBoat = listing.kind === "boat";
  const charters = isBoat ? boatCharters(listing.rates as BoatRates, listing.minHours) : [];
  const [photo, setPhoto] = useState(0);
  const [duration, setDuration] = useState<Duration>("6");
  const [zone, setZone] = useState<RentalZone>("island");
  const [charter, setCharter] = useState(charters[0] ?? 2);

  const images = listing.images.length ? listing.images : [""];
  const n = images.length;
  // Interstate is booked by the day; picking a shorter duration falls back to the island.
  const interstateOnline = !isBoat && (listing.rates as VehicleRates).h24.interstate != null;
  const interstateOk = interstateOnline && duration === "24";
  const effectiveZone: RentalZone = zone === "interstate" && !interstateOk ? "island" : zone;
  const plan = !isBoat && duration === "airport" ? "airport" : "hours";
  const hours = isBoat ? charter : duration === "airport" ? 3 : Number(duration);
  const quote = tryQuote(listing, { plan, hours, zone: isBoat ? undefined : effectiveZone });

  const fuel = isBoat
    ? `Departs from ${listing.base ?? "the marina"}. Fuel for the agreed route is included.`
    : effectiveZone === "interstate"
      ? "One full tank at departure from Lagos. Refuelling after that is on you. Interstate prices are starting rates."
      : duration === "airport"
        ? "Pickup to drop-off, typically 1–3 hours. Fuel is included."
        : "Fuel is included for your booked itinerary.";

  const book = () => {
    // Keep pickup details from an earlier visit; the plan comes from this screen.
    const prev = readDraft(listing.slug);
    writeDraft(listing.slug, { ...prev, plan, hours, zone: isBoat ? undefined : effectiveZone, attemptKey: undefined });
    router.push(`/rentals/${listing.slug}/book`);
  };

  const pickers = (
    <>
      <div className={s.section}>
        <h2 className={s.h2}>{isBoat ? "How long on the water?" : "How long do you need it?"}</h2>
        {isBoat ? (
          <Segmented
            label="Charter length"
            value={String(charter)}
            onChange={(k) => setCharter(Number(k))}
            options={charters.map((h) => ({ key: String(h), label: h === BOAT_DAY_HOURS ? "Full day" : `${h} hrs` }))}
          />
        ) : (
          <Segmented
            label="Duration"
            value={duration}
            onChange={setDuration}
            options={[
              { key: "airport", label: "Airport" },
              { key: "6", label: "6 hrs" },
              { key: "12", label: "12 hrs" },
              { key: "24", label: "24 hrs" },
            ]}
          />
        )}
      </div>
      {!isBoat && (
        <div className={s.section}>
          <h2 className={s.h2}>Where are you going?</h2>
          <Segmented
            label="Zone"
            value={effectiveZone}
            onChange={setZone}
            options={(["island", "outskirts", "interstate"] as const).map((z) => ({ key: z, label: ZONE_LABEL[z], disabled: z === "interstate" && !interstateOk }))}
          />
        </div>
      )}
      <p className={s.text}>{fuel}</p>
      {!isBoat && !interstateOnline && <p className={s.text}>Interstate trips for this car are on request. Message us and we&apos;ll quote your route.</p>}
    </>
  );

  return (
    <div className={s.split}>
      <div className={s.col}>
        <div>
          <Photo src={images[photo] || null} label={listing.shortName} className={s.hero}>
            <button type="button" aria-label="Previous photo" className={s.heroNav} style={{ left: 0 }} onClick={() => setPhoto((photo - 1 + n) % n)} />
            <button type="button" aria-label="Next photo" className={s.heroNav} style={{ right: 0 }} onClick={() => setPhoto((photo + 1) % n)} />
            <span className={s.heroBack}>
              <BackButton href="/#rent" />
            </span>
            {listing.badge === "hot" && <span className={s.hot}>HOT</span>}
            {n > 1 && (
              <span className={s.counter}>
                {photo + 1} / {n}
              </span>
            )}
          </Photo>
        </div>
        {n > 1 && (
          <div className={s.thumbs}>
            {images.map((src, i) => (
              <button key={src + i} type="button" aria-label={`Photo ${i + 1}`} onClick={() => setPhoto(i)} className={cx(s.thumb, i === photo && s.thumbOn)}>
                <Photo src={src} className={s.cover} />
              </button>
            ))}
          </div>
        )}

        <div className={s.titleBlock}>
          <span className={s.specs}>{listing.specs}</span>
          <h1 className={s.h1}>{listing.name}</h1>
        </div>

        <div className={s.perks}>
          {listing.perks.map((perk) => (
            <div key={perk} className={s.perk}>
              <span className={s.tick}>✓</span>
              {perk}
            </div>
          ))}
        </div>

        <div className={cx(s.col, s.mobOnly)} style={{ gap: 20 }}>
          {pickers}
        </div>

        <div className={s.section}>
          <h2 className={s.h2}>Everything upfront</h2>
          <ul className={s.rules}>
            {(isBoat ? BOAT_RULES : VEHICLE_RULES).map((rule) => (
              <li key={rule} className={s.rule}>
                <span className={s.ruleDot} />
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <aside className={s.aside}>
        <Bar
          summary={quote?.summary}
          amount={quote ? `${formatNaira(quote.rental)}${quote.fromPrice ? "+" : ""}` : "—"}
          extra={
            <>
              <span className={s.eyebrow}>{isBoat ? `${listing.crewRole} + fuel included` : "Chauffeur + fuel included"}</span>
              {pickers}
            </>
          }
        >
          <PrimaryButton label="Book now" disabled={!quote} onClick={book} />
        </Bar>
        <p className={cx(s.secure, s.deskOnly)}>
          <Icon name="lock" size={14} />
          Pay securely with Paystack. VAT added at checkout.
        </p>
      </aside>
    </div>
  );
}
