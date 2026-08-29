"use client";

import { useQuery } from "@tanstack/react-query";

// Must match the key written by auth-slice.js at login.
const AUTH_SESSION_KEY = "svastha-auth";
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


function normalizeAuthUser(user) {
  if (!user || typeof user !== "object") return user ?? null;
  const accountType =
    user.account_type ??
    user.emp_account_type ??
    user.user_type ??
    user.role ??
    null;
  return {
    ...user,
    account_type: accountType,
    role: user.role ?? accountType,
    username: user.username ?? user.user_name ?? null,
  };
}
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
        return normalizeAuthUser(json?.user ?? json?.data ?? json);
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
        return normalizeAuthUser(sessionUser);
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return { authUser: authUser ?? null, isLoading, error };
};

export default useAuthUser;
