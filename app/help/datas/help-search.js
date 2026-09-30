/* ==========================================================================
   HELP & SUPPORT — search
   ==========================================================================
   Deliberately pure and import-free: the content is passed in, so the matching
   rules can be exercised without React, without the icon imports in
   help-data.js and without a bundler. The page builds one instance from the
   demo corpus and reuses it for every keystroke.

   Rules:
     • one character of input returns nothing, so a single letter does not
       dump the whole library on screen
     • every whitespace-separated term must match, so "export card" finds the
       export FAQ without also matching every article that says "card"
     • articles cap at 5 and FAQs at 6, because the dropdown is a shortcut —
       the full lists live further down the page
   ========================================================================== */

function normalise(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

/**
 * @param {{ topics?: object[], articles?: object[], faqGroups?: object[] }} corpus
 * @returns {{ search: (query: string) => { topics: object[], articles: object[], faqs: object[] }, count: (result: object) => number }}
 */
export function createHelpSearch({ topics = [], articles = [], faqGroups = [] } = {}) {
  const flatFaqs = faqGroups.flatMap((group) => group.items ?? []);
  const topicLabel = (id) => topics.find((topic) => topic.id === id)?.label ?? "";

  /* One haystack per row, built once here: the search itself is then plain
     substring checks, with no string joining on every keystroke. */
  const topicRows = topics.map((topic) => ({
    item: topic,
    text: normalise(`${topic.label} ${topic.blurb}`),
  }));
  const articleRows = articles.map((article) => ({
    item: article,
    text: normalise(`${article.title} ${topicLabel(article.topicId)} ${article.type}`),
  }));
  const faqRows = flatFaqs.map((faq) => ({
    item: faq,
    text: normalise(
      `${faq.question} ${faq.answer} ${(faq.tags ?? []).join(" ")}`,
    ),
  }));

  const search = (query) => {
    const needle = normalise(query);

    if (needle.length < 2) {
      return { topics: [], articles: [], faqs: [] };
    }

    const terms = needle.split(/\s+/).filter(Boolean);
    const hit = (row) => terms.every((term) => row.text.includes(term));

    return {
      topics: topicRows.filter(hit).map((row) => row.item),
      articles: articleRows
        .filter(hit)
        .map((row) => row.item)
        .slice(0, 5),
      faqs: faqRows
        .filter(hit)
        .map((row) => row.item)
        .slice(0, 6),
    };
  };

  const count = (result) =>
    (result?.topics?.length ?? 0) +
    (result?.articles?.length ?? 0) +
    (result?.faqs?.length ?? 0);

  return { search, count };
}

/** Topic lookup shared by the grid, the FAQ filter and the ticket chips. */
export function createTopicLookup(topics = []) {
  const byId = new Map(topics.map((topic) => [topic.id, topic]));

  return (id) => byId.get(id) ?? null;
}
