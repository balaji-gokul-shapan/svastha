"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { HelpFaq } from "./components/HelpFaq";
import { HelpHero } from "./components/HelpHero";
import { HelpStartHere } from "./components/HelpStartHere";
import { HelpSupport } from "./components/HelpSupport";
import { HelpTicketDialog } from "./components/HelpTicketDialog";
import { HelpTickets } from "./components/HelpTickets";
import { HelpTopics } from "./components/HelpTopics";
import {
  HELP_AGENTS,
  HELP_ARTICLES,
  HELP_FAQ_GROUPS,
  HELP_PRIORITY,
  HELP_TICKETS,
  HELP_TOPICS,
} from "./datas/help-data";
import { createHelpSearch } from "./datas/help-search";

/* ==========================================================================
   HELP & SUPPORT
   ==========================================================================
   The page is a thin conductor: it owns the three pieces of state that more
   than one section needs — the search text, the topic filter and the ticket
   list — and every section below is a pure presentation of them.

   The nav item already exists (app/components/layout/nav-items.js →
   "Help & Support" → /help) and /help has no entry in lib/route-roles.js, so
   the page is reachable by every authenticated role with no extra wiring.

   All content is demo data from ./datas.
   ========================================================================== */

const SECTIONS = [
  { id: "start", label: "Start here" },
  { id: "topics", label: "Topics" },
  { id: "faq", label: "Answers" },
  { id: "tickets", label: "Tickets" },
  { id: "support", label: "Reach us" },
];

const ALL_FAQS = HELP_FAQ_GROUPS.flatMap((group) => group.items);

export default function HelpPage() {
  const [query, setQuery] = useState("");
  const [activeTopic, setActiveTopic] = useState(null);
  const [tickets, setTickets] = useState(HELP_TICKETS);
  const [ticketOpen, setTicketOpen] = useState(false);
  /* Bumped on every open so the dialog remounts and re-reads `defaultTopicId`
     — cheaper and more honest than syncing state through an effect. */
  const [ticketSeed, setTicketSeed] = useState(0);
  const [ticketTopic, setTicketTopic] = useState(null);
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const searchRef = useRef(null);

  const { search } = useMemo(
    () =>
      createHelpSearch({
        topics: HELP_TOPICS,
        articles: HELP_ARTICLES,
        faqGroups: HELP_FAQ_GROUPS,
      }),
    [],
  );

  const results = useMemo(() => search(query), [search, query]);

  /* The answer list is the intersection of the two filters: a topic chosen from
     the grid, and the words typed in the hero (only once there are enough
     characters for the search to mean something). */
  const isFiltered = Boolean(activeTopic) || query.trim().length >= 2;
  const visibleFaqs = useMemo(() => {
    const byTopic = activeTopic
      ? ALL_FAQS.filter((faq) => faq.topicId === activeTopic)
      : ALL_FAQS;

    if (query.trim().length < 2) return byTopic;

    const matched = new Set(results.faqs.map((faq) => faq.id));
    return byTopic.filter((faq) => matched.has(faq.id));
  }, [activeTopic, query, results]);

  /* Scroll spy for the sticky section nav. rootMargin keeps the "current"
     section clear of the bar itself and the bottom of the viewport. */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -55% 0px", threshold: 0 },
    );

    SECTIONS.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const openTicketDialog = useCallback(
    (topicId = null) => {
      setTicketTopic(topicId ?? activeTopic);
      setTicketSeed((seed) => seed + 1);
      setTicketOpen(true);
    },
    [activeTopic],
  );

  /* A ticket created in the dialog lands at the top of the list immediately —
     the page owns the list precisely so this stays instant. */
  const handleCreateTicket = useCallback(
    (draft) => {
      const priority = HELP_PRIORITY[draft.priority] ?? HELP_PRIORITY.normal;
      const id = `SV-${4900 + tickets.length + 1}`;
      const agent = HELP_AGENTS[tickets.length % HELP_AGENTS.length];

      setTickets([
        {
          id,
          subject: draft.subject,
          topicId: draft.topicId,
          status: "open",
          priority: draft.priority,
          channel: "in-app",
          created: "just now",
          updated: "just now",
          assignee: agent,
          slaHoursLeft: priority.slaHours,
          messages: 1,
        },
        ...tickets,
      ]);

      toast.success(`${id} raised`, {
        description: `${agent.name} has it, and we aim to reply within ${priority.slaHours} h.`,
      });
    },
    [tickets],
  );

  const jumpTo = useCallback((id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  /* Topic tiles, hero results and the article list all funnel here: filter the
     answers, then take the reader to them. */
  const openTopic = useCallback(
    (topicId) => {
      setActiveTopic(topicId);
      jumpTo("faq");
    },
    [jumpTo],
  );

  const openArticle = useCallback(
    (article) => {
      setActiveTopic(article.topicId);
      jumpTo("faq");
    },
    [jumpTo],
  );

  return (
    <div className="mx-auto w-full max-w-[80rem] pb-10">
      <HelpHero
        query={query}
        onQueryChange={setQuery}
        results={results}
        onOpenTopic={openTopic}
        onRaiseTicket={() => openTicketDialog()}
        searchRef={searchRef}
      />

      {/* Sticky section nav. The negative margins cancel the shell's own page
          padding so the bar spans the full width; the blur keeps content
          readable as it scrolls underneath. */}
      {/* <nav
        aria-label="Help sections"
        className="sticky top-0 z-20 -mx-4 mt-4 border-y border-border bg-background/85 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6"
      >
        <ul className="flex items-center gap-1 overflow-x-auto">
          {SECTIONS.map((section) => {
            const isActive = activeSection === section.id;

            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  aria-current={isActive ? "true" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    jumpTo(section.id);
                  }}
                  className={`inline-flex whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {section.label}
                </a>
              </li>
            );
          })}

          <li className="ml-auto">
            <button
              type="button"
              onClick={() => searchRef.current?.focus()}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Search className="size-3.5" />
              Search
            </button>
          </li>
        </ul>
      </nav> */}


      <div className="mt-4 space-y-4">
        {/* <section id="start" className="scroll-mt-20">
          <HelpStartHere />
        </section> */}

        {/* <section id="topics" className="scroll-mt-20">
          <HelpTopics
            activeTopic={activeTopic}
            onSelectTopic={setActiveTopic}
            onOpenArticle={openArticle}
          />
        </section> */}

        {/* <section id="faq" className="scroll-mt-20">
          <HelpFaq
            activeTopic={activeTopic}
            onClearTopic={() => setActiveTopic(null)}
            visibleFaqs={visibleFaqs}
            isFiltered={isFiltered}
          />
        </section> */}

        {/* <section id="tickets" className="scroll-mt-20">
          <HelpTickets
            tickets={tickets}
            onNewTicket={() => openTicketDialog()}
          />
        </section> */}

        <section id="support" className="scroll-mt-20">
          <HelpSupport />
        </section>
      </div>

      <HelpTicketDialog
        key={ticketSeed}
        open={ticketOpen}
        onClose={() => setTicketOpen(false)}
        onCreate={handleCreateTicket}
        defaultTopicId={ticketTopic}
      />
    </div>
  );
}
