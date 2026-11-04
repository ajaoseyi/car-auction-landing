// Talks to car-auction-app-backend. Browsers are limited to the API's CORS_ORIGINS, so this site's origin must be listed there.
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://lotline-api.57-129-139-194.sslip.io").replace(/\/$/, "") + "/v1/";

const REFRESH_KEY = "carlot-refresh";

export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) {
    super(message);
  }
}

export type Tokens = { accessToken: string; refreshToken: string };

// The access token lives in memory only; the refresh token survives reloads.
let access: string | null = null;
const listeners = new Set<() => void>();

export const getAccessToken = () => access;
export const onSessionChange = (cb: () => void) => {
  listeners.add(cb);
  return () => void listeners.delete(cb);
};

export function readRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export function setSession(tokens: Tokens | null) {
  access = tokens?.accessToken ?? null;
  try {
    if (tokens) localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    else localStorage.removeItem(REFRESH_KEY);
  } catch {}
  listeners.forEach((cb) => cb());
}

type Opts = { method?: "GET" | "POST" | "PATCH"; body?: unknown; auth?: boolean; headers?: Record<string, string>; query?: Record<string, string | undefined> };

/** Errors are RFC 7807 problems; `message` is a string, or string[] for validation failures. */
async function send<T>(path: string, o: Opts): Promise<{ res: Response; body: T | null }> {
  const url = new URL(path, API_URL);
  Object.entries(o.query ?? {}).forEach(([k, v]) => v != null && url.searchParams.set(k, v));
  const headers: Record<string, string> = { ...o.headers };
  if (o.body !== undefined) headers["content-type"] = "application/json";
  if (o.auth !== false && access) headers.authorization = `Bearer ${access}`;
  let res: Response;
  try {
    res = await fetch(url, { method: o.method ?? "GET", headers, body: o.body === undefined ? undefined : JSON.stringify(o.body) });
  } catch {
    throw new ApiError("Couldn't reach us. Check your connection and try again.", 0);
  }
  return { res, body: (await res.json().catch(() => null)) as T | null };
}

let refreshing: Promise<boolean> | null = null;

/** Swaps the stored refresh token for a new session. Concurrent callers share one attempt. */
export function refreshSession(): Promise<boolean> {
  refreshing ??= (async () => {
    const refreshToken = readRefreshToken();
    if (!refreshToken) return false;
    const { res, body } = await send<{ token?: Tokens }>("auth/refresh", { method: "POST", body: { refreshToken }, auth: false }).catch(() => ({ res: null, body: null }));
    if (res?.ok && body?.token?.accessToken) {
      setSession(body.token);
      return true;
    }
    // A network failure keeps the refresh token for next time; a rejected one is cleared.
    if (res && res.status >= 400 && res.status < 500) setSession(null);
    return false;
  })().finally(() => (refreshing = null));
  return refreshing;
}

export async function api<T>(path: string, o: Opts = {}): Promise<T> {
  let { res, body } = await send<T>(path, o);
  // A 401 on a request that carried a token is an expired session: refresh once and retry.
  if (res.status === 401 && o.auth !== false && (access || readRefreshToken()) && (await refreshSession())) {
    ({ res, body } = await send<T>(path, o));
  }
  if (!res.ok) {
    const p = body as { message?: string | string[]; code?: string } | null;
    const msg = Array.isArray(p?.message) ? p.message[0] : p?.message;
    throw new ApiError(res.status === 429 ? "Too many tries. Please wait a minute." : msg || "Something went wrong. Please try again.", res.status, p?.code);
  }
  return body as T;
}
