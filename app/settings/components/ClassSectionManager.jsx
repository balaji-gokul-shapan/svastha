"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { TextField } from "@/components/ui/text-field";
import { Checkbox } from "@/components/ui/checkbox";

/* =========================================================
   TagInput — generic chip editor. Not tied to a fixed option
   list, since section names like "C1"/"C2" are free-form.
   ========================================================= */

function TagInput({ tags, onChange, placeholder = "Add section..." }) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (raw) => {
    const value = raw.trim().toUpperCase();
    if (!value || tags.includes(value)) {
      setInputValue("");
      return;
    }
    onChange([...tags, value]);
    setInputValue("");
  };

  const removeTag = (value) => onChange(tags.filter((t) => t !== value));

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(inputValue);
    } else if (event.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring/30">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 py-0.5 pl-2 pr-1 text-xs font-medium text-primary"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            aria-label={`Remove section ${tag}`}
            className="rounded-full p-0.5 text-primary/70 hover:bg-primary/20 hover:text-primary"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(inputValue)}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="min-w-[100px] flex-1 border-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
    </div>
  );
}

/* =========================================================
   Class & Section Manager
   ========================================================= */

const CLASSES = Array.from({ length: 12 }, (_, i) => String(i + 1));
const QUICK_SECTIONS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
];

// Seed data — Class 11/12 already have the mixed A/B/C1/C2 pattern from
// your example; the rest default to a plain A/B/C split. Swap this
// initial state for whatever you fetch from your API.
const INITIAL_SECTIONS = {
  1: ["A", "B"],
  2: ["A", "B"],
  3: ["A", "B"],
  4: ["A", "B"],
  5: ["A", "B", "C"],
  6: ["A", "B", "C"],
  7: ["A", "B", "C"],
  8: ["A", "B", "C"],
  9: ["A", "B", "C"],
  10: ["A", "B", "C"],
  11: ["A", "B", "C1", "C2"],
  12: ["A", "B", "C1", "C2"],
};

