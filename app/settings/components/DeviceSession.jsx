"use client";

import { useSyncExternalStore } from "react";
import {
  Clock,
  Globe,
  Laptop,
  Languages,
  Monitor,
  ShieldCheck,
} from "lucide-react";


const SESSION_STARTED_LABEL = new Date().toLocaleString("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

/**
 * DEVICE & SESSION
 * ----------------
 * Answers "what am I signed in from, right now?" — the complement to the
 * Login activity card next to it, which answers "when did I sign in?".
 * Handy when a user has to reach support and needs to describe their setup.
 *
 * Everything here comes from the browser, so it is read through
 * `useSyncExternalStore` rather than during render: `navigator` does not exist
 * while the server renders, and a snapshot read during render would produce
 * different markup on the server than on the client — exactly the mismatch
 * React hydration reports.
 *
 * Device facts are fixed for the lifetime of a tab, so they are read once and
 * cached at module scope below, giving React a referentially stable snapshot
 * without a `useState` + `useEffect` pair.
 */

let cachedDeviceSnapshot = null;

function readDeviceSnapshot() {
  if (cachedDeviceSnapshot) return cachedDeviceSnapshot;
  if (typeof window === "undefined") return "";

  const ua = navigator.userAgent ?? "";
  const platform = navigator.userAgentData?.platform || navigator.platform || "";

  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Chrome\//.test(ua)
          ? "Chrome"
          : /Safari\//.test(ua)
            ? "Safari"
            : "Unknown browser";

  const os = /Windows/i.test(platform || ua)
    ? "Windows"
    : /Android/i.test(ua)
      ? "Android"
      : /iPhone|iPad|iPod/i.test(ua)
        ? "iOS"
        : /Mac/i.test(platform || ua)
          ? "macOS"
          : /Linux/i.test(platform || ua)
            ? "Linux"
            : "Unknown OS";

  const width = window.screen?.width || 0;
  const height = window.screen?.height || 0;
  const screen = width && height ? `${width} × ${height}` : "Unavailable";

  let timezone = "Unavailable";
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Unavailable";
  } catch {
    timezone = "Unavailable";
  }

  cachedDeviceSnapshot = {
    browser,
    os,
    screen,
    timezone,
    // navigator.language is the UI language, e.g. "en-IN".
    language: navigator.language || "Unavailable",
  };

  return cachedDeviceSnapshot;
}

// The device cannot change under us, so there is nothing to subscribe to.
function subscribeToDevice() {
  return () => {};
}

function getDeviceServerSnapshot() {
  return null;
}

/** Connection state *does* change, so this one really does subscribe. */
function subscribeToConnection(onChange) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

function getConnectionSnapshot() {
  return navigator.onLine;
}

function getConnectionServerSnapshot() {
  return true;
}

export function DeviceSession() {
  // `null` on the server and the first client render, so hydration matches;
  // the real values arrive on the following commit.
  const device = useSyncExternalStore(
    subscribeToDevice,
    readDeviceSnapshot,
    getDeviceServerSnapshot,
  );
  const online = useSyncExternalStore(
    subscribeToConnection,
    getConnectionSnapshot,
    getConnectionServerSnapshot,
  );

  const rows = device
    ? [
        {
          key: "device",
          icon: Monitor,
          label: "Device",
          value: `${device.os} · ${device.browser}`,
        },
        { key: "display", icon: Laptop, label: "Display", value: device.screen },
        { key: "timezone", icon: Globe, label: "Time zone", value: device.timezone },
        {
          key: "language",
          icon: Languages,
          label: "Language",
          value: device.language,
        },
        {
          key: "session",
          icon: Clock,
          label: "Session started",
          value: SESSION_STARTED_LABEL,
        },
      ]
    : [];

  return (
    <div className="my-details-panel__body my-details-device-list">
      <div className="my-details-device-status">
        <span
          className={`my-details-device-status__dot ${
            online ? "my-details-device-status__dot--online" : ""
          }`}
          aria-hidden="true"
        />
        <span className="text-xs font-medium">
          {online ? "Connected to this device" : "Working offline"}
        </span>
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <ShieldCheck className="size-3" aria-hidden="true" />
          Current session
        </span>
      </div>

      {device ? (
        <dl className="my-details-device-grid">
          {rows.map(({ key, icon: Icon, label, value }) => (
            <div key={key} className="my-details-device-row">
              <span className="my-details-device-row__icon" aria-hidden="true">
                <Icon className="size-3.5" />
              </span>
              <dt className="my-details-device-row__label">{label}</dt>
              <dd className="my-details-device-row__value" title={value}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="my-details-device-list" aria-label="Loading device details">
          {[0, 1, 2, 3, 4].map((row) => (
            <div key={row} className="my-details-device-row animate-pulse">
              <span className="my-details-device-row__icon" aria-hidden="true" />
              <span className="h-3 w-24 rounded bg-muted" />
              <span className="ml-auto h-3 w-28 rounded bg-muted" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
