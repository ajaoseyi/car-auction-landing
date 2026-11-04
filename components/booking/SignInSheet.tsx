"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { appleCredential, isAppleAvailable, isGoogleAvailable, renderGoogleButton } from "@/lib/socialAuth";
import { Icon, PrimaryButton, Sheet, cx, s } from "./kit";

/**
 * Sign in with an emailed 6-digit code, Google or Apple, as in the app's SignInScreen.
 * Paystack needs an email, so booking needs an account.
 */
export function SignInSheet({ onClose, onSignedIn, reason }: { onClose: () => void; onSignedIn?: () => void; reason?: string }) {
  const auth = useAuth();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [devCode, setDevCode] = useState<string | undefined>();
  const googleEl = useRef<HTMLDivElement>(null);
  const codeEl = useRef<HTMLInputElement>(null);

  const done = () => {
    onClose();
    onSignedIn?.();
  };

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    try {
      await fn();
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  // Google's own button; the token goes to the API, which upgrades or creates the account.
  useEffect(() => {
    const el = googleEl.current;
    if (!isGoogleAvailable || !el || step !== "email") return;
    renderGoogleButton(el, (idToken) => void run(() => auth.google(idToken)).then((ok) => ok && done()), Math.min(380, el.clientWidth || 320)).catch((e: Error) =>
      setError(e.message),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- render once per email step
  }, [step]);

  useEffect(() => {
    if (step === "code") codeEl.current?.focus();
  }, [step]);

  const sendCode = async (e?: FormEvent) => {
    e?.preventDefault();
    const em = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return setError("Enter a valid email address.");
    const ok = await run(async () => setDevCode((await auth.requestOtp(em)).devCode));
    if (ok) {
      setCode("");
      setStep("code");
    }
  };

  const verify = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!/^\d{6}$/.test(code)) return setError("Enter the 6-digit code from your email.");
    if (await run(() => auth.verifyOtp(email.trim().toLowerCase(), code))) done();
  };

  const apple = async () => {
    const ok = await run(async () => {
      const cred = await appleCredential();
      if (!cred) throw new Error(""); // closed the popup: no message
      await auth.apple(cred);
    });
    if (ok) done();
  };

  return (
    <Sheet title={step === "email" ? "Sign in to book" : "Check your email"} onClose={onClose} label="Sign in">
      {step === "email" ? (
        <>
          <p className={s.text} style={{ fontSize: 15, lineHeight: "22px", marginTop: -8 }}>
            {reason ?? "We'll email you a 6-digit code. No password needed."}
          </p>
          <form onSubmit={sendCode} className={s.section}>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="Email address"
              aria-label="Email address"
              autoComplete="email"
              autoFocus
              className={s.field}
            />
            <PrimaryButton label="Email me a code" wide loading={busy} onClick={() => void sendCode()} />
          </form>
          {(isGoogleAvailable || isAppleAvailable) && <div className={s.or}>OR</div>}
          {isGoogleAvailable && <div ref={googleEl} className={s.googleSlot} />}
          {isAppleAvailable && (
            <button type="button" className={cx(s.provider, s.providerApple)} onClick={apple} disabled={busy}>
              <Icon name="apple" size={18} />
              Continue with Apple
            </button>
          )}
        </>
      ) : (
        <>
          <p className={s.text} style={{ fontSize: 15, lineHeight: "22px", marginTop: -8 }}>
            We sent a 6-digit code to <b style={{ color: "#121212" }}>{email.trim()}</b>.
          </p>
          {devCode && <p className={s.meta}>Dev code: {devCode}</p>}
          <form onSubmit={verify} className={s.section}>
            <input
              ref={codeEl}
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                setCode(v);
                setError("");
              }}
              placeholder="••••••"
              aria-label="6-digit code"
              className={cx(s.field, s.codeInput)}
            />
            <PrimaryButton label="Sign in" wide loading={busy} disabled={code.length !== 6} onClick={() => void verify()} />
          </form>
          <div className={s.barRow} style={{ justifyContent: "center", gap: 20 }}>
            <button type="button" className={s.textLink} onClick={() => setStep("email")}>
              Use a different email
            </button>
            <button type="button" className={s.textLink} onClick={() => void sendCode()} disabled={busy}>
              Send a new code
            </button>
          </div>
        </>
      )}
      {error && (
        <p className={s.err} role="alert">
          {error}
        </p>
      )}
      <p className={s.legal}>
        By continuing you agree to our <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </Sheet>
  );
}
