"use client";

import { Fragment } from "react";

import { splitLinks } from "./split-links";

/* ==========================================================================
   LINKIFY
   ==========================================================================
   Renders a line of prose with the addresses inside it already turned into
   links. The matching rules live in ./split-links.js (pure, unit-tested); this
   file is only the JSX layer.

   Use it in PLAIN TEXT cells only — inside another <a> or inside a <button> it
   would produce invalid nested interactive content. For a cell that is itself
   a destination, give the row an `href` and render a single anchor instead.
   ========================================================================== */

const DEFAULT_LINK_CLASS =
  "font-medium text-primary underline decoration-primary/40 underline-offset-2 transition-colors hover:decoration-primary";

/**
 * @param {string} text
 * @param {{ className?: string }} options
 * @returns {React.ReactNode} the text with its addresses wrapped in anchors
 */
export function linkifyText(text, { className = DEFAULT_LINK_CLASS } = {}) {
  const parts = splitLinks(text);

  if (parts.length === 0) return null;

  return parts.map((part, index) =>
    part.href ? (
      <a
        key={`link-${index}`}
        href={part.href}
        className={className}
        {...(part.external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {part.text}
      </a>
    ) : (
      <Fragment key={`text-${index}`}>{part.text}</Fragment>
    ),
  );
}
