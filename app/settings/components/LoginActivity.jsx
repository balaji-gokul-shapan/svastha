"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { LogIn, LogOut, MonitorSmartphone, ShieldAlert } from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { selectAuthLoginAt, selectAuthUser } from "@/lib/features/auth-slice";
import { LoginActivityChart } from "./LoginActivityChart";


const LOGIN_HISTORY_KEY = "svastha-login-history";
const MAX_HISTORY = 5;

function subscribeToHistory(onChange) {
  
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function getHistorySnapshot() {
  // A raw string keeps the snapshot referentially stable, which is what
  // useSyncExternalStore requires.
  return window.localStorage.getItem(LOGIN_HISTORY_KEY) ?? "";
}

function getHistoryServerSnapshot() {
  return "";
}

function writeHistory(entries) {
  try {
    window.localStorage.setItem(LOGIN_HISTORY_KEY, JSON.stringify(entries));
  } catch {
    // Storage can be full or blocked (private mode) — the panel still works,
    // it just will not remember previous sign-ins.
  }
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatRelative(value) {
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return "";

  const diffMinutes = Math.round((Date.now() - time) / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;

  return "";
}

function describeBrowser() {
  if (typeof navigator === "undefined") return "This device";

  const platform = [navigator.userAgentData?.platform, navigator.platform, navigator.userAgent]
    .find(Boolean);
  return platform ? String(platform) : "This device";
}

export function LoginActivity() {
  const authUser = useAppSelector(selectAuthUser);
  const loginAt = useAppSelector(selectAuthLoginAt);
  const historySnapshot = useSyncExternalStore(
    subscribeToHistory,
    getHistorySnapshot,
    getHistoryServerSnapshot,
  );


  // The current sign-in always leads the list; older ones come from the stored
  // history, deduped so a re-render never repeats the current session.
  const previousLogins = useMemo(() => {
    let stored = [];
    try {
      const parsed = historySnapshot ? JSON.parse(historySnapshot) : [];
      if (Array.isArray(parsed)) stored = parsed;
    } catch {
      stored = [];
    }

    const all = loginAt ? [loginAt, ...stored.filter((entry) => entry !== loginAt)] : stored;
    return all.slice(0, MAX_HISTORY);
  }, [historySnapshot, loginAt]);

  // Persist the merged list so the next page load can still show it.
  useEffect(() => {
    if (previousLogins.length) writeHistory(previousLogins);
  }, [previousLogins]);

  const currentLabel = authUser?.label || authUser?.emp_name || authUser?.username || "You";
  const relative = loginAt ? formatRelative(loginAt) : "";

  // The device never changes mid-session, so read it once.
  const browserLabel = useMemo(() => describeBrowser(), []);

  const entries = useMemo(
    () =>
      previousLogins.map((entry, index) => ({
        id: `${entry}-${index}`,
        title: index === 0 ? "Signed in on this device" : "Previous sign-in",
        timestamp: entry,
        current: index === 0,
      })),
    [previousLogins],
  );

  return (
    <div className="my-details-panel__body">
      {entries.length ? (
        <>
          <LoginActivityChart entries={entries} browserLabel={browserLabel} />

          <div className="grid grid-cols-1 gap-4 py-2">
          {entries.slice(0, 1).map((entry) => (
            <div
              key={entry.id}
              className={`my-details-login-item ${entry.current ? "my-details-login-item--current" : ""}`}
            >
              <span className="my-details-login-item__icon">
                {entry.current ? (
                  <LogIn className="size-4" aria-hidden="true" />
                ) : (
                  <LogOut className="size-4" aria-hidden="true" />
                )}
              </span>
              <div className="min-w-0">
                <p className="my-details-login-item__title">
                  {entry.current ? `${currentLabel} · active session` : entry.title}
                </p>
                <p className="my-details-login-item__meta">
                  {formatDateTime(entry.timestamp)}
                  {entry.timestamp === loginAt && relative ? ` · ${relative}` : ""}
                </p>
                <p className="my-details-login-item__meta">
                  {entry.current ? (
                    <>
                      <MonitorSmartphone
                        className="mr-1 inline size-3 align-[-0.1em]"
                        aria-hidden="true"
                      />
                      {describeBrowser()}
                    </>
                  ) : (
                    "Ended when the session was replaced or closed"
                  )}
                </p>
              </div>
            </div>
          ))}
          </div>
        </>
      ) : (
        <p className="my-details-login-empty">
          <ShieldAlert className="size-4 shrink-0" aria-hidden="true" />
          No login recorded for this session yet.
        </p>
      )}
    </div>
  );
}

export default LoginActivity;
