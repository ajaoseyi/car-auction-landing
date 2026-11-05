// Mirrors the backend's packages/contracts (rentals.ts). Amounts are whole naira.

export type RentalKind = "vehicle" | "boat";
export type RentalZone = "island" | "outskirts" | "interstate";
/** "airport": a flat pickup-to-drop-off run; "hours": billed by duration. */
export type RentalPlan = "airport" | "hours";

type IslandOutskirts = { island: number; outskirts: number };

/** The CarlotNGN rate card for one vehicle. Interstate is a starting rate, 24-hour bookings only. */
export type VehicleRates = {
  airport: IslandOutskirts;
  h6: IslandOutskirts;
  h12: IslandOutskirts;
  /** interstate is null when it's quoted on request rather than booked online. */
  h24: IslandOutskirts & { interstate: number | null };
};

/** Charter prices for a boat. Null: the boat doesn't do charters that short. */
export type BoatRates = { h2: number | null; h3: number | null; h4: number | null; day: number };

export type RentalListing = {
  id: string;
  slug: string;
  kind: RentalKind;
  name: string;
  /** "Prado", for tight spots ("Book the Prado"). */
  shortName: string;
  /** "SUV · 7 seats" */
  tag: string;
  /** "Fresh · driver" */
  highlight: string;
  /** "Island & outskirts · Interstate" */
  meta: string;
  /** "SUV · 7 seats · Black · TX-L" */
  specs: string;
  badge: "hot" | "new" | null;
  images: string[];
  perks: string[];
  /** "Chauffeur" or "Captain". */
  crewRole: string;
  /** Where a boat departs from. */
  base: string | null;
  minHours: number;
  rates: VehicleRates | BoatRates;
};

export type RentalBookingStatus = "pending_payment" | "confirmed" | "assigned" | "in_progress" | "completed" | "cancelled";

export type RentalBooking = {
  id: string;
  /** "CRL-RNT-1031" */
  ref: string;
  status: RentalBookingStatus;
  listing: { id: string; kind: RentalKind; name: string; shortName: string; image: string | null; crewRole: string };
  pickupAt: string;
  plan: RentalPlan;
  hours: number;
  zone: RentalZone | null;
  /** "6 hrs · Island" */
  summary: string;
  pickupAddress: string;
  dropoffAddress: string | null;
  note: string | null;
  lines: { label: string; amount: number }[];
  rental: number;
  vat: number;
  total: number;
  fromPrice: boolean;
  crew: { name: string; detail: string | null; phone: string | null } | null;
  /** "Card •• 4821", "Bank transfer". */
  paidVia: string | null;
  cancellationFee: number | null;
  refundedToCredit: number | null;
  createdAt: string;
  paidAt: string | null;
  cancelledAt: string | null;
  completedAt: string | null;
};

/** What the booking screens carry from step to step before anything is sent. */
export type RentalDraft = {
  plan: RentalPlan;
  hours: number;
  zone?: RentalZone;
  pickupAt?: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  note?: string;
};

// From money.model.ts (Payment, Checkout, PaymentIntent).
export type PaymentStatus = "pending" | "successful" | "failed" | "amount_mismatch" | "cancelled";
export type Payment = {
  id: string;
  purpose: "deposit" | "final" | "rental";
  amount: number;
  status: PaymentStatus;
  reference: string;
  source: "paystack" | "credit";
  auctionId: string | null;
  wonLotId: string | null;
  rentalBookingId: string | null;
  createdAt: string;
  verifiedAt: string | null;
};
export type Checkout = {
  provider: "paystack";
  publicKey: string;
  reference: string;
  accessCode: string;
  authorizationUrl: string;
  amount: number;
  currency: "NGN";
  channels: string[];
  email: string;
  description: string;
};
export type PaymentIntent = {
  payment: Payment;
  /** Null when it completed without leaving the app (paid from credit). */
  checkout: Checkout | null;
};
