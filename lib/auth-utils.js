// Centralized authentication token utilities.
//
// The auth session lives in sessionStorage under the key "svastha-auth".
// Redux mirrors it in-memory and a lightweight cookie can mirror the
// isAuthenticated flag for middleware.
//
// This module owns:
//   * reading access / refresh tokens
//   * decoding JWT to detect expiry
//   * exchanging refresh token for a fresh access token
//   * authenticated fetch wrapper
//   * automatic refresh when backend returns 401

export const AUTH_SESSION_KEY = "svastha-auth";

// Backend refresh endpoint.
// Next.js catch-all proxy:
// app/api/[...path]/route.js
export const REFRESH_ENDPOINT = "/api/auth/refresh";

// Single-flight guard.
// Prevents multiple simultaneous refresh requests.
let refreshInProgress = null;

/**
 * Read and parse the auth session from sessionStorage.
 *
 * @returns {object|null}
 */
export function readSession() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(AUTH_SESSION_KEY);

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Write the auth session to sessionStorage.
 *
 * @param {object|null} session
 */
export function writeSession(session) {
  if (typeof window === "undefined") return;

  try {
    if (session == null) {
      window.sessionStorage.removeItem(AUTH_SESSION_KEY);
      return;
    }

    window.sessionStorage.setItem(
      AUTH_SESSION_KEY,
      JSON.stringify(session)
    );
  } catch {
    // Ignore quota / serialization errors.
  }
}

/**
 * Get current access token.
 *
 * @returns {string|null}
 */
export function getAccessToken() {
  return readSession()?.token ?? null;
}

/**
 * Get current refresh token.
 *
 * @returns {string|null}
 */
export function getRefreshToken() {
  return readSession()?.refresh_token ?? null;
}

/**
 * Get token type.
 *
 * @returns {string}
 */
export function getTokenType() {
  return readSession()?.token_type ?? "Bearer";
}

/**
 * Build Authorization header.
 *
 * @returns {string|null}
 */
export function buildAuthHeader() {
  const token = getAccessToken();

  if (!token) return null;

  return `${getTokenType()} ${token}`.trim();
}

/**
 * Check whether the access token is expired.
 *
 * Refreshes proactively when the token has 30 seconds or less remaining.
 *
 * @returns {boolean}
 */
export function isAccessTokenExpired() {
  const token = getAccessToken();

  if (!token) return true;

  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return true;
    }

    const payload = JSON.parse(
      atob(
        parts[1]
          .replace(/-/g, "+")
          .replace(/_/g, "/")
      )
    );

    // Token has no exp claim.
    // Treat it as non-expiring.
    if (!payload?.exp) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);

    // Refresh 30 seconds before actual expiration.
    return payload.exp - 30 <= now;
  } catch {
    return true;
  }
}

/**
 * Exchange refresh token for a new access token.
 *
 * Uses a single-flight guard so multiple requests
 * share the same refresh request.
 *
 * @returns {Promise<object|null>}
 */
export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  // Another refresh request is already running.
  if (refreshInProgress) {
    return refreshInProgress;
  }

  refreshInProgress = (async () => {
    try {
      const response = await fetch(REFRESH_ENDPOINT, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Token refresh failed with status ${response.status}`
        );
      }

      const result = await response.json();

      const data = result?.data ?? result;

      const newAccessToken =
        data?.access_token ??
        data?.token ??
        null;

      const newRefreshToken =
        data?.refresh_token ??
        data?.refreshToken ??
        null;

      const tokenType =
        data?.token_type ??
        data?.tokenType ??
        "Bearer";

      const expiresIn =
        data?.expires_in ??
        data?.expiresIn ??
        null;

      if (!newAccessToken) {
        throw new Error(
          "No access token in refresh response"
        );
      }

      const session = readSession() || {};

      const updatedSession = {
        ...session,

        token: newAccessToken,

        token_type: tokenType,

        refresh_token:
          newRefreshToken ||
          session?.refresh_token,

        expires_in: expiresIn,

        loginAt: new Date().toISOString(),
      };

      // Save new tokens.
      writeSession(updatedSession);

      return updatedSession;
    } catch (error) {
      console.error(
        "Token refresh failed:",
        error
      );

      return null;
    } finally {
      refreshInProgress = null;
    }
  })();

  return refreshInProgress;
}

/**
 * Custom authentication error.
 */
export class AuthError extends Error {
  constructor(message) {
    super(message);

    this.name = "AuthError";
  }
}

/**
 * Authenticated fetch wrapper.
 *
 * 1. Checks token expiry.
 * 2. Refreshes if necessary.
 * 3. Adds Authorization header.
 * 4. If backend returns 401, refreshes once.
 * 5. Retries original request.
 * 6. If still 401, clears session and throws AuthError.
 *
 * @param {string|Request} input
 * @param {object} options
 * @param {Function|null} dispatch
 *
 * @returns {Promise<{response: Response, refreshed: boolean}>}
 */
export async function fetchWithAuth(
  input,
  options = {},
  dispatch = null
) {
  let refreshed = false;

  // --------------------------------------------------
  // 1. Proactive token refresh
  // --------------------------------------------------

  if (isAccessTokenExpired()) {
    const session = await refreshAccessToken();

    if (session) {
      refreshed = true;

      if (dispatch) {
        dispatch({
          type: "auth/refreshAccessToken",
          payload: session,
        });
      }
    }
  }

  // --------------------------------------------------
  // Build request headers
  // --------------------------------------------------

  const buildHeaders = () => {
    const headers = {
      Accept: "application/json",
      ...(options.headers || {}),
    };

    const authHeader = buildAuthHeader();

    if (authHeader) {
      headers.Authorization = authHeader;
    }

    return headers;
  };

  // --------------------------------------------------
  // 2. First request
  // --------------------------------------------------

  let response = await fetch(input, {
    ...options,
    headers: buildHeaders(),
  });

  // --------------------------------------------------
  // 3. Backend says token expired
  // --------------------------------------------------

  if (response.status === 401) {
    const session = await refreshAccessToken();

    if (session) {
      refreshed = true;

      if (dispatch) {
        dispatch({
          type: "auth/refreshAccessToken",
          payload: session,
        });
      }

      // ------------------------------------------------
      // 4. Retry original request with new token
      // ------------------------------------------------

      response = await fetch(input, {
        ...options,
        headers: buildHeaders(),
      });
    }
  }

  // --------------------------------------------------
  // 5. Still unauthorized
  // --------------------------------------------------

  if (response.status === 401) {
    writeSession(null);

    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(
        AUTH_SESSION_KEY
      );
    }

    throw new AuthError(
      "Session expired. Please log in again."
    );
  }

  return {
    response,
    refreshed,
  };
}