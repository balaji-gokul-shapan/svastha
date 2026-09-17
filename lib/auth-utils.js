// Centralized authentication token utilities.
//
// The auth session lives in localStorage under the key "svastha-auth".
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
export const REFRESH_ENDPOINT = "/api/v1/refresh";

// Single-flight guard.
// Prevents multiple simultaneous refresh requests.
let refreshInProgress = null;

// Once a backend rejects the ACCESS-token fallback (no refresh_token + 401),
// don't keep burning /refresh requests every expiry — the backend wants a
// real refresh token. Reset on next successful login (full page reload).
let accessFallbackRejected = false;

// Proactive refresh timer handle.
let proactiveRefreshTimer = null;

/**
 * Read and parse the auth session from localStorage.
 *
 * @returns {object|null}
 */
export function readSession() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(AUTH_SESSION_KEY);

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Write the auth session to localStorage.
 * Tokens remain JavaScript-readable; HttpOnly cookies are safer against XSS.
 *
 * @param {object|null} session
 */
export function writeSession(session) {
  if (typeof window === "undefined") return;

  try {
    if (session == null) {
      window.localStorage.removeItem(AUTH_SESSION_KEY);
    } else {
      window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    }
  } catch {
    // Storage may be unavailable or full.
  }

  try {
    // Remove credentials left by the previous tab-scoped storage scheme.
    window.sessionStorage.removeItem(AUTH_SESSION_KEY);
  } catch {
    // sessionStorage can also be disabled independently.
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

function normalizeTokenValue(value) {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return "";

  return String(
    value.token ??
      value.access_token ??
      value.refresh_token ??
      value.value ??
      ""
  ).trim();
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
 * Decode the payload of a JWT (base64url encoded) into a plain object.
 *
 * Handles the URL-safe alphabet and re-adds the missing `=` padding so
 * atob() doesn't throw — the previous implementation dropped padding and
 * silently fell back to the (often stale) expires_in/loginAt values, which
 * made expiry detection unreliable.
 *
 * @param {string} token
 * @returns {object|null} decoded claims, or null if not a decodable JWT
 */
function decodeJwtPayload(token) {
  if (typeof token !== "string" || !token) return null;

  const parts = token.split(".");

  if (parts.length !== 3) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

/**
 * Check whether the access token is expired.
 *
 * Refreshes proactively when the token has 30 seconds or less remaining.
 *
 * @returns {boolean}
 */
export function isAccessTokenExpired() {
  const session = readSession();
  const token = session?.token;

  if (!token) return true;

  // Preferred path: JWT `exp` claim.
  const payload = decodeJwtPayload(token);
  if (payload && payload.exp) {
    const now = Math.floor(Date.now() / 1000);
    // Refresh 30 seconds before actual expiration.
    return payload.exp - 30 <= now;
  }

  // Fallback for opaque tokens: expires_in + loginAt.
  const expiresIn = Number(session?.expires_in);
  const loginTime = Date.parse(session?.loginAt ?? "");

  if (Number.isFinite(expiresIn) && expiresIn > 0 && Number.isFinite(loginTime)) {
    return Date.now() >= loginTime + Math.max(expiresIn - 30, 0) * 1000;
  }

  // No reliable expiry info — assume expired so a refresh gets attempted.
  return true;
}

/**
 * Check whether the refresh token itself is expired / unusable.
 *
 * - Missing refresh token  -> true  (nothing to refresh with)
 * - JWT refresh token past `exp` -> true
 * - Opaque / no exp        -> false (can't tell locally; let the backend decide)
 *
 * @returns {boolean}
 */
export function isRefreshTokenExpired() {
  const session = readSession();
  const token = session?.refresh_token;

  if (!token) return true;

  const payload = decodeJwtPayload(token);
  if (payload && payload.exp) {
    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now;
  }

  return false;
}

/**
 * Get the time in milliseconds until the access token expires.
 * Returns 0 if already expired or no token.
 *
 * @returns {number} milliseconds until expiry (0 if expired)
 */
export function getTimeUntilExpiry() {
  const session = readSession();
  const token = session?.token;

  if (!token) return 0;

  // Preferred path: JWT `exp` claim.
  const payload = decodeJwtPayload(token);
  if (payload && payload.exp) {
    const now = Math.floor(Date.now() / 1000);
    return Math.max((payload.exp - now) * 1000, 0);
  }

  // Fallback for opaque tokens: expires_in + loginAt.
  const expiresIn = Number(session?.expires_in);
  const loginTime = Date.parse(session?.loginAt ?? "");

  if (Number.isFinite(expiresIn) && expiresIn > 0 && Number.isFinite(loginTime)) {
    const expiryTime = loginTime + expiresIn * 1000;
    return Math.max(expiryTime - Date.now(), 0);
  }

  return 0;
}

/**
 * Schedule a proactive token refresh.
 * Refreshes the token a specified number of seconds before it expires.
 * This prevents 401 errors when the user is idle.
 *
 * @param {number} [refreshBeforeSeconds=60] - How many seconds before expiry to refresh
 * @param {Function|null} [dispatch=null] - Redux dispatch function
 */
export function scheduleProactiveRefresh(refreshBeforeSeconds = 60, dispatch = null) {
  // Clear any existing timer.
  if (proactiveRefreshTimer) {
    clearTimeout(proactiveRefreshTimer);
    proactiveRefreshTimer = null;
  }

  const timeUntilExpiry = getTimeUntilExpiry();

  if (timeUntilExpiry <= 0) {
    // Token already expired or no token — refresh immediately if possible.
    refreshAccessToken().then((session) => {
      if (session && dispatch) {
        dispatch({
          type: "auth/refreshAccessToken",
          payload: session,
        });
      }
    });
    return;
  }

  // Schedule refresh to happen `refreshBeforeSeconds` before expiry.
  const refreshIn = Math.max(timeUntilExpiry - refreshBeforeSeconds * 1000, 0);

  proactiveRefreshTimer = setTimeout(async () => {
    const session = await refreshAccessToken();

    if (session) {
      if (dispatch) {
        dispatch({
          type: "auth/refreshAccessToken",
          payload: session,
        });
      }
      // Schedule the next refresh.
      scheduleProactiveRefresh(refreshBeforeSeconds, dispatch);
    }
  }, refreshIn);
}

/**
 * Cancel any scheduled proactive refresh.
 */
export function cancelProactiveRefresh() {
  if (proactiveRefreshTimer) {
    clearTimeout(proactiveRefreshTimer);
    proactiveRefreshTimer = null;
  }
}

/**
 * Force a logout: clear the stored session and emit the session-expired
 * event. `providers.jsx` listens for this event and clears the Redux
 * session + react-query cache, then redirects to /login.
 */
function forceLogout() {
  writeSession(null);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("svastha:session-expired"));
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
    // No dedicated refresh token in the session (the backend only issues
    // access_token — Laravel Sanctum default). Present the ACCESS token to
    // /refresh ONLY while it's still valid locally; once it's expired, the
    // backend will reject it with 401 "Unauthenticated." anyway, so sending
    // it would just burn a guaranteed-failing request.
    const accessToken = getAccessToken();
    if (!accessToken) {
      return null;
    }

    // Only attempt the fallback if the access token is still valid AND the
    // backend hasn't already rejected this fallback earlier in the session.
    if (accessFallbackRejected) {
      console.warn(
        "Backend previously rejected the access-token refresh fallback — " +
          "skipping further attempts. Provide a refresh_token at login " +
          "(Laravel: createToken('refresh', ['refresh'])) for seamless renewal.",
      );
      return null;
    }

    if (isAccessTokenExpired()) {
      console.warn(
        "No refresh_token in session and the access token is already expired. " +
          "The backend must return a refresh_token at login for seamless renewal " +
          "(Laravel: createToken('refresh', ['refresh'])). " +
          "Until then, sessions end when the access token expires.",
      );
      return null;
    }

    console.warn(
      "No refresh_token in session — attempting refresh with the access token.",
    );
    return performRefresh(accessToken, { keepRefreshToken: true });
  }

  // Validate the refresh token before hitting the backend: if it has an exp
  // claim and it's already past, the refresh will never succeed — the session
  // is dead, so log out immediately instead of burning a request.
  if (isRefreshTokenExpired()) {
    console.warn("Refresh token is expired — logging out.");
    forceLogout();
    return null;
  }

  return performRefresh(refreshToken, { keepRefreshToken: false });
}

/**
 * Shared refresh request body. Sends the bearer credential BOTH in the
 * Authorization header (Sanctum-style guard validation) and in the JSON body
 * (refresh_token) — the backend reads whichever it expects.
 *
 * @param {string} bearerToken - token presented to /api/v1/refresh
 * @param {{keepRefreshToken?: boolean}} opts
 *   keepRefreshToken=true  -> bearer was the ACCESS token; never overwrite
 *                             the session's refresh_token with it.
 * @returns {Promise<object|null>} updated session, or null on failure
 */
async function performRefresh(bearerToken, { keepRefreshToken = false } = {}) {
  // Another refresh request is already running — share its result.
  if (refreshInProgress) {
    return refreshInProgress;
  }

  refreshInProgress = (async () => {
    let failureStatus = null;

    try {
      const response = await fetch(REFRESH_ENDPOINT, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${bearerToken}`,
        },

        body: JSON.stringify({
          refresh_token: bearerToken,
        }),
      });

      const responseText = await response.text();
      let result = null;

      try {
        result = responseText ? JSON.parse(responseText) : null;
      } catch {
        result = null;
      }

      if (!response.ok) {
        failureStatus = response.status;

        // The backend rejected the refresh token itself (expired / revoked /
        // invalid) — the session cannot be recovered. Log out immediately.
        // When we fell back to the ACCESS token (keepRefreshToken), let the
        // caller decide — a rejection there may just mean the backend wants a
        // real refresh token, not that the session is dead.
        if (response.status === 401 || response.status === 403) {
          if (keepRefreshToken) {
            // The access-token fallback doesn't work on this backend — stop
            // retrying it for the rest of this session.
            accessFallbackRejected = true;
          } else {
            console.warn("Refresh token rejected by backend — logging out.");
            forceLogout();
          }
        }

        throw new Error(
          result?.message ??
            result?.error ??
            `Token refresh failed with status ${response.status}`
        );
      }

      const data = result?.data ?? result;

      const newAccessToken = normalizeTokenValue(
        data?.access_token ?? data?.accessToken ?? data?.token
      );

      const newRefreshToken = normalizeTokenValue(
        data?.refresh_token ?? data?.refreshToken
      );

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

        // When the bearer was the ACCESS token (no dedicated refresh token in
        // the session), never store it as refresh_token — that would poison
        // the next refresh attempt with a soon-expired access token.
        refresh_token: keepRefreshToken
          ? (session?.refresh_token ?? null)
          : (newRefreshToken || session?.refresh_token),

        expires_in: expiresIn,

        loginAt: new Date().toISOString(),
      };

      // Save new tokens.
      writeSession(updatedSession);

      return updatedSession;
    } catch (error) {
      // A 401/403 from /refresh is an EXPECTED backend rejection (nothing we
      // can do without a valid refresh token) — don't spam the console as an
      // error. Only log errors for unexpected / transient failures.
      if (failureStatus === 401 || failureStatus === 403) {
        console.warn("Token refresh rejected by the backend.", error?.message);
      } else {
        console.error("Token refresh failed:", error);
      }

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

    if (isAccessTokenExpired()) {
      // The access token is genuinely expired — the session is dead.
      // A refresh didn't help (or wasn't possible). Log out.
      writeSession(null);

      if (dispatch) {
        dispatch({ type: "auth/clearAuthSession" });
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("svastha:session-expired"),
        );
      }

      throw new AuthError("Session expired. Please log in again.");
    }

    // Access token still valid — the backend denied THIS request. Session
    // is alive; just report the authorization failure and stay logged in.
    throw new AuthError(
      "You are not authorized to access this resource.",
    );
  }

  return {
    response,
    refreshed,
  };
}