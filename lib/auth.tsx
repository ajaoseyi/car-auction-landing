"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, getAccessToken, onSessionChange, readRefreshToken, refreshSession, setSession, type Tokens } from "./api";
import type { AppleCredential } from "./socialAuth";

/** Mirrors `User` in the backend's packages/contracts (only what the site reads). */
export type User = {
  id: string;
  status: "guest" | "registered" | "suspended";
  isGuest: boolean;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
};

type LoginResponse = { data: User; token: Tokens };

type AuthState = {
  /** "loading" until a stored session has been restored (or found missing). */
  status: "loading" | "signedIn" | "signedOut";
  user: User | null;
  requestOtp: (email: string) => Promise<{ devCode?: string }>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  google: (idToken: string) => Promise<void>;
  apple: (credential: AppleCredential) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthState["status"]>("loading");

  // Restore the session from the stored refresh token.
  useEffect(() => {
    let live = true;
    (async () => {
      if (!readRefreshToken() || !(await refreshSession())) {
        if (live) setStatus("signedOut");
        return;
      }
      try {
        const me = await api<{ data: User }>("me");
        if (live) {
          setUser(me.data);
          setStatus("signedIn");
        }
      } catch {
        if (live) setStatus("signedOut");
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  // A refresh that the server rejects ends the session everywhere on the page.
  useEffect(
    () =>
      onSessionChange(() => {
        if (!getAccessToken() && !readRefreshToken()) {
          setUser(null);
          setStatus("signedOut");
        }
      }),
    [],
  );

  const accept = useCallback((res: LoginResponse) => {
    setSession(res.token);
    setUser(res.data);
    setStatus("signedIn");
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      status,
      user,
      requestOtp: (email) => api<{ data: { devCode?: string } }>("auth/otp/request", { method: "POST", body: { email }, auth: false }).then((r) => r.data),
      verifyOtp: (email, code) => api<LoginResponse>("auth/otp/verify", { method: "POST", body: { email, code } }).then(accept),
      google: (idToken) => api<LoginResponse>("auth/google", { method: "POST", body: { idToken } }).then(accept),
      apple: (credential) => api<LoginResponse>("auth/apple", { method: "POST", body: credential }).then(accept),
      signOut: async () => {
        const refreshToken = readRefreshToken();
        await api("auth/logout", { method: "POST", body: refreshToken ? { refreshToken } : {} }).catch(() => undefined);
        setSession(null);
        setUser(null);
        setStatus("signedOut");
      },
    }),
    [status, user, accept],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

/** Signed in with an account that can book (guests get REGISTRATION_REQUIRED). */
export const isRegistered = (u: User | null) => !!u && u.status === "registered";
