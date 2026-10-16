"use client";

import * as React from "react";
import {
  Baby,
  CalendarCheck,
  ClipboardList,
  Stethoscope,
  Users,
} from "lucide-react";
import "../style/style.css";

/* -------------------------------------------------------------------------
   DoctorDashboardInsights — the doctor-role counterpart of
   <SchoolDashboardInsights />.

   Consumes what useDoctorApi already computes (assigned events, roster totals
   by gender/age, screening record counts) and renders them with the SAME
   .school-insights design system: panel gradients, tone tokens, legends and
   split bars — so both dashboards look like one product.

   Colour contract (style.css): indigo = scheduled/waiting, green = completed /
   good, blue = boys/today, pink = girls, teal = other, violet = age/lead,
   amber = upcoming, slate = neutral.
   ------------------------------------------------------------------------- */

const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const fmt = (value) => num(value).toLocaleString("en-IN");

const pctOf = (part, whole) =>
  whole > 0 ? Math.min(100, Math.round((part / whole) * 100)) : 0;

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value ?? "");
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function PanelHeading({ icon: Icon, tone, title, subtitle }) {
  return (
    <div className="school-insights__heading">
      <span className="school-insights__icon" data-tone={tone}>
        <Icon aria-hidden="true" />
      </span>
      <div>
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
    </div>
  );
}

function Figure({ label, value, detail, tone }) {
  return (
    <div className="school-insights__figure" data-tone={tone}>
      <dt>{label}</dt>
      <dd>
        <strong>{fmt(value)}</strong>
        <span>{detail}</span>
      </dd>
    </div>
  );
}

function LegendRow({ tone, label, value, total }) {
  return (
    <li>
      <span className="school-insights__swatch" data-tone={tone} />
      <span className="school-insights__legend-label">{label}</span>
      <strong>{fmt(value)}</strong>
      <span className="school-insights__legend-pct">
        {total ? `${pctOf(value, total)}%` : "—"}
      </span>
    </li>
  );
}

