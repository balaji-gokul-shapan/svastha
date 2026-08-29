"use client";

import { useQuery } from "@tanstack/react-query";

// Must match the key written by auth-slice.js at login.
const AUTH_SESSION_KEY = "svastha-auth";

// The auth endpoint family on the backend is /api/auth/* (login:
// /api/auth/login, register: /api/auth/register) — so "me" lives here too.
// If the backend exposes it under /api/v1/auth/me instead, change this
// constant. Until the endpoint exists the hook falls back to the session
// record, so role checks keep working.
const AUTH_ME_ENDPOINT = "/api/auth/me";

function readSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(AUTH_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getSessionToken() {
  const session = readSession();
  if (!session?.token) return null;
  return `${session.token_type || "Bearer"} ${session.token}`.trim();
}

function getSessionUser() {
  const session = readSession();
  // Same shape auth-slice's getInitialAuthState builds for Redux.
  return (
    session?.user ?? {
      role: session?.role,
      account_type: session?.account_type ?? session?.role,
      username: session?.username,
      label: session?.username,
    }
  );
}

/**
 * Auth user via react-query.
 *
 * Fetches the fresh user from /api/auth/me (server state) instead of reading
 * the login-time snapshot from Redux. Falls back to the sessionStorage record
 * when /me is unavailable (or there is no network), so consumers like
 * `authUser?.account_type` keep working either way.
 *
 * Note: unlike useSelector, the value arrives asynchronously — expect one
 * render with authUser === null while the query resolves.
 */
const useAuthUser = () => {
  const {
    data: authUser,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const token = getSessionToken();

      // No session token -> not authenticated.
      if (!token) {
        throw new Error("Not authenticated");
      }

      try {
        const res = await fetch(AUTH_ME_ENDPOINT, {
          headers: { Accept: "application/json", Authorization: token },
        });
        if (!res.ok) {
          throw new Error("Not authenticated");
        }
        const json = await res.json();
        // /me may return the user directly or wrapped — normalize.
        return json?.user ?? json?.data ?? json;
      } catch (meError) {
        // Graceful degradation: use the login-time session snapshot.
        console.warn(
          "useAuthUser: /me fetch failed, falling back to session user:",
          meError?.message,
        );
        const sessionUser = getSessionUser();
        if (!sessionUser) {
          throw meError;
        }
        return sessionUser;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return { authUser: authUser ?? null, isLoading, error };
};

export default useAuthUser;
