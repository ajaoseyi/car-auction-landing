"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { isRegistered, useAuth } from "@/lib/auth";
import { clearDraft, newAttemptKey, readDraft, writeDraft, type StoredDraft } from "@/lib/draft";
import { formatNaira, formatPickup } from "@/lib/format";
import { openCheckout } from "@/lib/paystack";
import { getListing, rentals } from "@/lib/rentals";
import type { RentalListing } from "@/lib/rentalModels";
import { tryQuote } from "@/lib/rentalPricing";
import { SignInSheet } from "./SignInSheet";
import { Bar, Icon, LoadState, NoticeSheet, Photo, PrimaryButton, Row, Shell, StepHead, cx, s, useRequest, type Notice } from "./kit";

export default function RentalReview({ slug }: { slug: string }) {
  const router = useRouter();
  const { data: listing, error, reload } = useRequest(() => getListing(slug), slug);
  const [draft, setDraft] = useState<StoredDraft | null>(null);

  useEffect(() => {
    const d = readDraft(slug);
    // Review needs the pickup and phone number from step 1.
    if (!d?.pickupAt || !d.pickupAddress || !d.phone) router.replace(d ? `/rentals/${slug}/book` : `/rentals/${slug}`);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage is only readable after hydration
    else setDraft(d);
  }, [slug, router]);

  return <Shell>{listing && draft ? <Review listing={listing} draft={draft} /> : <LoadState error={error} onRetry={reload} back={`/rentals/${slug}/book`} />}</Shell>;
}

