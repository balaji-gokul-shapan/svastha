/**
 * SECURITY QUESTIONS — shared store
 * ----------------------------------
 * Used by both the Settings set-up page and the login "forgot password" flow,
 * so both read and write the same key.
 *
 * ############################################################################
 * # PLACEHOLDER PERSISTENCE.                                                  #
 * # There is no security-questions endpoint yet, so answers are stored in     #
 * # localStorage in PLAINTEXT. A real implementation must hash them           #
 * # server-side, exactly like a password. Delete this module once the API     #
 * # lands and replace it with a slice + useQuery.                             #
 * ############################################################################
 */

/** NIST SP 800-63B asks for at least two, so two is the target. */
export const REQUIRED_ANSWERS = 2;

/**
 * A fixed list rather than user-authored questions: people pick weak questions
 * ("What is your favourite colour?") when allowed to invent their own.
 * Deliberately avoids mother's maiden name / first pet / first car, all of
 * which appear in public breach dumps.
 */
export const QUESTION_BANK = [
  "What was the name of your first school?",
  "In which city were you born?",
  "What is the name of a teacher you remember?",
  "Which city did you grow up in?",
  "What was the model of your first vehicle?",
  "What is the name of your favourite childhood place?",
];

/** Answers shorter than this are trivially guessable. */
export const MIN_ANSWER_LENGTH = 3;

/** Case/whitespace-insensitive comparison for validating answers. */
export const normaliseAnswer = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

/** Namespaced per employee so two users on one machine never share answers. */
export const storageKeyFor = (userId) =>
  `svastha-security-questions:${userId || "unknown"}`;

/**
 * `useSyncExternalStore` needs a referentially stable snapshot, but
 * `JSON.parse` returns a new array every call — which would loop forever. So
 * the parsed value is memoised against the raw string and only recomputed when
 * the stored text actually changes.
 */
const parsedCache = { raw: null, value: [] };

export const parseAnswers = (raw) => {
  if (parsedCache.raw === raw) return parsedCache.value;

  let value = [];
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    value = Array.isArray(parsed) ? parsed : [];
  } catch {
    // Corrupt entry — treat as "nothing set" rather than crashing settings.
    value = [];
  }

  parsedCache.raw = raw;
  parsedCache.value = value;
  return value;
};

export const makeAnswerStore = (userId) => {
  const key = storageKeyFor(userId);

  return {
    subscribe(onChange) {
      // The `storage` event fires in OTHER tabs only, which is exactly what
      // keeps two open tabs from drifting apart.
      window.addEventListener("storage", onChange);
      return () => window.removeEventListener("storage", onChange);
    },
    getSnapshot() {
      return window.localStorage.getItem(key) ?? "";
    },
    getServerSnapshot() {
      return "";
    },
  };
};

export const writeAnswers = (userId, entries) => {
  try {
    window.localStorage.setItem(
      storageKeyFor(userId),
      JSON.stringify(entries),
    );
    return true;
  } catch {
    // Storage full or blocked (private mode) — the caller surfaces a toast.
    return false;
  }
};

export const clearAnswers = (userId) => {
  try {
    window.localStorage.removeItem(storageKeyFor(userId));
  } catch {
    /* nothing useful to do */
  }
};
