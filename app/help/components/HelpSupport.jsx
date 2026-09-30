"use client";

import { useState } from "react";
import {
  Activity,
  CalendarClock,
  ExternalLink,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  HELP_CHANNELS,
  HELP_ESCALATION,
  HELP_HOURS,
  HELP_INCIDENTS,
  HELP_SERVICES,
  HELP_SERVICE_STATE,
  HELP_TIMEZONE,
} from "../datas/help-data";
import { linkifyText } from "../utilities/linkify";

/* ==========================================================================
   REACH US
   ==========================================================================
   Three questions, one panel: is the platform healthy, how do I get a human,
   and how fast will they come. The status board is derived from the service
   list rather than hard-coded, so flipping one service to "outage" in the data
   flips the headline and the banner with it.

   Everything on this page is demo data: the channel buttons and the refresh
   button acknowledge locally instead of calling anything.
   ========================================================================== */

/* Shared by the link and the button flavour, so the two cards can never drift
   apart visually. */
const CHANNEL_CARD =
  "flex h-full w-full flex-col gap-1 rounded-xl border border-border bg-background/60 p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/[0.04] focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

function overallState(services) {
  if (services.some((service) => service.state === "outage")) {
    return { key: "outage", label: "We are working on an incident" };
  }
  if (services.some((service) => service.state === "degraded")) {
    return { key: "degraded", label: "Working, with one service slower" };
  }
  return { key: "operational", label: "All systems operational" };
}