function Review({ listing, draft }: { listing: RentalListing; draft: StoredDraft }) {
  const router = useRouter();
  const auth = useAuth();
  const signedIn = isRegistered(auth.user);
  const [agreed, setAgreed] = useState(true);
  const [busy, setBusy] = useState(false);
  const [signIn, setSignIn] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const isBoat = listing.kind === "boat";
  const quote = tryQuote(listing, draft);

  /** One key per attempt, kept with the draft, so a double click, retry or reload can't book twice. */
  const key = useRef(draft.attemptKey);
  const attemptKey = () => {
    if (!key.current) {
      key.current = newAttemptKey();
      writeDraft(listing.slug, { ...draft, attemptKey: key.current });
    }
    return key.current;
  };
  const resetAttempt = () => {
    key.current = undefined;
    writeDraft(listing.slug, { ...draft, attemptKey: undefined });
  };

  /** `justSignedIn`: called straight from the sign-in sheet, before this render sees the new user. */
  const pay = async (justSignedIn = false) => {
    if (!quote || !draft.pickupAt || !draft.pickupAddress) return;
    // Paystack needs an email, so booking needs an account; they carry on here after signing in.
    if (!signedIn && !justSignedIn) return setSignIn(true);
    setBusy(true);
    try {
      const { booking, payment } = await rentals.book(
        listing.id,
        {
          pickupAt: draft.pickupAt,
          plan: draft.plan,
          hours: draft.hours,
          zone: draft.zone,
          pickupAddress: draft.pickupAddress,
          dropoffAddress: draft.dropoffAddress,
          note: draft.note,
          phone: draft.phone,
          acceptTerms: true,
        },
        attemptKey(),
      );
      const outcome = await openCheckout(payment);
      if (outcome === "paid") {
        clearDraft(listing.slug);
        router.replace(`/bookings/${booking.id}/confirmed`);
        return;
      }
      if (outcome === "pending") {
        clearDraft(listing.slug);
        setNotice({
          title: "Payment on its way",
          body: "Bank transfers can take a few minutes. Your booking is confirmed as soon as it lands.",
          onDismiss: () => router.replace(`/bookings/${booking.id}`),
        });
        return;
      }
      // Cancelled or failed: the same checkout can be reopened with this key.
      if (outcome === "failed") setNotice({ title: "Payment didn't go through", body: "Nothing was charged. Please try again." });
    } catch (err) {
      const e = err as ApiError;
      if (e.code === "REGISTRATION_REQUIRED" || e.code === "UNAUTHENTICATED") return setSignIn(true);
      resetAttempt();
      setNotice({ title: "Couldn't book", body: e.message || "Please try again." });
    } finally {
      setBusy(false);
    }
  };

  const rows = [
    { label: isBoat ? "Boat" : "Vehicle", value: listing.name },
    { label: isBoat ? "Departs" : "Pickup", value: draft.pickupAt ? formatPickup(draft.pickupAt) : "—" },
    { label: "From", value: draft.pickupAddress || "Add a pickup address" },
    ...(draft.dropoffAddress ? [{ label: "Drop-off", value: draft.dropoffAddress }] : []),
    { label: "Phone", value: draft.phone ?? "—" },
    ...(draft.note ? [{ label: "Note", value: draft.note }] : []),
    { label: "Booking", value: quote?.summary ?? "—" },
  ];

  const totals = quote && (
    <div className={s.totals}>
      <Row label="Rental" value={`${formatNaira(quote.rental)}${quote.fromPrice ? "+" : ""}`} />
      <Row label="VAT (7.5%)" value={formatNaira(quote.vat)} />
      <div className={s.totalRow}>
        <span className={s.totalLabel}>Total</span>
        <span className={s.totalValue}>{formatNaira(quote.total)}</span>
      </div>
      {quote.fromPrice && <p className={s.quoteNote}>Interstate prices are starting rates. Anything extra for your route is agreed with you before the trip.</p>}
    </div>
  );

  const terms = (
    <button type="button" role="checkbox" aria-checked={agreed} onClick={() => setAgreed(!agreed)} className={s.check}>
      <span className={cx(s.checkBox, agreed && s.checkBoxOn)}>{agreed && "✓"}</span>
      <span>
        I&apos;ve read the <Link href="/terms" onClick={(e) => e.stopPropagation()}>booking terms</Link>. Cancelling within 60 minutes of pickup costs 25% of the booking.
      </span>
    </button>
  );

  const account =
    auth.user && signedIn ? (
      <div className={s.signedAs}>
        <span className={s.ellipsis}>Paying as {auth.user.email ?? "your account"}</span>
        <button type="button" className={s.textLink} onClick={() => void auth.signOut()}>
          Switch
        </button>
      </div>
    ) : null;

  const payLabel = signedIn ? (quote ? `Pay ${formatNaira(quote.total)}` : "Pay") : "Sign in to pay";

  return (
    <>
      <StepHead back={`/rentals/${listing.slug}/book`} eyebrow="Step 2 of 2" title="Review and pay" />
      <div className={s.split} style={{ marginTop: 20 }}>
        <div className={s.col} style={{ gap: 22 }}>
          <Photo src={listing.images[1] ?? listing.images[0]} label={listing.shortName} className={s.reviewImg}>
            <span className={s.reviewTag}>{isBoat ? `${listing.crewRole} + fuel` : "Chauffeur + fuel"}</span>
          </Photo>
          <div className={s.rows}>
            {rows.map((r) => (
              <Row key={r.label} label={r.label} value={r.value} />
            ))}
          </div>
          <div className={s.mobOnly} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {totals}
            {terms}
            {account}
            <p className={s.secure}>
              <Icon name="lock" size={14} />
              Payments are processed securely by Paystack
            </p>
          </div>
        </div>

        <aside className={s.aside}>
          <Bar
            extra={
              <>
                <span className={s.eyebrow}>Your total</span>
                {totals}
                {terms}
                {account}
              </>
            }
          >
            <PrimaryButton wide label={payLabel} disabled={!agreed || !quote} loading={busy} onClick={() => void pay()} icon={signedIn ? "lock" : "arrow-right"} />
          </Bar>
          <p className={cx(s.secure, s.deskOnly)}>
            <Icon name="lock" size={14} />
            Payments are processed securely by Paystack
          </p>
        </aside>
      </div>

      {signIn && <SignInSheet reason="Sign in to pay. We'll email your receipt and booking updates here." onClose={() => setSignIn(false)} onSignedIn={() => void pay(true)} />}
      {notice && <NoticeSheet notice={notice} onClose={() => setNotice(null)} />}
    </>
  );
}
