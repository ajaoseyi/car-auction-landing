// Google Identity Services and Sign in with Apple JS, ported from car-auction-app's
// services/socialAuth.web.ts. The ID tokens are the same kind the apps send, so the
// backend verifies them the same way: the Google web client ID must be in the API's
// GOOGLE_CLIENT_IDS and the Apple Services ID in APPLE_AUDIENCES, with this site's
// origin registered as an Apple return URL.

/* eslint-disable @typescript-eslint/no-explicit-any -- the GIS and AppleID globals ship without types */

const GOOGLE_WEB_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID;
const APPLE_SERVICES_ID = process.env.NEXT_PUBLIC_APPLE_SERVICES_ID;

const GOOGLE_SCRIPT = "https://accounts.google.com/gsi/client";
const APPLE_SCRIPT = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";

export const isGoogleAvailable = !!GOOGLE_WEB_CLIENT_ID;
export const isAppleAvailable = !!APPLE_SERVICES_ID;

export type AppleCredential = { identityToken: string; firstName?: string; lastName?: string };

const scripts = new Map<string, Promise<void>>();

function loadScript(src: string): Promise<void> {
  let loading = scripts.get(src);
  if (!loading) {
    loading = new Promise<void>((resolve, reject) => {
      const el = document.createElement("script");
      el.src = src;
      el.async = true;
      el.onload = () => resolve();
      el.onerror = () => reject(new Error("Couldn't reach the sign in service. Check your connection and try again."));
      document.head.appendChild(el);
    });
    // A failed load can be retried.
    loading.catch(() => scripts.delete(src));
    scripts.set(src, loading);
  }
  return loading;
}

/**
 * Renders Google's own button into `el` (the One Tap prompt is often suppressed on
 * the web) and calls `onToken` with the ID token once the user picks an account.
 */
export async function renderGoogleButton(el: HTMLElement, onToken: (idToken: string) => void, width: number) {
  if (!GOOGLE_WEB_CLIENT_ID) throw new Error("Google sign-in isn't set up on this site.");
  await loadScript(GOOGLE_SCRIPT);
  const gsi = (window as any).google.accounts.id;
  gsi.initialize({
    client_id: GOOGLE_WEB_CLIENT_ID,
    callback: (res: { credential?: string }) => res.credential && onToken(res.credential),
    use_fedcm_for_prompt: true,
  });
  gsi.renderButton(el, { type: "standard", theme: "outline", size: "large", shape: "pill", text: "continue_with", logo_alignment: "left", width });
}

export async function appleCredential(): Promise<AppleCredential | null> {
  if (!APPLE_SERVICES_ID) throw new Error("Sign in with Apple isn't set up on this site.");
  await loadScript(APPLE_SCRIPT);
  const { auth } = (window as any).AppleID;
  auth.init({ clientId: APPLE_SERVICES_ID, scope: "name email", redirectURI: window.location.origin, usePopup: true });
  try {
    const res = await auth.signIn();
    const identityToken: string | undefined = res?.authorization?.id_token;
    if (!identityToken) throw new Error("Apple didn't return a sign in token. Please try again.");
    // Apple sends the name only on the very first authorisation.
    return { identityToken, firstName: res.user?.name?.firstName ?? undefined, lastName: res.user?.name?.lastName ?? undefined };
  } catch (error: any) {
    // Closing the popup is not an error.
    if (error?.error === "popup_closed_by_user" || error?.error === "user_cancelled_authorize") return null;
    throw error instanceof Error ? error : new Error("Sign in with Apple didn't finish. Please try again.");
  }
}
