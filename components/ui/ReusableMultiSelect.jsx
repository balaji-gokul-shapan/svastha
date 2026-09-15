"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  ChevronDown,
  Loader2,
  Plus,
  X,
  Pencil,
  Trash2,
  Save,
} from "lucide-react";

import { cn } from "../../lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

function normalizeOption(option) {
  if (typeof option === "string") {
    return { label: option, value: option };
  }
  return {
    label: String(option?.label ?? option?.value ?? ""),
    value: String(option?.value ?? option?.label ?? ""),
  };
}

function Chip({ label, onRemove, disabled }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex max-w-[140px] items-center gap-1 rounded-full bg-primary/10 py-0.5 pl-2 pr-1 text-xs font-medium text-primary">
          <span className="truncate">{label}</span>
          {!disabled ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              aria-label={`Remove ${label}`}
              className="rounded-full p-0.5 text-primary/70 hover:bg-primary/20 hover:text-primary"
            >
              <X className="size-3" />
            </button>
          ) : null}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

export default function ReusableMultiSelect({
  label,
  value = [],
  onChange,
  options = [],
  placeholder = "Select options",
  searchPlaceholder = "Search...",
  className = "",
  disabled = false,
  onLoadMore = null,
  hasMore = false,
  isLoadingMore = false,
  onSearchChange = null,
  serverSearch = false,
  searchDebounceMs = 300,
  isSearching = false,
  maxVisibleChips = null,
  allowCreate = true,
  allowEdit = true,
  allowDelete = true,
  onCreate = null,
  onEdit = null,   // optional callback fired after a rename: (option) => void
  onDelete = null, // optional callback fired after a deletion: (option) => void
  withPortal = false,
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropDirection, setDropDirection] = useState("down");
  const [portalEl, setPortalEl] = useState(null);
  const [triggerRect, setTriggerRect] = useState(null);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const dropdownContainerRef = useRef(null);
  const searchDebounceRef = useRef(null);
  const editInputRef = useRef(null);

  // Options created inline by the user
  const [createdOptions, setCreatedOptions] = useState([]);

  // localOverrides: { [optionValue]: newLabel }  → rename
  //                 { [optionValue]: null }       → deleted
  const [localOverrides, setLocalOverrides] = useState({});

  // Inline-edit state
  const [editingValue, setEditingValue] = useState(null);
  const [editDraft, setEditDraft] = useState("");

  // Inline-delete confirm state
  const [deletingValue, setDeletingValue] = useState(null);

  // ─── derived data ──────────────────────────────────────────────────────────
  const selectedValues = useMemo(
    () => new Set(value.map((v) => String(v))),
    [value],
  );

  const normalizedOptions = useMemo(() => {
    const base = [
      ...options.map(normalizeOption),
      ...createdOptions,
    ].filter((opt) => opt.value.length > 0);

    return base
      .filter((opt) => localOverrides[opt.value] !== null) // null = deleted
      .map((opt) =>
        localOverrides[opt.value] !== undefined
          ? { ...opt, label: localOverrides[opt.value] }
          : opt,
      );
  }, [options, createdOptions, localOverrides]);

  const selectedOptions = useMemo(
    () => normalizedOptions.filter((opt) => selectedValues.has(opt.value)),
    [normalizedOptions, selectedValues],
  );

  const filteredOptions = useMemo(() => {
    if (serverSearch) return normalizedOptions;
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return normalizedOptions;
    return normalizedOptions.filter((opt) =>
      opt.label.toLowerCase().includes(keyword),
    );
  }, [normalizedOptions, searchTerm, serverSearch]);

  // ─── search debounce ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!onSearchChange) return;
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(
      () => onSearchChange(searchTerm.trim()),
      searchDebounceMs,
    );
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchTerm, onSearchChange, searchDebounceMs]);

  // ─── toggle selection ──────────────────────────────────────────────────────
  const toggleValue = useCallback(
    (optionValue) => {
      const next = new Set(selectedValues);
      if (next.has(optionValue)) {
        next.delete(optionValue);
      } else {
        next.add(optionValue);
      }
      onChange?.(Array.from(next));
    },
    [selectedValues, onChange],
  );

  // ─── edit handlers ─────────────────────────────────────────────────────────
  const startEdit = useCallback((e, option) => {
    e.stopPropagation();
    setDeletingValue(null);
    setEditingValue(option.value);
    setEditDraft(option.label);
    requestAnimationFrame(() => editInputRef.current?.focus());
  }, []);

  const commitEdit = useCallback(
    (e) => {
      e?.stopPropagation?.();
      const newLabel = editDraft.trim();
      if (!newLabel || !editingValue) {
        setEditingValue(null);
        return;
      }
      setLocalOverrides((prev) => ({ ...prev, [editingValue]: newLabel }));
      const updated = normalizedOptions.find((o) => o.value === editingValue);
      if (updated) onEdit?.({ ...updated, label: newLabel });
      setEditingValue(null);
      setEditDraft("");
    },
    [editDraft, editingValue, normalizedOptions, onEdit],
  );

  const cancelEdit = useCallback((e) => {
    e?.stopPropagation?.();
    setEditingValue(null);
    setEditDraft("");
  }, []);

  // ─── delete handlers ───────────────────────────────────────────────────────
  const startDelete = useCallback((e, option) => {
    e.stopPropagation();
    setEditingValue(null);
    setDeletingValue(option.value);
  }, []);

  const confirmDelete = useCallback(
    (e) => {
      e?.stopPropagation?.();
      if (!deletingValue) return;

      // Remove from selected values if it was selected
      if (selectedValues.has(deletingValue)) {
        onChange?.(value.filter((v) => String(v) !== deletingValue));
      }

      // Notify parent
      const deleted = normalizedOptions.find((o) => o.value === deletingValue);
      if (deleted) onDelete?.(deleted);

      // Mark as deleted locally
      setLocalOverrides((prev) => ({ ...prev, [deletingValue]: null }));
      setDeletingValue(null);
    },
    [deletingValue, selectedValues, value, onChange, normalizedOptions, onDelete],
  );

  const cancelDelete = useCallback((e) => {
    e?.stopPropagation?.();
    setDeletingValue(null);
  }, []);

  // ─── chip removal / clear ──────────────────────────────────────────────────
  const removeValue = useCallback(
    (optionValue) => {
      onChange?.(value.filter((v) => String(v) !== optionValue));
    },
    [value, onChange],
  );

  const clearAll = useCallback(
    (e) => {
      e.stopPropagation();
      onChange?.([]);
    },
    [onChange],
  );

  // ─── infinite scroll ───────────────────────────────────────────────────────
  const handleScroll = useCallback(
    (e) => {
      if (!onLoadMore || !hasMore || isLoadingMore) return;
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      if (scrollHeight - scrollTop - clientHeight < 100) onLoadMore();
    },
    [onLoadMore, hasMore, isLoadingMore],
  );

  useEffect(() => {
    if (!open || !dropdownRef.current) return;
    const el = dropdownRef.current;
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [open, handleScroll]);

  // ─── dropdown position & outside-click ────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const estimatedHeight = Math.min(
      320,
      Math.max(220, filteredOptions.length * 34 + 90),
    );
    const shouldOpenUp =
      window.innerHeight - rect.bottom < estimatedHeight + 24 &&
      rect.top > estimatedHeight;
    setDropDirection(shouldOpenUp ? "up" : "down");

    const onPointerDown = (e) => {
      const clickedInsideTrigger =
        containerRef.current && containerRef.current.contains(e.target);
      const clickedInsideDropdown =
        dropdownContainerRef.current &&
        dropdownContainerRef.current.contains(e.target);
      if (!clickedInsideTrigger && !clickedInsideDropdown) {
        setOpen(false);
        setSearchTerm("");
        setEditingValue(null);
        setDeletingValue(null);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, filteredOptions.length]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  // ─── portal element (lazy, appended to body) ─────────────────────────────
  useLayoutEffect(() => {
    if (!withPortal) return;
    const el = document.createElement("div");
    el.id = "rms-portal";
    el.style.position = "fixed";
    el.style.zIndex = "9999";
    el.style.top = "0";
    el.style.left = "0";
    el.style.width = "0";
    el.style.height = "0";
    document.body.appendChild(el);
    setPortalEl(el);
    return () => {
      document.body.removeChild(el);
      setPortalEl(null);
    };
  }, [withPortal]);

  // ─── track trigger rect for portal positioning ───────────────────────────
  useLayoutEffect(() => {
    if (!open || !withPortal || !containerRef.current) return;
    const update = () => setTriggerRect(containerRef.current.getBoundingClientRect());
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, withPortal]);

  // ─── select all ───────────────────────────────────────────────────────────
  const selectAllVisible = useCallback(() => {
    const selected = new Set(value.map((v) => String(v)));
    for (const opt of filteredOptions) selected.add(opt.value);
    onChange?.(Array.from(selected));
  }, [value, filteredOptions, onChange]);

  // ─── create new option ────────────────────────────────────────────────────
  const addNewOption = useCallback(
    (rawLabel) => {
      const nextValue = rawLabel.trim();
      if (!nextValue) return;
      const lc = nextValue.toLowerCase();
      const alreadyExists = normalizedOptions.some(
        (o) => o.label.trim().toLowerCase() === lc,
      );
      if (alreadyExists) return;

      const newOption = { label: nextValue, value: nextValue };
      setCreatedOptions((prev) => [...prev, newOption]);

      const next = new Set(value.map((v) => String(v)));
      next.add(nextValue);
      onChange?.(Array.from(next));
      setSearchTerm("");
    },
    [value, onChange, normalizedOptions],
  );

  // ─── chips ────────────────────────────────────────────────────────────────
  const visibleChips =
    maxVisibleChips != null
      ? selectedOptions.slice(0, maxVisibleChips)
      : selectedOptions;
  const overflowCount =
    maxVisibleChips != null
      ? Math.max(0, selectedOptions.length - maxVisibleChips)
      : 0;

  // ─── render ───────────────────────────────────────────────────────────────
  return (
    <TooltipProvider>
      <div
        ref={containerRef}
        className={cn(
          "relative overflow-visible",
          className,
          disabled && "opacity-60",
        )}
      >
        {/* Header: count + select-all / clear-all */}
        <div className="mb-1 flex items-center justify-between gap-2 pb-1">
          <label className="text-xs font-medium text-muted-foreground">
            {options.length} options
          </label>
          <div className="flex items-center gap-2">
            {selectedOptions.length < options.length && !disabled ? (
              <button
                type="button"
                onClick={selectAllVisible}
                disabled={disabled || filteredOptions.length === 0}
                className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
              >
                Select all
              </button>
            ) : null}
            {selectedOptions.length > 0 && !disabled ? (
              <button
                type="button"
                onClick={clearAll}
                className="text-[11px] font-medium text-primary hover:underline"
              >
                Clear all ({selectedOptions.length})
              </button>
            ) : null}
          </div>
        </div>

        {/* Trigger */}
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          onClick={() => !disabled && setOpen((p) => !p)}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen((p) => !p);
            }
          }}
          className={cn(
            "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 text-sm",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
          )}
        >
          {selectedOptions.length === 0 ? (
            <span className="px-1 text-muted-foreground">{placeholder}</span>
          ) : (
            <>
              {visibleChips.map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  disabled={disabled}
                  onRemove={() => removeValue(opt.value)}
                />
              ))}
              {overflowCount > 0 ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  +{overflowCount} more
                </span>
              ) : null}
            </>
          )}
          <ChevronDown className="ml-auto size-4 shrink-0 text-muted-foreground" />
        </div>

        {/* Dropdown */}
        {open
          ? (() => {
              const dropdownBody = (
                <>
                  {/* Search input */}
                  <div className="relative mb-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          setOpen(false);
                          setSearchTerm("");
                        }
                      }}
                      placeholder={searchPlaceholder}
                      className="h-9 w-full rounded-md border border-input bg-background px-2 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                    {isSearching ? (
                      <Loader2 className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                    ) : null}
                  </div>

                  {/* Options list */}
                  <div ref={dropdownRef} className="max-h-60 space-y-0.5 overflow-y-auto">
              {filteredOptions.length ? (
                filteredOptions.map((option) => {
                        const isSelected = selectedValues.has(option.value);
                        const isEditing = editingValue === option.value;
                        const isDeleting = deletingValue === option.value;

                        return (
                          <div key={option.value} className="w-full">

                            {isEditing ? (
                        /* ── Edit row ───────────────────────────────── */
                                <div
                                  className="flex items-center gap-1 rounded-sm bg-accent px-1.5 py-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    ref={editInputRef}
                                    type="text"
                                    value={editDraft}
                                    onChange={(e) => setEditDraft(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") commitEdit(e);
                                      if (e.key === "Escape") cancelEdit(e);
                                    }}
                                    className="h-7 min-w-0 flex-1 rounded border border-primary bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring/30"
                                  />
                                  <button
                                    type="button"
                                    onClick={commitEdit}
                                    className="rounded p-1 text-primary hover:bg-primary/10"
                                    aria-label="Save"
                                  >
                                    <Save className="size-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="rounded p-1 text-muted-foreground hover:bg-background"
                                    aria-label="Cancel"
                                  >
                                    <X className="size-3.5" />
                                  </button>
                                </div>
                              ) : isDeleting ? (
                                /* ── Delete confirm row ─────────────────────── */
                                <div
                                  className="flex items-center gap-2 rounded-sm border border-destructive/30 bg-destructive/5 px-2 py-1.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <span className="min-w-0 flex-1 truncate text-xs text-destructive">
                                    Delete &ldquo;{option.label}&rdquo;?
                                  </span>
                                  <button
                                    type="button"
                                    onClick={confirmDelete}
                                    className="shrink-0 rounded px-2 py-0.5 text-xs font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelDelete}
                                    className="shrink-0 rounded px-2 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                /* ── Normal option row ──────────────────────── */
                                <div className="group flex w-full items-center rounded-sm hover:bg-accent">
                                  <button
                                    type="button"
                                    onClick={() => toggleValue(option.value)}
                                    aria-pressed={isSelected}
                                    className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-left text-sm"
                                  >
                                    <span
                                      className={cn(
                                        "flex size-4 shrink-0 items-center justify-center rounded border",
                                        isSelected
                                          ? "border-primary bg-primary text-primary-foreground"
                                          : "border-input",
                                      )}
                                    >
                                      {isSelected ? <Check className="size-3" /> : null}
                                    </span>
                                    <span className="truncate">{option.label}</span>
                                  </button>

                                  {(allowEdit || allowDelete) && (
                                    <div className="mr-1 flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                                      {allowEdit && (
                                        <button
                                          type="button"
                                          onClick={(e) => startEdit(e, option)}
                                          className="rounded p-1.5 text-muted-foreground hover:bg-background hover:text-primary"
                                          aria-label={`Edit ${option.label}`}
                                        >
                                          <Pencil className="size-3.5" />
                                        </button>
                                      )}
                                      {allowDelete && (
                                        <button
                                          type="button"
                                          onClick={(e) => startDelete(e, option)}
                                          className="rounded p-1.5 text-muted-foreground hover:bg-background hover:text-destructive"
                                          aria-label={`Delete ${option.label}`}
                                        >
                                          <Trash2 className="size-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : isSearching ? (
                        <div className="flex items-center justify-center gap-2 px-2 py-3 text-sm text-muted-foreground">
                          <Loader2 className="size-4 animate-spin" />
                          <span>Searching...</span>
                        </div>
                      ) : (
                        <p className="px-2 py-1.5 text-sm text-muted-foreground">
                          No results found
                        </p>
                      )}

                      {/* Create new option */}
                      {allowCreate &&
                        searchTerm.trim() &&
                        !filteredOptions.some(
                          (o) =>
                            o.label.trim().toLowerCase() ===
                            searchTerm.trim().toLowerCase(),
                        ) && (
                          <button
                            type="button"
                            onClick={() => addNewOption(searchTerm)}
                            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-primary hover:bg-accent hover:text-accent-foreground"
                          >
                            <span className="flex size-4 shrink-0 items-center justify-center rounded border border-primary text-primary">
                              <Plus className="size-3" />
                            </span>
                            <span className="truncate">
                              Add &ldquo;{searchTerm.trim()}&rdquo;
                            </span>
                          </button>
                        )}

                      {/* Loading more */}
                      {isLoadingMore ? (
                        <div className="flex items-center justify-center gap-2 px-2 py-3 text-sm text-muted-foreground">
                          <Loader2 className="size-4 animate-spin" />
                          <span>Loading more...</span>
                        </div>
                      ) : hasMore && filteredOptions.length > 0 ? (
                        <p className="px-2 py-2 text-center text-xs text-muted-foreground">
                          Scroll for more
                        </p>
                      ) : null}
                    </div>
                  </>
              );

              return withPortal
                ? portalEl && triggerRect
                  ? createPortal(
                      <div
                        ref={dropdownContainerRef}
                        style={{
                          position: "absolute",
                          left: triggerRect.left,
                          width: triggerRect.width,
                          top:
                            dropDirection === "up"
                              ? triggerRect.top -
                                Math.min(
                                  320,
                                  Math.max(
                                    220,
                                    filteredOptions.length * 34 + 90,
                                  ),
                                ) -
                                4
                              : triggerRect.bottom,
                        }}
                        className="z-[9999] rounded-md border border-border bg-popover p-2 text-popover-foreground shadow-md"
                      >
                        {dropdownBody}
                      </div>,
                      portalEl,
                    )
                  : null
                : (
                  <div
                    ref={dropdownContainerRef}
                    className={cn(
                      "absolute left-0 right-0 z-[70] rounded-md border border-border bg-popover p-2 text-popover-foreground shadow-md",
                      dropDirection === "up"
                        ? "bottom-full mb-0.5"
                        : "top-full mt-0",
                    )}
                  >
                    {dropdownBody}
                  </div>
                );
            })()
          : null}
      </div>
    </TooltipProvider>
  );
}
