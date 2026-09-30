"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  BookOpen,
  ChevronRight,
  CircleHelp,
  CornerDownLeft,
  PlusCircle,
  Search,
  SearchX,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  HELP_CHANNELS,
  HELP_STATS,
  HELP_SUGGESTED_SEARCHES,
} from "../datas/help-data";

/* ==========================================================================
   HELP HERO
   ==========================================================================
   The one thing a stuck user needs is an answer, so the hero is a search field
   first and everything else second. Typing opens a grouped dropdown (topics,
   articles, FAQ); ⌘K / Ctrl+K focuses it from anywhere on the page.

   Props
     query / onQueryChange  search text, owned by the page so the FAQ section can
                           filter itself with the same terms
     results               the search instance's result set for `query`
     onOpenTopic           (topicId) => jump to the FAQ list, filtered
     onRaiseTicket         opens the compose dialog
     searchRef             the page's ref for the input, so the sticky sub-nav
                           has something to focus
   ========================================================================== */

/* Nothing to subscribe to: the platform cannot change while the page is open.
   Used as the (inert) subscription for useSyncExternalStore below. */
const subscribeNoop = () => () => {};

/* The desk's hours are read from the channel data instead of being written into
   the markup, so this chip and the Reach us panel can never disagree. */
const DESK_HOURS =
  HELP_CHANNELS.find((channel) => channel.id === "chan-chat")?.availability ??
  "";

