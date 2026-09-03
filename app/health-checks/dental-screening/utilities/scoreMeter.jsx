"use client";

import { MAX_SCORE, scoreTone, TONE_BADGE_CLASS, TONE_BAR_CLASS } from "../datas/dental-screening-data";

// import { MAX_SCORE, TONE_BADGE_CLASS, TONE_BAR_CLASS, scoreTone } from "./dental-screening-data";

export function ScoreMeter({ label, score }) {
  const tone = scoreTone(score);
  const barClass = TONE_BAR_CLASS[tone];
  const badgeClass = TONE_BADGE_CLASS[tone];

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground">{label}</p>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badgeClass}`}>
          {score} / {MAX_SCORE}
        </span>
      </div>
      <div className="mt-2 flex gap-1">
        {Array.from({ length: MAX_SCORE }).map((_, i) => (
          <span
            key={i}
            className={`h-2 flex-1 rounded-full ${i < score ? barClass : "bg-muted"}`}
          />
        ))}
      </div>
    </div>
  );
}