"use client";

import { useMemo } from "react";
import { ChevronRight, ThumbsUp } from "lucide-react";

import {
  HELP_ARTICLES,
  HELP_ARTICLE_TYPES,
  HELP_TOPICS,
} from "../datas/help-data";

/* ==========================================================================
   TOPICS + MOST-READ
   ==========================================================================
   Two jobs in one row: the topic grid is the fastest route into the FAQ list
   (clicking a tile filters the answers further down), and the most-read list
   is what people open when they do not know what to search for.

   Tones are the app's domain tokens, so "Vision screening" here looks like the
   Vision screening cards elsewhere in the product. The classes have to be
   literals — Tailwind cannot build a class name from a runtime tone key.
   ========================================================================== */

const TOPIC_TONE = {
  physical: {
    chip: "border-domain-physical/25 bg-domain-physical/12 text-domain-physical",
    hover: "hover:border-domain-physical/45",
  },
  vision: {
    chip: "border-domain-vision/25 bg-domain-vision/12 text-domain-vision",
    hover: "hover:border-domain-vision/45",
  },
  hearing: {
    chip: "border-domain-hearing/25 bg-domain-hearing/12 text-domain-hearing",
    hover: "hover:border-domain-hearing/45",
  },
  oral: {
    chip: "border-domain-oral/25 bg-domain-oral/12 text-domain-oral",
    hover: "hover:border-domain-oral/45",
  },
  immunization: {
    chip: "border-domain-immunization/25 bg-domain-immunization/12 text-domain-immunization",
    hover: "hover:border-domain-immunization/45",
  },
  primary: {
    chip: "border-primary/25 bg-primary/10 text-primary",
    hover: "hover:border-primary/45",
  },
  brand: {
    chip: "border-brand-green/25 bg-brand-green/12 text-brand-green",
    hover: "hover:border-brand-green/45",
  },
};

const NEUTRAL_TONE = {
  chip: "border-border bg-muted text-muted-foreground",
  hover: "hover:border-foreground/25",
};

function toneFor(topicTone) {
  return TOPIC_TONE[topicTone] ?? NEUTRAL_TONE;
}

export function HelpTopics({ activeTopic, onSelectTopic, onOpenArticle }) {
  /* Label lookup for the article list, built once. */
  const topicLabels = useMemo(
    () => new Map(HELP_TOPICS.map((topic) => [topic.id, topic.label])),
    [],
  );

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      <section
        aria-labelledby="help-topics-title"
        className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
      >
        <header className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2
              id="help-topics-title"
              className="text-base font-bold text-foreground"
            >
              Browse by topic
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Pick a topic to filter the answers further down the page.
            </p>
          </div>
          {activeTopic ? (
            <button
              type="button"
              onClick={() => onSelectTopic(null)}
              className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              Clear filter
            </button>
          ) : null}
        </header>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {HELP_TOPICS.map((topic) => {
            const Icon = topic.icon;
            const tone = toneFor(topic.tone);
            const isActive = activeTopic === topic.id;

            return (
              <button
                key={topic.id}
                type="button"
                /* Clicking the active tile again clears it, so the grid is its
                   own toggle and never a dead end. */
                onClick={() => onSelectTopic(isActive ? null : topic.id)}
                aria-pressed={isActive}
                className={`group flex flex-col gap-2 rounded-xl border p-3.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  isActive
                    ? "border-primary/50 bg-primary/[0.05] shadow-sm"
                    : `border-border bg-background/60 ${tone.hover}`
                }`}
              >
                <span
                  className={`flex size-9 items-center justify-center rounded-lg border ${tone.chip}`}
                >
                  <Icon className="size-[18px]" />
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {topic.label}
                </span>
                <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {topic.blurb}
                </span>
                <span className="mt-auto flex items-center gap-1.5 pt-1.5 text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground/80">
                    {topic.articles}
                  </span>
                  articles
                  <span aria-hidden="true">·</span>
                  {topic.minutes} min
                  <ChevronRight className="ml-auto size-3.5 opacity-0 transition-opacity group-hover:opacity-60" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section
        aria-labelledby="help-popular-title"
        className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
      >
        <header className="mb-2">
          <h2
            id="help-popular-title"
            className="text-base font-bold text-foreground"
          >
            Most read this week
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            What other schools opened in the last seven days.
          </p>
        </header>

        <ol className="space-y-0.5">
          {HELP_ARTICLES.map((article, index) => {
            const type =
              HELP_ARTICLE_TYPES[article.type] ?? HELP_ARTICLE_TYPES.guide;
            const TypeIcon = type.icon;

            return (
              <li key={article.id}>
                <button
                  type="button"
                  onClick={() => onOpenArticle(article)}
                  className="group flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/60"
                >
                  <span className="mt-0.5 w-5 shrink-0 text-xs font-bold tabular-nums text-muted-foreground/70">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <TypeIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium leading-snug text-foreground">
                      {article.title}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                      <span className="gs-chip">{type.label}</span>
                      {article.featured ? (
                        <span className="rounded-full bg-brand-green/12 px-1.5 py-0.5 text-[10px] font-bold text-brand-green">
                          Popular
                        </span>
                      ) : null}
                      <span>{topicLabels.get(article.topicId) ?? ""}</span>
                      <span aria-hidden="true">·</span>
                      <span>{article.readMinutes} min</span>
                      <span aria-hidden="true">·</span>
                      <span>{article.views.toLocaleString("en-IN")} views</span>
                    </span>
                  </span>
                  <span className="hidden shrink-0 items-center gap-1 text-[11px] font-semibold text-muted-foreground sm:flex">
                    <ThumbsUp className="size-3" />
                    {article.helpful}%
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
