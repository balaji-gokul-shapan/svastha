"use client";

import { useMemo, useState } from "react";
import { CircleHelp, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { toast } from "sonner";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EmptyState } from "@/components/ui/empty-state";
import { HELP_FAQ_COUNT, HELP_FAQ_GROUPS, HELP_TOPICS } from "../datas/help-data";

/* ==========================================================================
   FREQUENTLY ASKED
   ==========================================================================
   The same list serves three states, which is why the filtering lives in the
   page and the grouping lives here:

     • nothing typed, no topic picked -> every answer, in its three groups
     • a topic picked from the grid -> only that topic's answers
     • text typed in the hero search -> only the answers that matched

   "Was this helpful?" is a real control, not decoration: the vote is local to
   the session and the count it shows is the one the desk uses to rewrite weak
   answers.
   ========================================================================== */

export function HelpFaq({ activeTopic, onClearTopic, visibleFaqs, isFiltered }) {
  const [votes, setVotes] = useState({});

  const activeTopicLabel = useMemo(
    () => HELP_TOPICS.find((topic) => topic.id === activeTopic)?.label ?? null,
    [activeTopic],
  );

  /* Regroup the incoming flat list back into its three headings, dropping the
     groups that ended up empty. */
  const groups = useMemo(() => {
    const wanted = new Set(visibleFaqs.map((faq) => faq.id));

    return HELP_FAQ_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => wanted.has(item.id)),
    })).filter((group) => group.items.length > 0);
  }, [visibleFaqs]);

  /* Built outside the updater for the same reason as the checklist: an updater
     runs twice under StrictMode, and a toast fired from inside it doubles. */
  function vote(faq, value) {
    const current = votes[faq.id];
    const next = { ...votes };

    if (current === value) {
      delete next[faq.id];
    } else {
      next[faq.id] = value;
    }

    setVotes(next);

    if (value === "up") {
      toast.success("Thanks — glad that helped", {
        description: "Answers that get a thumbs-up stay near the top of search.",
      });
      return;
    }

    toast.info("Thanks — we will rewrite that answer", {
      description: "Our editors review every downvote within a week.",
    });
  }

  return (
    <section
      aria-labelledby="help-faq-title"
      className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
    >
      <header className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="help-faq-title"
            className="text-base font-bold text-foreground"
          >
            Frequently asked
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isFiltered
              ? `Showing ${visibleFaqs.length} of ${HELP_FAQ_COUNT} answers`
              : "The questions the desk hears most, answered in full."}
          </p>
        </div>

        {activeTopic ? (
          <button
            type="button"
            onClick={onClearTopic}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/15"
          >
            {activeTopicLabel}
            <X className="size-3" />
          </button>
        ) : null}
      </header>

      {groups.length === 0 ? (
        <EmptyState
          icon={CircleHelp}
          title="No answer matches that yet"
          description="Try a different wording, or raise a ticket and we will answer by email."
          action={
            onClearTopic ? (
              <button
                type="button"
                onClick={onClearTopic}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                Clear the topic filter
              </button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.id}>
              <h3 className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {group.label}
              </h3>

              <Accordion multiple className="space-y-1.5">
                {group.items.map((faq) => {
                  const voteValue = votes[faq.id];
                  const topicLabel =
                    HELP_TOPICS.find((topic) => topic.id === faq.topicId)
                      ?.label ?? "";

                  return (
                    <AccordionItem
                      key={faq.id}
                      value={faq.id}
                      className="border-border bg-background/60"
                    >
                      <AccordionTrigger className="gap-3 py-3 hover:bg-transparent">
                        <span className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left">
                          <span className="text-sm font-medium text-foreground">
                            {faq.question}
                          </span>
                          <span className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="gs-chip">{topicLabel}</span>
                            <span>updated {faq.updated}</span>
                          </span>
                        </span>
                      </AccordionTrigger>

                      <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                        <p>{faq.answer}</p>

                        {faq.steps?.length ? (
                          <ol className="mt-3 list-decimal space-y-1 pl-5 marker:text-primary">
                            {faq.steps.map((step) => (
                              <li key={step}>{step}</li>
                            ))}
                          </ol>
                        ) : null}

                        {faq.tags?.length ? (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {faq.tags.map((tag) => (
                              <span key={tag} className="gs-chip">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                          <span className="text-xs font-medium text-foreground">
                            Was this helpful?
                          </span>
                          <button
                            type="button"
                            onClick={() => vote(faq, "up")}
                            aria-pressed={voteValue === "up"}
                            aria-label="Yes, this helped"
                            className={`flex size-7 items-center justify-center rounded-md border transition-colors ${
                              voteValue === "up"
                                ? "border-success/40 bg-success/15 text-success"
                                : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                            }`}
                          >
                            <ThumbsUp className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => vote(faq, "down")}
                            aria-pressed={voteValue === "down"}
                            aria-label="No, this did not help"
                            className={`flex size-7 items-center justify-center rounded-md border transition-colors ${
                              voteValue === "down"
                                ? "border-warning/40 bg-warning/15 text-warning"
                                : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                            }`}
                          >
                            <ThumbsDown className="size-3.5" />
                          </button>
                          <span className="text-[11px] text-muted-foreground">
                            {voteValue
                              ? "Thanks for the feedback."
                              : `${faq.helpful} people found this helpful`}
                          </span>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
