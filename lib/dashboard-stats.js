/**
 * Role-aware dashboard data.
 *
 * The doctor view is driven by the assigned medical events (camps) that
 * `getAllEvents` returns, while the school view keeps its existing figures.
 * Everything here is a pure function so it can be unit tested without React.
 */

import { getCampDate, getCampDoctorIds, getCampId, getCampPrimaryDoctorId, getCampSchoolName } from "./camp-utils";

/** Events arrive as a bare array or wrapped in `{ data: [...] }`. */
export const normalizeEvents = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.events)) return payload.events;
  return [];
};

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const isUpcoming = (value) => {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() >= Date.now();
};

/** Unique doctor ids across every event, de-duplicated. */
export const collectDoctorIds = (events) => {
  const ids = new Set();

  events.forEach((event) => {
    getCampDoctorIds(event).forEach((id) => {
      if (id) ids.add(String(id));
    });
  });

  return Array.from(ids);
};

/** Events bucketed by calendar month, oldest → newest. */
export const eventsByMonth = (events) => {
  const buckets = new Map();

  events.forEach((event) => {
    const raw = getCampDate(event);
    const date = raw ? new Date(raw) : null;

    const key =
      date && !Number.isNaN(date.getTime())
        ? `${date.getFullYear()}-${date.getMonth()}`
        : "unknown";

    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  });

  return Array.from(buckets.entries())
    .filter(([key]) => key !== "unknown")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => {
      const [year, month] = key.split("-").map(Number);
      return { month: `${MONTH_LABELS[month] ?? ""} ${String(year).slice(2)}`, value };
    });
};

/** Top schools by event count, for the "events by school" breakdown. */
export const eventsBySchool = (events, limit = 6) => {
  const counts = new Map();

  events.forEach((event) => {
    const school = getCampSchoolName(event) || "Unassigned";
    counts.set(school, (counts.get(school) ?? 0) + 1);
  });

  const total = events.length || 1;

  return Array.from(counts.entries())
    .map(([name, value]) => ({
      name,
      value,
      percentage: `${((value / total) * 100).toFixed(2)}%`,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
};

/**
 * KPI cards for the doctor view.
 * `icons` / `tones` stay in the component so this module has no icon imports.
 */
export const buildDoctorStats = (events) => {
  const list = normalizeEvents(events);
  const doctorIds = collectDoctorIds(list);
  const schools = new Set(
    list.map((event) => getCampSchoolName(event)).filter(Boolean),
  );
  console.log(list, "normalized events");
  console.log(doctorIds, "doctorIds");
  console.log(schools, "schools");

  return [
    { key: "events", title: "Assigned Events", value: String(list.length) },
    { key: "schools", title: "Schools Covered", value: String(schools.size) },
    { key: "doctors", title: "Doctors Assigned", value: String(doctorIds.length) },
    {
      key: "upcoming",
      title: "Upcoming Camps",
      value: String(list.filter((event) => isUpcoming(getCampDate(event))).length),
    },
  ];
};

export const buildDoctorEventOptions = (events) =>
  normalizeEvents(events)
    .map((event) => ({
      value: getCampId(event),
      name: event?.name ?? event?.title ?? "Untitled event",
      date: getCampDate(event),
      school: getCampSchoolName(event),
    }))
    .filter((event) => event.value);

/**
 * Doctor options for the dashboard filter.
 *
 * The events payload only carries doctor *ids* (`doctor_ids` /
 * `primary_doctor_id`) — no doctor names — so each option pairs the id with
 * the camp name(s) that doctor is assigned to. That keeps the dropdown
 * readable ("Dr. 88 — svasta dev") instead of showing bare numbers.
 */
export const buildDoctorOptions = (events) => {
  const list = normalizeEvents(events);
  const byDoctor = new Map();

  const add = (doctorId, event) => {
    const key = String(doctorId ?? "").trim();
    if (!key) return;

    const campName = String(
      event?.name ?? event?.title ?? event?.camp_name ?? "",
    ).trim();

    if (!byDoctor.has(key)) {
      byDoctor.set(key, {
        value: key,
        doctorName: "",
        campNames: [],
        campIds: [],
      });
    }

    const entry = byDoctor.get(key);

    if (entry.doctorName === "" && event?.doctor_name) {
      entry.doctorName = String(event.doctor_name).trim();
    }

    if (campName && !entry.campNames.includes(campName)) {
      entry.campNames.push(campName);
    }

    const campId = getCampId(event);
    if (campId && !entry.campIds.includes(campId)) {
      entry.campIds.push(campId);
    }
  };

  list.forEach((event) => {
    // A camp can be linked by doctor_ids and/or a primary doctor; take both
    // so the primary isn't listed twice (the Set-like guards above dedupe).
    getCampDoctorIds(event).forEach((id) => add(id, event));

    const primaryId = getCampPrimaryDoctorId(event);
    if (primaryId && !getCampDoctorIds(event).includes(primaryId)) {
      add(primaryId, event);
    }
  });

  return Array.from(byDoctor.values()).map((entry) => {
    const camps = entry.campNames.length
      ? entry.campNames.join(", ")
      : "No camp assigned";

    return {
      ...entry,
      label: entry.doctorName
        ? `${entry.doctorName} — ${camps}`
        : `Dr. ${entry.value} — ${camps}`,
      shortLabel: entry.doctorName || `Dr. ${entry.value}`,
    };
  });
};
