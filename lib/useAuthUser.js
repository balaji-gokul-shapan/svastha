"use client";

import { useQuery } from "@tanstack/react-query";

import {
  AUTH_SESSION_KEY,
  fetchWithAuth,
  getAccessToken,
  getTokenType,
  readSession,
} from "./auth-utils";

const AUTH_ME_ENDPOINT = "/api/me";

function getSessionToken() {
  const token = getAccessToken();
  if (!token) return null;
  return `${getTokenType()} ${token}`.trim();
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
        const { response } = await fetchWithAuth(AUTH_ME_ENDPOINT, {
          headers: { Accept: "application/json" },
        });
        if (!response.ok) {
          throw new Error("Not authenticated");
        }
        const json = await response.json();
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