function ResultRow({ icon: Icon, title, meta, tone = "default", onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
    >
      <span
        className={`flex size-7 shrink-0 items-center justify-center rounded-md ${
          tone === "brand"
            ? "bg-brand-green/12 text-brand-green"
            : "bg-primary/10 text-primary"
        }`}
      >
        <Icon className="size-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">
          {title}
        </span>
        {meta ? (
          <span className="block truncate text-[11px] text-muted-foreground">
            {meta}
          </span>
        ) : null}
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}

function ResultGroup({ label, children }) {
  return (
    <div className="mb-1 last:mb-0">
      <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

export function HelpHero({
  query,
  onQueryChange,
  results,
  onOpenTopic,
  onRaiseTicket,
  searchRef,
}) {
  const [focused, setFocused] = useState(false);
  const localRef = useRef(null);
  const inputRef = searchRef ?? localRef;

  const showResults = focused && query.trim().length >= 2;
  const total =
    results.topics.length + results.articles.length + results.faqs.length;

  /* The shortcut hint is platform-dependent, which makes it a hydration hazard:
     a "Ctrl K" in the server HTML on a Mac logs a mismatch. useSyncExternalStore
     handles this properly — the server snapshot says "not Apple", the client
     corrects it after hydration, and nothing cascades. */
  const isApple = useSyncExternalStore(
    subscribeNoop,
    () => /mac|iphone|ipad/i.test(navigator.userAgent),
    () => false,
  );
  const shortcut = isApple ? "⌘ K" : "Ctrl K";

  /* Focus the field from anywhere on the page with ⌘K / Ctrl+K. */
  useEffect(() => {
    function onKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [inputRef]);

  return (
    <section
      aria-labelledby="help-hero-title"
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7"
    >
      {/* Decoration only: two soft brand washes and a grid that fades out, so
          the heading keeps its contrast in either theme. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-[-12%] size-[24rem] rounded-full bg-primary/12 blur-3xl motion-safe:animate-pulse"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-[-10%] size-[26rem] rounded-full bg-brand-green/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklch, var(--color-border) 70%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--color-border) 70%, transparent) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(ellipse at 25% 0%, black 5%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 25% 0%, black 5%, transparent 70%)",
        }}
      />

      {/* items-start, not items-center: the right rail is the shorter column in
          practice, and centring left a dead void above the heading. */}
      <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
        <div className="min-w-0 grid grid-cols-1 gap-2">
          <p className="inline-flex w-fit max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-success/30 bg-success/[0.08] px-2.5 py-1 shadow-sm backdrop-blur">
            <span aria-hidden="true" className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex size-full rounded-full bg-success/25" />
              <span className="relative inline-flex size-2 rounded-full bg-success ring-2 ring-success/25" />
            </span>
            <span className="text-xs font-semibold text-success">
              Online now
            </span>
            <span
              aria-hidden="true"
              className="hidden h-3 w-px bg-success/30 sm:inline-block"
            />
            <span className="text-[11px] font-medium text-muted-foreground">
              {DESK_HOURS}
            </span>
          </p>

          <h1
            id="help-hero-title"
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            How can we help today?
          </h1>
          <p className="max-w-2/3 text-sm text-muted-foreground">
            Search the help library, follow a setup checklist, or reach the team.
            Most questions are answered in under a minute.
          </p>

          {/* <div className="relative mt-1" role="search">
            <label htmlFor="help-search" className="sr-only">
              Search help articles and answers
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground/80"
            />
            <input
              id="help-search"
              ref={inputRef}
              type="search"
              value={query}
              autoComplete="off"
              placeholder="Try: offline sync, duplicate students, export health card…"
              onChange={(event) => onQueryChange(event.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  onQueryChange("");
                  event.currentTarget.blur();
                }
              }}
              className="h-11 w-full appearance-none rounded-xl border border-border bg-background pl-11 pr-20 text-sm text-foreground shadow-sm outline-none transition-shadow placeholder:text-muted-foreground/80 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center rounded-md border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px] font-semibold text-muted-foreground sm:flex">
                {shortcut}
              </kbd>
            )}

            {showResults ? (
              <div
                role="listbox"
                aria-label="Search results"
                className="absolute inset-x-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl"
              >
                {total === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-3 py-6 text-center">
                    <SearchX className="size-5 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">
                      No match for “{query.trim()}”
                    </p>
                    <p className="max-w-xs text-xs text-muted-foreground">
                      Try a shorter phrase, or raise a ticket and we will answer
                      by email.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={onRaiseTicket}
                    >
                      <PlusCircle className="size-4" />
                      Raise a ticket
                    </Button>
                  </div>
                ) : (
                  <>
                    {results.topics.length ? (
                      <ResultGroup label={`Topics · ${results.topics.length}`}>
                        {results.topics.map((topic) => (
                          <ResultRow
                            key={topic.id}
                            icon={topic.icon}
                            tone="brand"
                            title={topic.label}
                            meta={`${topic.articles} articles · ${topic.minutes} min`}
                            onSelect={() => onOpenTopic(topic.id)}
                          />
                        ))}
                      </ResultGroup>
                    ) : null}

                    {results.articles.length ? (
                      <ResultGroup
                        label={`Articles · ${results.articles.length}`}
                      >
                        {results.articles.map((article) => (
                          <ResultRow
                            key={article.id}
                            icon={BookOpen}
                            title={article.title}
                            meta={`${article.readMinutes} min read`}
                            onSelect={() => onOpenTopic(article.topicId)}
                          />
                        ))}
                      </ResultGroup>
                    ) : null}

                    {results.faqs.length ? (
                      <ResultGroup label={`Answers · ${results.faqs.length}`}>
                        {results.faqs.map((faq) => (
                          <ResultRow
                            key={faq.id}
                            icon={CircleHelp}
                            title={faq.question}
                            meta={`${faq.helpful} found this helpful`}
                            onSelect={() => onOpenTopic(faq.topicId)}
                          />
                        ))}
                      </ResultGroup>
                    ) : null}
                  </>
                )}
              </div>
            ) : null}

            {!query ? (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Popular
                </span>
                {HELP_SUGGESTED_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => onQueryChange(term)}
                    className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                  >
                    {term}
                  </button>
                ))}
              </div>
            ) : null}
          </div> */}
          <aside className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              {HELP_STATS.map((stat) => {
                const StatIcon = stat.icon;

                return (
                  <div
                    key={stat.id}
                    className="rounded-xl border border-border bg-background/70 p-2.5 backdrop-blur"
                  >
                    <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <StatIcon className="size-3.5" />
                    </span>
                    <p className="mt-1.5 text-lg font-bold tabular-nums leading-none text-foreground">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-[10px] leading-tight text-muted-foreground/80">
                      {stat.meta}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Copy deliberately avoids repeating the stat tiles above it
                ("12 min first reply", "96% rated helpful") — saying the same
                number twice makes both look like filler. */}
            <div className="rounded-xl border border-primary/25 bg-primary/[0.06] p-3">
              <p className="text-sm font-semibold text-foreground">
                Still stuck?
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Raise a ticket and the whole thread stays with your school — no
                digging through email later.
              </p>
              <Button
                type="button"
                onClick={onRaiseTicket}
                className="mt-2.5 w-full"
              >
                <PlusCircle className="size-4" />
                Raise a ticket
              </Button>
            </div>
          </aside>
        </div>

          {/* Right column: how the desk is doing, then the two ways to reach it. */}
          {/* <aside className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              {HELP_STATS.map((stat) => {
                const StatIcon = stat.icon;

                return (
                  <div
                    key={stat.id}
                    className="rounded-xl border border-border bg-background/70 p-2.5 backdrop-blur"
                  >
                    <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <StatIcon className="size-3.5" />
                    </span>
                    <p className="mt-1.5 text-lg font-bold tabular-nums leading-none text-foreground">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-[10px] leading-tight text-muted-foreground/80">
                      {stat.meta}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-xl border border-primary/25 bg-primary/[0.06] p-3">
              <p className="text-sm font-semibold text-foreground">
                Still stuck?
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Raise a ticket and the whole thread stays with your school — no
                digging through email later.
              </p>
              <Button
                type="button"
                onClick={onRaiseTicket}
                className="mt-2.5 w-full"
              >
                <PlusCircle className="size-4" />
                Raise a ticket
              </Button>
            </div>
          </aside> */}
      </div>
    </section>
  );
}


