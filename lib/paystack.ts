// Paystack checkout for a server-created payment, ported from car-auction-app's
// components/PaystackCheckout.tsx. The server owns the reference and amount; the
// popup only collects the payment, and its "success" is a cue to verify, never proof.

/* eslint-disable @typescript-eslint/no-explicit-any -- PaystackPop ships without types */

import { rentals } from "./rentals";
import type { Payment, PaymentIntent } from "./rentalModels";

/** "pending": paid by a method that settles later (bank transfer); the server confirms it by webhook. */
export type CheckoutOutcome = "paid" | "pending" | "cancelled" | "failed";

const INLINE_JS = "https://js.paystack.co/v2/inline.js";
let loading: Promise<void> | null = null;

function loadInline(): Promise<void> {
  loading ??= new Promise<void>((resolve, reject) => {
    const el = document.createElement("script");
    el.src = INLINE_JS;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => {
      loading = null;
      reject(new Error("Couldn't load Paystack. Check your connection and try again."));
    };
    document.head.appendChild(el);
  });
  return loading;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Asks the server to verify with Paystack until it settles or we stop waiting. */
export async function confirmPayment(paymentId: string, attempts = 6): Promise<CheckoutOutcome> {
  for (let i = 0; i < attempts; i++) {
    const p: Payment | undefined = await rentals.verifyPayment(paymentId).catch(() => undefined);
    if (p?.status === "successful" || p?.status === "amount_mismatch") return "paid";
    if (p?.status === "failed" || p?.status === "cancelled") return "failed";
    await sleep(1500 * (i + 1));
  }
  return "pending";
}

/** Opens Paystack for the payment and resolves once the server has verified it. */
export async function openCheckout(intent: PaymentIntent): Promise<CheckoutOutcome> {
  const { checkout, payment } = intent;
  // Paid from CarLot credit without leaving the site.
  if (!checkout) return payment.status === "successful" ? "paid" : "failed";

  // The local paystack-mock has no inline.js: use its hosted page in a new tab, then poll.
  if (checkout.publicKey.includes("local")) {
    window.open(checkout.authorizationUrl, "_blank", "noopener");
    return confirmPayment(payment.id, 20);
  }

  await loadInline();
  return new Promise<CheckoutOutcome>((resolve) => {
    new (window as any).PaystackPop().resumeTransaction(checkout.accessCode, {
      onSuccess: () => resolve(confirmPayment(payment.id)),
      onCancel: () => resolve("cancelled"),
      onError: () => resolve("failed"),
    });
  });
}
