/* ==========================================================================
   LINK SPLITTING
   ==========================================================================
   The pure half of linkify: turns a line of prose into an ordered list of
   plain-text and link parts. No React here on purpose — this is the part worth
   unit-testing, and it is what linkify.jsx renders.

   Detected, because the pattern is unambiguous:
     • email   → mailto:
     • http(s) → the URL itself
     • www.    → https:// prefixed
     • +91 …   → tel:   (a leading + is required — see below)

   Deliberately NOT auto-detected, because guessing would be worse than useless:
     • a bare local number ("48210", "044 2842 1000") — give the row an explicit
       href instead, so we never dial the wrong thing
     • a location — there is no universal scheme, so pass a maps/search URL
   ========================================================================== */

/* Built per call rather than shared at module scope: a module-level /g regex
   carries `lastIndex` between calls, which breaks under concurrent rendering. */
const PATTERN_SOURCE = [
  "(?<email>[\\w.+-]+@[\\w-]+(?:\\.[\\w-]+)+)",
  "|(?<url>(?:https?:\\/\\/|www\\.)[^\\s<>()]+)",
  "|(?<tel>\\+[\\d][\\d\\s().-]{7,}\\d)",
].join("");

/* A URL at the end of a sentence swallows the full stop, which would then travel
   inside the href — so the punctuation is cut back off. */
const TRAILING_PUNCTUATION = /[.,;:!?]+$/;

/**
 * @param {string} text
 * @returns {Array<{ text: string, href?: string, external?: boolean }>}
 *   ordered parts; entries with an `href` are the links
 */
export function splitLinks(text) {
  const source = String(text ?? "");

  if (!source) return [];

  const pattern = new RegExp(PATTERN_SOURCE, "g");
  const parts = [];
  let cursor = 0;
  let match;

  while ((match = pattern.exec(source)) !== null) {
    const raw = match[0];
    const trailing = raw.match(TRAILING_PUNCTUATION)?.[0] ?? "";
    const value = trailing ? raw.slice(0, raw.length - trailing.length) : raw;

    /* Only ever the empty string (a lone full stop) — bail rather than risk a
       zero-length match spinning the loop. */
    if (!value) break;

    if (match.index > cursor) parts.push({ text: source.slice(cursor, match.index) });

    const href = match.groups?.email
      ? `mailto:${value}`
      : match.groups?.tel
        ? `tel:${value.replace(/[^\d+]/g, "")}`
        : value.startsWith("www.")
          ? `https://${value}`
          : value;

    parts.push({
      text: value,
      href,
      /* tel: and mailto: hand off to the OS, so a new tab would be a dead end. */
      external: !href.startsWith("mailto:") && !href.startsWith("tel:"),
    });

    /* cursor advances past the punctuation too — it is emitted as its own text
       part below, so leaving it inside the final slice would print it twice. */
    cursor = match.index + raw.length;
    if (trailing) parts.push({ text: trailing });
  }

  if (cursor < source.length) parts.push({ text: source.slice(cursor) });

  return parts;
}