export function HelpSupport() {
  /* Null until the user refreshes, so the server and the first client render
     agree on the wording (a live clock would be a hydration mismatch). */
  const [checkedAt, setCheckedAt] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const overall = overallState(HELP_SERVICES);
  const overallMeta = HELP_SERVICE_STATE[overall.key];
  const degraded = HELP_SERVICES.filter(
    (service) => service.state !== "operational",
  );

  async function refresh() {
    setRefreshing(true);
    /* Demo latency, so the spinner is honest about doing something. */
    await new Promise((resolve) => setTimeout(resolve, 550));
    setCheckedAt(
      new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
    setRefreshing(false);
    toast.success("Status refreshed");
  }

  function openChannel(channel) {
    toast.info(`${channel.label} is not connected in this demo`, {
      description: channel.detail,
    });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-1">
      {/* <section
        aria-labelledby="help-status-title"
        className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
      >
        <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="help-status-title"
              className="text-base font-bold text-foreground"
            >
              Platform status
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {checkedAt ? `Checked at ${checkedAt}` : "Checked moments ago"}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`size-3.5 ${
                refreshing ? "animate-spin motion-reduce:animate-none" : ""
              }`}
            />
            {refreshing ? "Checking" : "Refresh"}
          </Button>
        </header>


        <div className="flex items-center gap-2.5 rounded-xl border border-border bg-background/60 px-3 py-2.5">
          <span className="relative flex size-2.5" aria-hidden="true">
            {overall.key !== "operational" ? (
              <span
                className={`absolute inline-flex size-full animate-ping rounded-full opacity-70 motion-reduce:hidden ${overallMeta.dot}`}
              />
            ) : null}
            <span
              className={`relative inline-flex size-2.5 rounded-full ${overallMeta.dot}`}
            />
          </span>
          <p className="text-sm font-semibold text-foreground">{overall.label}</p>
          {degraded.length ? (
            <p className="ml-auto truncate text-[11px] text-muted-foreground">
              {degraded.map((service) => service.name).join(", ")}
            </p>
          ) : null}
        </div>

        <ul className="mt-3 space-y-1.5">
          {HELP_SERVICES.map((service) => {
            const Icon = service.icon;
            const meta = HELP_SERVICE_STATE[service.state];

            return (
              <li
                key={service.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-background/50 px-3 py-2"
              >
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                  {service.name}
                </span>
                <span className="hidden text-[11px] tabular-nums text-muted-foreground sm:inline">
                  {service.uptime} uptime
                </span>
                <span className="hidden text-[11px] tabular-nums text-muted-foreground md:inline">
                  {service.latency}
                </span>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.chip}`}
                >
                  {meta.label}
                </span>
              </li>
            );
          })}
        </ul>

        <h3 className="mb-1.5 mt-4 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Recent incidents
        </h3>
        <ol className="space-y-1.5">
          {HELP_INCIDENTS.map((incident) => (
            <li
              key={incident.id}
              className="rounded-lg border border-border bg-background/50 px-3 py-2"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Activity className="size-3.5 shrink-0 text-muted-foreground" />
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {incident.title}
                </p>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                    incident.state === "monitoring"
                      ? HELP_SERVICE_STATE.degraded.chip
                      : HELP_SERVICE_STATE.operational.chip
                  }`}
                >
                  {incident.state === "monitoring" ? "Monitoring" : "Resolved"}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {incident.when} · {incident.impact} · {incident.duration} ·{" "}
                {incident.updates} updates
              </p>
            </li>
          ))}
        </ol>
      </section> */}

      <section
        aria-labelledby="help-channels-title"
        className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
      >
        <header className="mb-3">
          <h2
            id="help-channels-title"
            className="text-base font-bold text-foreground"
          >
            Reach a human
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            In-app chat carries your page and role, so nobody asks you to repeat
            what you were doing.
          </p>
        </header>

        {/* A channel WITH an href is a real link — tel:, mailto:, https:// or a
            maps search — so the entire card is the hit area and gets the
            external-link affordance. Channels without one stay buttons, because
            there is no live channel wired up in the demo.

            Deliberately no linkifyText() in here: an <a> nested inside another
            <a> (or inside a <button>) is invalid HTML. Linkifying belongs in
            plain text cells — see the support hours table below. */}
        <ul className="grid gap-2 sm:grid-cols-2">
          {HELP_CHANNELS.map((channel) => {
            const Icon = channel.icon;
            const isLink = Boolean(channel.href);
            /* tel: and mailto: hand off to the OS, so a new tab would be a dead
               end; web links must not hand the opener window over either. */
            const opensNewTab =
              isLink &&
              !channel.href.startsWith("tel:") &&
              !channel.href.startsWith("mailto:");

            const body = (
              <>
                <span className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <span className="text-md font-semibold text-foreground">
                    {channel.label}
                  </span>
                  {isLink ? (
                    <ExternalLink
                      aria-hidden="true"
                      className="ml-auto size-3.5 text-primary"
                    />
                  ) : null}
                </span>

                {/* The postal address is a full string: clamped to two lines
                    with the whole value in the title, so one card cannot make
                    its whole row five rows tall. */}
                <span
                  className="line-clamp-2 text-sm text-muted-foreground"
                  title={channel.detail}
                >
                  {channel.detail}
                </span>

                <span className="mt-auto pt-1.5 text-[11px] text-muted-foreground">
                  {channel.availability}
                </span>

                {channel.response ? (
                  <span className="text-[11px] font-semibold text-primary">
                    {channel.response}
                  </span>
                ) : null}
              </>
            );

            return (
              <li key={channel.id}>
                {isLink ? (
                  <a
                    href={channel.href}
                    className={CHANNEL_CARD}
                    {...(opensNewTab
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {body}
                  </a>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => openChannel(channel)}
                    className={CHANNEL_CARD}
                  >
                    {body}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>

        <h3 className="mb-1.5 mt-4 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Support hours
        </h3>
        {/* Explicit row rules, not `divide-y`: this stylesheet has a global
            `* { border-width: 0 }`, and Tailwind's divide utility is emitted
            through :where() (zero specificity), so it never paints here. */}
        <ul className="overflow-hidden rounded-xl border border-border">
          {HELP_HOURS.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border bg-background/50 px-3 py-2 last:border-b-0"
            >
              <span className="flex min-w-[10rem] flex-1 items-center gap-2 text-sm text-foreground">
                <CalendarClock
                  className="size-3.5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                {row.days}
              </span>
              <span className="text-xs font-semibold tabular-nums text-foreground">
                {row.time}
              </span>
              <span className="w-full text-[11px] text-muted-foreground sm:w-auto">
                {/* A note is free text, so any email or URL inside it becomes a
                    link automatically. A row may also declare its own href when
                    the whole cell is a destination. */}
                {row.href ? (
                  <a
                    href={row.href}
                    className="font-medium text-primary underline underline-offset-2"
                  >
                    {row.note}
                  </a>
                ) : (
                  linkifyText(row.note)
                )}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-muted-foreground">{HELP_TIMEZONE}</p>
      </section>

      {/* Escalation ladder, full width: it answers "who do I shout at when this
          is still broken?", which reads better as one strip than as a third
          column. */}
      {/* <section
        aria-labelledby="help-escalation-title"
        className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5 xl:col-span-2"
      >
        <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2
              id="help-escalation-title"
              className="text-base font-bold text-foreground"
            >
              If it is still broken
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Every ticket escalates on its own clock — you never have to ask
              twice.
            </p>
          </div>
          <p className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-[11px] font-semibold text-warning">
            <ShieldAlert className="size-3.5" />
            Camp-day outages jump to Tier 3
          </p>
        </header>

        <ol className="grid gap-2 md:grid-cols-3">
          {HELP_ESCALATION.map((tier) => (
            <li
              key={tier.id}
              className="rounded-xl border border-border bg-background/60 p-3.5"
            >
              <p className="text-sm font-semibold text-foreground">{tier.tier}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {tier.who}
              </p>
              <p className="mt-2 text-[11px] font-semibold text-primary">
                {tier.respond}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{tier.scope}</p>
            </li>
          ))}
        </ol>
      </section> */}
    </div>
  );
}
