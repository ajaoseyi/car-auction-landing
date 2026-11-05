import { api } from "./api";
import { FALLBACK_FLEET } from "./fleetFallback";
import type { Payment, PaymentIntent, RentalBooking, RentalKind, RentalListing, RentalPlan, RentalZone } from "./rentalModels";

export type CreateBookingBody = {
  pickupAt: string;
  plan: RentalPlan;
  hours: number;
  zone?: RentalZone;
  pickupAddress: string;
  dropoffAddress?: string;
  note?: string;
  /** Who the crew calls on the day. The API emails it to ops with the paid order. */
  phone?: string;
  acceptTerms: true;
};

/** The rental fleet and the user's bookings. Mirrors car-auction-app's services/rental.service.ts. */
export const rentals = {
  list: (kind?: RentalKind) => api<{ data: RentalListing[] }>("rentals", { auth: false, query: { kind } }).then((r) => r.data),

  /** By id or slug. */
  get: (ref: string) => api<{ data: RentalListing }>(`rentals/${encodeURIComponent(ref)}`, { auth: false }).then((r) => r.data),

  /** Creates the booking and its Paystack checkout; it is confirmed once the payment is verified. */
  book: (listingId: string, body: CreateBookingBody, idempotencyKey: string) =>
    api<{ data: { booking: RentalBooking; payment: PaymentIntent } }>(`rentals/${listingId}/bookings`, {
      method: "POST",
      body,
      headers: { "idempotency-key": idempotencyKey },
    }).then((r) => r.data),

  myBookings: (status?: "active" | "past") => api<{ data: RentalBooking[] }>("me/rental-bookings", { query: { status } }).then((r) => r.data),

  booking: (id: string) => api<{ data: RentalBooking }>(`me/rental-bookings/${id}`).then((r) => r.data),

  cancel: (id: string) => api<{ data: RentalBooking }>(`me/rental-bookings/${id}/cancel`, { method: "POST", body: {} }).then((r) => r.data),

  verifyPayment: (paymentId: string) => api<{ data: Payment }>(`payments/${paymentId}/verify`, { method: "POST", body: {} }).then((r) => r.data),
};

/**
 * A listing for the browse screens, falling back to the built-in fleet when the
 * API can't be reached. Booking still needs the API (fallback ids aren't real).
 */
export async function getListing(slug: string): Promise<RentalListing> {
  try {
    return await rentals.get(slug);
  } catch (err) {
    const local = FALLBACK_FLEET.find((l) => l.slug === slug);
    if (local) return local;
    throw err;
  }
}
