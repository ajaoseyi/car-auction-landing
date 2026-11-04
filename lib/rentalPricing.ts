// A copy of quoteRental in the backend's packages/contracts (rentals.ts), so
// prices update as the user taps. The server reprices every booking with the
// same rules; keep the two in step.
import type { BoatRates, RentalKind, RentalPlan, RentalZone, VehicleRates } from "./rentalModels";

export const RENTAL_VAT_BPS = 750;
export const RENTAL_LATE_CANCEL_MINUTES = 60;
export const RENTAL_LATE_CANCEL_BPS = 2500;
export const RENTAL_MIN_LEAD_MINUTES = 60;
export const RENTAL_MAX_ADVANCE_DAYS = 90;
export const RENTAL_MAX_HOURS = 168;
export const RENTAL_AIRPORT_HOURS = 3;
export const BOAT_DAY_HOURS = 8;

export type RentalQuoteLine = { label: string; amount: number };

export type RentalQuote = {
  plan: RentalPlan;
  hours: number;
  zone: RentalZone | null;
  summary: string;
  lines: RentalQuoteLine[];
  rental: number;
  vat: number;
  total: number;
  fromPrice: boolean;
};

export class RentalQuoteError extends Error {}

export const ZONE_LABEL: Record<RentalZone, string> = { island: "Island", outskirts: "Outskirts", interstate: "Interstate" };
const hrs = (n: number) => `${n} ${n === 1 ? "hr" : "hrs"}`;

export const rentalVat = (rental: number) => Math.round((rental * RENTAL_VAT_BPS) / 10_000);

type Priceable = { kind: RentalKind; minHours: number; rates: VehicleRates | BoatRates };

/**
 * Prices a booking from a listing's rate card. Vehicles: bookings over 24
 * hours are billed per day, with leftover hours on the best-fit tier (6, 12
 * or 24). Boats: the shortest charter that covers the hours.
 */
export function quoteRental(listing: Priceable, input: { plan?: RentalPlan; hours: number; zone?: RentalZone }): RentalQuote {
  const plan = input.plan ?? "hours";
  const hours = input.hours;
  if (!Number.isInteger(hours) || hours < 1 || hours > RENTAL_MAX_HOURS) throw new RentalQuoteError("Pick between 1 and 168 hours.");
  const lines: RentalQuoteLine[] = [];

  if (listing.kind === "boat") {
    const r = listing.rates as BoatRates;
    if (plan !== "hours") throw new RentalQuoteError("Boats are chartered by the hour.");
    if (hours < listing.minHours) throw new RentalQuoteError(`This boat's shortest charter is ${hrs(listing.minHours)}.`);
    if (hours > BOAT_DAY_HOURS) throw new RentalQuoteError(`Charters run up to ${BOAT_DAY_HOURS} hours.`);
    const tiers: [number, number | null][] = [[2, r.h2], [3, r.h3], [4, r.h4], [BOAT_DAY_HOURS, r.day]];
    const [tierHours, price] = tiers.find(([h, p]) => h >= hours && p != null)!;
    const label = tierHours === BOAT_DAY_HOURS ? "Full day charter" : `${hrs(tierHours)} charter`;
    lines.push({ label: tierHours === hours ? label : `${hrs(hours)} → ${label.toLowerCase()}`, amount: price! });
    return done(plan, tierHours, null, label, lines, false);
  }

  const r = listing.rates as VehicleRates;
  const zone = input.zone ?? "island";
  if (plan === "airport") {
    if (zone === "interstate") throw new RentalQuoteError("Airport runs are within Lagos.");
    lines.push({ label: "Airport run", amount: r.airport[zone] });
    return done(plan, RENTAL_AIRPORT_HOURS, zone, `Airport run · ${ZONE_LABEL[zone]}`, lines, false);
  }
  if (zone === "interstate" && hours < 24) throw new RentalQuoteError("Interstate trips are booked for 24 hours or more.");
  const fullDays = Math.floor(hours / 24);
  const rem = hours % 24;
  if (fullDays) lines.push({ label: `${fullDays} × 24 hrs`, amount: fullDays * r.h24[zone] });
  if (rem) {
    // Leftover hours on an interstate trip are billed at outskirts rates, except a near-full day.
    const tier = rem <= 6 ? 6 : rem <= 12 ? 12 : 24;
    const z = zone === "interstate" && tier !== 24 ? "outskirts" : zone;
    const amount = tier === 6 ? r.h6[z as "island" | "outskirts"] : tier === 12 ? r.h12[z as "island" | "outskirts"] : r.h24[z];
    lines.push({ label: rem === tier ? `${tier} hrs rate` : `${hrs(rem)} → ${tier} hrs rate`, amount });
  }
  return done(plan, hours, zone, `${hrs(hours)} · ${ZONE_LABEL[zone]}`, lines, zone === "interstate");
}

function done(plan: RentalPlan, hours: number, zone: RentalZone | null, summary: string, lines: RentalQuoteLine[], fromPrice: boolean): RentalQuote {
  const rental = lines.reduce((s, l) => s + l.amount, 0);
  const vat = rentalVat(rental);
  return { plan, hours, zone, summary, lines, rental, vat, total: rental + vat, fromPrice };
}

/** The quote, or null when the combination can't be booked (the screens keep inputs valid). */
export function tryQuote(listing: Priceable, input: { plan?: RentalPlan; hours: number; zone?: RentalZone }): RentalQuote | null {
  try {
    return quoteRental(listing, input);
  } catch {
    return null;
  }
}

/** The cheapest way in, for "from ₦120,000" on cards. */
export function startingPrice(listing: Priceable): number {
  if (listing.kind === "boat") {
    const r = listing.rates as BoatRates;
    return Math.min(...[r.h2, r.h3, r.h4, r.day].filter((p): p is number => p != null));
  }
  const r = listing.rates as VehicleRates;
  return Math.min(r.airport.island, r.h6.island);
}

/** Boat charter lengths on offer, shortest first. */
export function boatCharters(rates: BoatRates, minHours: number): number[] {
  return ([[2, rates.h2], [3, rates.h3], [4, rates.h4], [BOAT_DAY_HOURS, rates.day]] as const)
    .filter(([h, p]) => p != null && h >= minHours)
    .map(([h]) => h);
}