export default function DoctorDashboardInsights({
  eventsData = null,
  eventsLoading = false,
  eventsError = null,
  students = {},
  screening = {},
  screeningLoading = false,
}) {
  /* Events arrive as { total, list: [...] } from /doctor-dashboard/events,
     but tolerate a bare array or { data } too. */
  const events = Array.isArray(eventsData?.list)
    ? eventsData.list
    : Array.isArray(eventsData?.data)
      ? eventsData.data
      : Array.isArray(eventsData)
        ? eventsData
        : [];
  const totalEvents = num(eventsData?.total) || events.length;
  const completedCount = events.filter((event) => event?.completed).length;
  const todayCount = events.filter((event) => event?.is_today).length;
  const upcomingCount = events.filter((event) => event?.is_upcoming).length;

  const totalStudents = num(students?.total);
  const male = num(students?.male);
  const female = num(students?.female);
  const other = num(students?.other);
  const roster = male + female + other || totalStudents;

  const ageRows = Object.entries(students?.ageGroups ?? {})
    .map(([key, value]) => ({ key, value: num(value) }))
    .filter((row) => row.value > 0);
  const maxAge = Math.max(1, ...ageRows.map((row) => row.value));

  const screeningRows = [
    { label: "General", value: num(screening?.general), tone: "green" },
    { label: "Dental", value: num(screening?.dental), tone: "blue" },
    { label: "Vision", value: num(screening?.vision), tone: "violet" },
    { label: "Hearing", value: num(screening?.hearing), tone: "amber" },
  ];
  const screeningTotal = screeningRows.reduce(
    (sum, row) => sum + row.value,
    0,
  );

  if (eventsLoading) {
    return (
      <section
        className="school-insights"
        aria-label="Loading doctor dashboard insights"
        aria-busy="true"
      >
        <div className="school-insights__skeleton">
          <span />
          <span />
          <span />
        </div>
      </section>
    );
  }

  if (eventsError) {
    return (
      <section
        className="school-insights school-insights__message"
        role="alert"
      >
        <Stethoscope aria-hidden="true" />
        <div>
          <h2>Doctor insights are unavailable</h2>
          <p>{eventsError.message || String(eventsError)}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="school-insights" aria-label="Doctor dashboard insights">
      <header className="school-insights__header">
        <span className="school-insights__mark" aria-hidden="true">
          <Stethoscope />
        </span>
        <div>
          <h2>Your camps at a glance</h2>
          <p>Assigned events, students covered, and screening activity.</p>
        </div>
      </header>

      {/* Key figures ------------------------------------------------------ */}
      <section className="school-insights__panel" data-tone="indigo">
        <dl className="school-insights__figures">
          <Figure
            label="Assigned events"
            value={totalEvents}
            detail="Camps on your roster"
            tone="indigo"
          />
          <Figure
            label="Completed"
            value={completedCount}
            detail="Events finished"
            tone="green"
          />
          <Figure
            label="Happening today"
            value={todayCount}
            detail="Scheduled for today"
            tone="blue"
          />
          <Figure
            label="Students covered"
            value={roster}
            detail="Across your assigned events"
            tone="violet"
          />
        </dl>
      </section>

      {/* Assigned events --------------------------------------------------- */}
      <section className="school-insights__panel" data-tone="blue">
        <PanelHeading
          icon={CalendarCheck}
          tone="blue"
          title="Assigned events"
          subtitle={
            totalEvents
              ? `${fmt(totalEvents)} camps · ${fmt(upcomingCount)} upcoming`
              : undefined
          }
        />
        {events.length ? (
          <ul className="school-insights__event-list">
            {events.map((event) => {
              const eventId = event?.event_id ?? event?.id;
              return (
                <li
                  className="school-insights__event"
                  key={eventId ?? event?.event_name}
                >
                  <div className="school-insights__event-main">
                    <p className="school-insights__event-name">
                      {event?.event_name ?? "Event"}
                    </p>
                    <p className="school-insights__event-meta">
                      {[event?.school_name, event?.branch_name]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <p className="school-insights__event-date">
                    {formatDate(event?.date)}
                  </p>
                  <div className="school-insights__event-tags">
                    {event?.completed ? (
                      <span className="school-insights__tag" data-tone="green">
                        Completed
                      </span>
                    ) : null}
                    {event?.is_today ? (
                      <span className="school-insights__tag" data-tone="blue">
                        Today
                      </span>
                    ) : null}
                    {event?.is_upcoming ? (
                      <span className="school-insights__tag" data-tone="amber">
                        Upcoming
                      </span>
                    ) : null}
                    {!event?.completed &&
                    !event?.is_today &&
                    !event?.is_upcoming ? (
                      <span className="school-insights__tag" data-tone="slate">
                        Scheduled
                      </span>
                    ) : null}
                    {event?.is_primary_doctor ? (
                      <span
                        className="school-insights__tag"
                        data-tone="violet"
                      >
                        You lead
                      </span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="school-insights__empty">
            No events are assigned to you yet.
          </p>
        )}
      </section>

      {/* Roster · ages · screening ---------------------------------------- */}
      <div className="school-insights__grid school-insights__grid--care">
        <section className="school-insights__panel" data-tone="blue">
          <PanelHeading
            icon={Users}
            tone="blue"
            title="Students covered"
            subtitle={
              roster ? `${fmt(roster)} students in scope` : undefined
            }
          />
          {roster ? (
            <>
              <div
                className="school-insights__split-bar"
                role="img"
                aria-label={`${pctOf(male, roster)}% boys, ${pctOf(female, roster)}% girls${other ? `, ${pctOf(other, roster)}% other` : ""}`}
              >
                {male ? (
                  <span
                    className="school-insights__split-seg"
                    data-tone="blue"
                    style={{ width: `${pctOf(male, roster)}%` }}
                  />
                ) : null}
                {female ? (
                  <span
                    className="school-insights__split-seg"
                    data-tone="pink"
                    style={{ width: `${pctOf(female, roster)}%` }}
                  />
                ) : null}
                {other ? (
                  <span
                    className="school-insights__split-seg"
                    data-tone="teal"
                    style={{ width: `${pctOf(other, roster)}%` }}
                  />
                ) : null}
              </div>
              <ul className="school-insights__legend">
                <LegendRow
                  tone="blue"
                  label="Boys"
                  value={male}
                  total={roster}
                />
                <LegendRow
                  tone="pink"
                  label="Girls"
                  value={female}
                  total={roster}
                />
                {other ? (
                  <LegendRow
                    tone="teal"
                    label="Other"
                    value={other}
                    total={roster}
                  />
                ) : null}
              </ul>
            </>
          ) : (
            <p className="school-insights__empty">
              No student roster loaded for the selected camp.
            </p>
          )}
        </section>

        <section className="school-insights__panel" data-tone="violet">
          <PanelHeading
            icon={Baby}
            tone="violet"
            title="Age groups"
            subtitle={
              ageRows.length
                ? `${fmt(roster)} students, grouped by age`
                : undefined
            }
          />
          {ageRows.length ? (
            <div className="school-insights__age">
              {ageRows.map((row) => (
                <div
                  className="school-insights__age-col"
                  key={row.key}
                  title={`${row.key === "unknown" ? "Unknown" : `${row.key} years`}: ${fmt(row.value)} students`}
                >
                  <div className="school-insights__age-plot">
                    <span className="school-insights__age-value">
                      {fmt(row.value)}
                    </span>
                    <span
                      className="school-insights__age-bar"
                      style={{
                        height: `${Math.max(2, Math.round((row.value / maxAge) * 100))}px`,
                      }}
                    />
                  </div>
                  <span className="school-insights__age-label">
                    {row.key === "unknown" ? "Unknown" : row.key}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="school-insights__empty">
              No age data for the selected camp.
            </p>
          )}
        </section>

        <section className="school-insights__panel" data-tone="green">
          <PanelHeading
            icon={ClipboardList}
            tone="green"
            title="Screening records"
            subtitle={
              screeningLoading
                ? "Loading screening records…"
                : screeningTotal
                  ? `${fmt(screeningTotal)} records collected`
                  : undefined
            }
          />
          {screeningTotal ? (
            <ul className="school-insights__legend">
              {screeningRows.map((row) => (
                <LegendRow
                  key={row.label}
                  tone={row.tone}
                  label={row.label}
                  value={row.value}
                  total={screeningTotal}
                />
              ))}
            </ul>
          ) : (
            <p className="school-insights__empty">
              {screeningLoading
                ? "Loading screening records…"
                : "No screening records yet for the selected camp."}
            </p>
          )}
        </section>
      </div>
    </section>
  );
}