export default function ClassSectionManager({
  classSections: initialClassSections = [],
  getSchoolBranch,
  subAccountBranch = {},
  onClassSectionsChange,
}) {
  // ---------------------------------------------------------------
  // Normalization — accept the previleges payload in ANY of its shapes:
  //   • array of objects: [{"class":"1","section":"A"}, …]
  //   • JSON string of that array
  //   • map of class → sections: { "1": ["A","B"] }
  // Everything is converted to the internal map shape.
  // ---------------------------------------------------------------
  function normalizeToMap(input) {
    if (!input) return {};

    // JSON-encoded string → parse first.
    if (typeof input === "string") {
      const text = input.trim();
      if (text.startsWith("[") || text.startsWith("{")) {
        try {
          return normalizeToMap(JSON.parse(text));
        } catch {
          return {};
        }
      }
      return {};
    }

    // Array of { class, section } entries → group sections per class.
    if (Array.isArray(input)) {
      const map = {};
      input.forEach((entry) => {
        if (entry && typeof entry === "object") {
          const cls = String(entry.class ?? entry.Class ?? "").trim();
          const sec = String(entry.section ?? entry.Section ?? "").trim();
          if (!cls || !sec) return;
          map[cls] = map[cls] || [];
          if (!map[cls].includes(sec)) map[cls].push(sec);
        } else if (typeof entry === "string") {
          // "3-A" legacy form.
          const [cls, sec] = entry.split("-").map((p) => p.trim());
          if (cls && sec) {
            map[cls] = map[cls] || [];
            if (!map[cls].includes(sec)) map[cls].push(sec);
          }
        }
      });
      return map;
    }

    // Already a plain map — pass through.
    if (typeof input === "object") return input;
    return {};
  }

  // Convert the internal map back to the previleges array format
  // ([{ class, section }, …]) so anything saved matches the backend shape.
  function mapToPrevileges(map) {
    return Object.entries(map || {}).flatMap(([cls, sections]) =>
      (Array.isArray(sections) ? sections : [sections]).map((sec) => ({
        class: String(cls),
        section: String(sec),
      })),
    );
  }

  const [classSections, setClassSections] = useState(() =>
    normalizeToMap(initialClassSections),
  );
  const [activeClass, setActiveClass] = useState("11");
  const [showApply, setShowApply] = useState(false);
  const [applyTargets, setApplyTargets] = useState([]);
  console.log("initialClassSections", initialClassSections);
  console.log("activeClass", activeClass);

  // Re-sync when the parent loads/changes the privileges AFTER mount
  // (e.g. the account being edited arrives from the API later).
  const incomingKey = JSON.stringify(normalizeToMap(initialClassSections));
  const lastIncomingKey = useRef(incomingKey);
  useEffect(() => {
    if (incomingKey !== lastIncomingKey.current) {
      lastIncomingKey.current = incomingKey;
      setClassSections(normalizeToMap(initialClassSections));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingKey]);

  // Push classSections up to the parent form whenever it changes —
  // emitted in the previleges array format [{ class, section }, …].
  // The very first run is skipped: echoing the initial value straight back
  // would overwrite the form's privileges with an empty list (e.g. while
  // editing an account whose privileges came back as a flat string).
  const didEmitInitial = useRef(false);
  useEffect(() => {
    if (!onClassSectionsChange) return;
    if (!didEmitInitial.current) {
      didEmitInitial.current = true;
      return;
    }
    onClassSectionsChange(mapToPrevileges(classSections));
  }, [classSections, onClassSectionsChange]);

  // Resolve classes and sections: prefer the authorized branch data, fall back to
  // the sub-account's own branch (from the login payload) when the full list isn't
  // accessible (e.g. school_sub_account 401s on /schools/branch/all).
  const branchData =
    getSchoolBranch && Object.keys(getSchoolBranch).length > 0
      ? getSchoolBranch
      : subAccountBranch;

  console.log(branchData, "branchData");

  const allClasses = Array.isArray(branchData?.class)
    ? branchData.class
    : branchData?.class
      ? [branchData.class]
      : [];
  // Guard against empty/missing branch data so allClasses[0] is never undefined.
  const refinedresult = (allClasses[0] || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  console.log(refinedresult, "refinedresult");
  console.log(allClasses, "allClasses");

  const allSections = Array.isArray(branchData?.section)
    ? branchData.section
    : branchData?.section
      ? [branchData.section]
      : [];
  const refinedresultSection = (allSections[0] || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const activeSections = classSections[activeClass] || [];

  const setSectionsForActive = (tags) =>
    setClassSections((prev) => ({ ...prev, [activeClass]: tags }));

  const addQuickSection = (letter) => {
    if (activeSections.includes(letter)) return;
    setSectionsForActive([...activeSections, letter]);
  };

  const toggleApplyTarget = (cls) => {
    console.log("toggling class:", cls, "current:", applyTargets);
    setApplyTargets((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls],
    );
  };

  const applyToOthers = () => {
    setClassSections((prev) => {
      const next = { ...prev };
      applyTargets.forEach((cls) => {
        next[cls] = [...activeSections];
      });
      return next;
    });
    setApplyTargets([]);
    setShowApply(false);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Class &amp; Section Setup
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure sections independently for each class - names don't have to
          follow A/B/C, e.g. Class 11 can use A, B, C1, C2.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-[200px_1fr]">
        {/* Left: class list */}
        <div className="space-y-1 sm:border-r sm:border-border sm:pr-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Classes
          </p>
          {refinedresult.map((cls) => {
            const count = (classSections[cls] || []).length;
            const isActive = cls === activeClass;

            return (
              <button
                key={cls}
                type="button"
                onClick={() => {
                  setActiveClass(cls);
                  setShowApply(false);
                }}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-foreground hover:bg-muted"
                } ${
                  count > 1
                    ? "border border-primary/30 text-primary"
                    : "border border-transparent"
                }`}
              >
                Class {cls}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] ${
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: section editor for the active class */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Sections for Class {activeClass}
              </p>
              <p className="text-xs text-muted-foreground">
                Type a name and press Enter (or comma) to add a section.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowApply((prev) => !prev)}
              className="text-xs font-medium text-primary hover:underline"
            >
              Apply to other classes
            </button>
          </div>

          <div className="mt-3">
            <TagInput tags={activeSections} onChange={setSectionsForActive} />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Quick add:</span>
            {refinedresultSection
              .filter((letter) => !activeSections.includes(letter))
              .map((letter) => (
                <button
                  key={letter}
                  type="button"
                  onClick={() => addQuickSection(letter)}
                  className="rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  + {letter}
                </button>
              ))}
          </div>

          {showApply ? (
            <div className="mt-4 rounded-lg border border-border bg-background p-3">
              <p className="mb-2 text-xs font-medium text-foreground">
                Copy{" "}
                {activeSections.length
                  ? activeSections.join(", ")
                  : "these sections"}{" "}
                to:
              </p>
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                {refinedresult
                  .filter((cls) => cls !== activeClass)
                  .map((cls) => {
                    const count = (classSections[cls] || []).length;

                    return (
                      <label
                        key={cls}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-foreground ${
                          count > 0
                            ? "border border-primary/40 bg-primary/5"
                            : "border border-transparent"
                        }`}
                      >
                        <Checkbox
                          checked={applyTargets.includes(cls)}
                          onCheckedChange={() => toggleApplyTarget(cls)}
                        />
                        Class {cls}
                        {count > 0 && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            {count}
                          </span>
                        )}
                      </label>
                    );
                  })}
              </div>
              <button
                type="button"
                onClick={applyToOthers}
                disabled={applyTargets.length === 0}
                className="mt-3 h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Apply to {applyTargets.length || ""} class
                {applyTargets.length === 1 ? "" : "es"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
