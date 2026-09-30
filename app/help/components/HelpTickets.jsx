"use client";

import { useMemo, useState } from "react";
import {
  Clock,
  Mail,
  MessageCircle,
  MessagesSquare,
  PhoneCall,
  PlusCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { HELP_PRIORITY, HELP_STATUS, HELP_TOPICS } from "../datas/help-data";

/* ==========================================================================
   MY TICKETS
   ==========================================================================
   Support without a ticket list feels like shouting into a void, so the school
   sees its own threads, who is on them and how much of the response promise is
   left. The SLA meter is the reason this section exists: a "High" ticket with
   two hours left should feel different from one with twenty.

   Props
     tickets       the live list (the page owns it, so a ticket created in the
                   dialog appears here immediately)
     onNewTicket   opens the compose dialog
   ========================================================================== */

/* The data speaks in tone words; the Badge component speaks in variants. */
const BADGE_TONE = {
  good: "good",
  warning: "warning",
  bad: "severe",
  primary: "default",
  muted: "outline",
};

const CHANNEL_ICON = {
  "in-app": MessageCircle,
  email: Mail,
  phone: PhoneCall,
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "waiting", label: "Waiting on you" },
  { id: "pending", label: "Pending" },
  { id: "resolved", label: "Resolved" },
];

/* Green while there is room, amber when it tightens, red once it is late. */
function slaTone(hoursLeft, targetHours) {
  if (hoursLeft <= 0) return { bar: "bg-destructive", text: "text-destructive" };
  const ratio = hoursLeft / targetHours;
  if (ratio > 0.5) return { bar: "bg-success", text: "text-muted-foreground" };
  if (ratio > 0.2) return { bar: "bg-warning", text: "text-warning" };
  return { bar: "bg-destructive", text: "text-destructive" };
}

export function HelpTickets({ tickets, onNewTicket }) {
  const [filter, setFilter] = useState("all");

  const counts = useMemo(
    () =>
      FILTERS.reduce((accumulator, entry) => {
        accumulator[entry.id] =
          entry.id === "all"
            ? tickets.length
            : tickets.filter((ticket) => ticket.status === entry.id).length;
        return accumulator;
      }, {}),
    [tickets],
  );

  const visible = useMemo(
    () =>
      filter === "all"
        ? tickets
        : tickets.filter((ticket) => ticket.status === filter),
    [tickets, filter],
  );

  return (
    <section
      aria-labelledby="help-tickets-title"
      className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
    >
      <header className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="help-tickets-title"
            className="text-base font-bold text-foreground"
          >
            Tickets raised by your school
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Every thread stays with the school, so nothing is lost in an inbox.
          </p>
        </div>
        <Button type="button" onClick={onNewTicket}>
          <PlusCircle className="size-4" />
          New ticket
        </Button>
      </header>

      {/* Filter chips double as a status summary. */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {FILTERS.map((entry) => {
          const isActive = filter === entry.id;

          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => setFilter(entry.id)}
              aria-pressed={isActive}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                isActive
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border bg-muted/40 text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {entry.label}
              <span className="ml-1.5 tabular-nums opacity-70">
                {counts[entry.id]}
              </span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title="Nothing in this state"
          description="No ticket from your school is currently waiting in this state."
          action={
            <Button type="button" variant="outline" onClick={onNewTicket}>
              <PlusCircle className="size-4" />
              Raise a ticket
            </Button>
          }
        />
      ) : (
        <ul className="space-y-2">
          {visible.map((ticket) => {
            const status = HELP_STATUS[ticket.status] ?? HELP_STATUS.open;
            const priority =
              HELP_PRIORITY[ticket.priority] ?? HELP_PRIORITY.normal;
            const ChannelIcon = CHANNEL_ICON[ticket.channel] ?? MessageCircle;
            const topic = HELP_TOPICS.find((item) => item.id === ticket.topicId);
            const isLive = ticket.status !== "resolved";
            const tone = slaTone(ticket.slaHoursLeft, priority.slaHours);

            return (
              <li
                key={ticket.id}
                className="rounded-xl border border-border bg-background/60 p-3.5 transition-colors hover:border-primary/25"
              >
                <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="gs-chip">{ticket.id}</span>
                      <Badge
                        variant={BADGE_TONE[status.tone]}
                        className="text-[11px]"
                      >
                        {status.label}
                      </Badge>
                      <Badge
                        variant={BADGE_TONE[priority.tone]}
                        className="text-[11px]"
                      >
                        {priority.label}
                      </Badge>
                      {topic ? (
                        <span className="text-[11px] text-muted-foreground">
                          {topic.label}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1.5 text-sm font-semibold leading-snug text-foreground">
                      {ticket.subject}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <ChannelIcon className="size-3" />
                        {ticket.channel}
                      </span>
                      <span>opened {ticket.created}</span>
                      <span>updated {ticket.updated}</span>
                      <span className="inline-flex items-center gap-1">
                        <MessagesSquare className="size-3" />
                        {ticket.messages}
                      </span>
                    </p>
                  </div>

                  {/* The avatar is the human on the ticket; the title attribute
                      carries the name for pointer users. */}
                  <span
                    className="gs-avatar shrink-0"
                    title={`${ticket.assignee.name} · ${ticket.assignee.role}`}
                  >
                    {ticket.assignee.initials}
                  </span>
                </div>

                {isLive ? (
                  <div className="mt-3 flex items-center gap-3 border-t border-border pt-2.5">
                    <Clock
                      className={`size-3.5 shrink-0 ${tone.text}`}
                      aria-hidden="true"
                    />
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${tone.bar} transition-[width] duration-500 motion-reduce:transition-none`}
                        style={{
                          /* Never a zero-width bar: an empty meter reads as a
                             rendering bug rather than "just started". */
                          width: `${Math.max(
                            6,
                            Math.min(
                              100,
                              (ticket.slaHoursLeft / priority.slaHours) * 100,
                            ),
                          )}%`,
                        }}
                      />
                    </div>
                    <span
                      className={`shrink-0 text-[11px] font-semibold tabular-nums ${tone.text}`}
                    >
                      {ticket.slaHoursLeft > 0
                        ? `${ticket.slaHoursLeft} h left`
                        : "past target"}
                    </span>
                  </div>
                ) : (
                  <p className="mt-3 border-t border-border pt-2.5 text-[11px] text-muted-foreground">
                    {status.hint} · {priority.label.toLowerCase()} priority
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
