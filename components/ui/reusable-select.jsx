"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";

import { cn } from "../../lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

// Tooltips only render for labels with at least this many characters —
// single-character values ("7", "A") don't need a hover popup.
const MIN_TOOLTIP_LENGTH = 2;

function normalizeOption(option) {
  if (typeof option === "string") {
    return { label: option, value: option };
  }

  return {
    label: String(option?.label ?? option?.value ?? ""),
    value: String(option?.value ?? option?.label ?? ""),
  };
}

export default function ReusableSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  className = "",
  disabled = false,
  onLoadMore = null,
  hasMore = false,
  isLoadingMore = false,
  onSearch = null,
}) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropDirection, setDropDirection] = useState("down");
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchTimerRef = useRef(null);

  // Debounced server search: when the parent supplies onSearch, forward the
  // keyword so it can query the backend and swap the options list. Falls back
  // to local filtering when onSearch is not provided.
  useEffect(() => {
    if (!onSearch) return;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    const keyword = searchTerm.trim();
    searchTimerRef.current = setTimeout(() => {
      setIsSearching(true);
      Promise.resolve(onSearch(keyword)).finally(() => setIsSearching(false));
    }, 300);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchTerm, onSearch]);

  const normalizedOptions = useMemo(
    () => options.map(normalizeOption).filter((opt) => opt.value.length > 0),
    [options],
  );

  const filteredOptions = useMemo(() => {
    // When a server search is active, the parent is responsible for returning
    // the matching options — skip local filtering so we don't hide them.
    if (onSearch) return normalizedOptions;
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) {
      return normalizedOptions;
    }

    return normalizedOptions.filter((opt) =>
      opt.label.toLowerCase().includes(keyword),
    );
  }, [normalizedOptions, searchTerm, onSearch]);

  const selectedOption = normalizedOptions.find(
    (opt) => opt.value === String(value ?? ""),
  );

  // Infinite scroll handler
  const handleScroll = useCallback(
    (event) => {
      if (!onLoadMore || !hasMore || isLoadingMore) return;

      const { scrollTop, scrollHeight, clientHeight } = event.target;
      // Trigger load more when within 100px of the bottom
      const threshold = 100;
      if (scrollHeight - scrollTop - clientHeight < threshold) {
        onLoadMore();
      }
    },
    [onLoadMore, hasMore, isLoadingMore],
  );

  // Attach scroll listener to dropdown
  useEffect(() => {
    if (!open || !dropdownRef.current) return;

    const dropdown = dropdownRef.current;
    dropdown.addEventListener("scroll", handleScroll);

    return () => {
      dropdown.removeEventListener("scroll", handleScroll);
    };
  }, [open, handleScroll]);

  // Auto-load more when the dropdown opens but the list is too short to scroll
  // (e.g. class/section filters reduced the visible set). Keeps fetching pages
  // until the dropdown is scrollable or there are no more pages.
  useEffect(() => {
    if (!open || !hasMore || isLoadingMore || !onLoadMore) return;
    if (!dropdownRef.current) return;

    const dropdown = dropdownRef.current;
    const isScrollable = dropdown.scrollHeight > dropdown.clientHeight;
    if (!isScrollable && filteredOptions.length > 0) {
      const timer = setTimeout(() => {
        if (hasMore && !isLoadingMore) {
          onLoadMore();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open, hasMore, isLoadingMore, onLoadMore, filteredOptions.length]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const estimatedDropdownHeight = Math.min(
      320,
      Math.max(220, filteredOptions.length * 34 + 90),
    );
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const shouldOpenUp =
      spaceBelow < estimatedDropdownHeight + 24 &&
      spaceAbove > estimatedDropdownHeight;
    setDropDirection(shouldOpenUp ? "up" : "down");

    const onPointerDown = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open, filteredOptions.length]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [open]);

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
        {label ? (
          <label className="mb-1.5 block text-xs text-muted-foreground">
            {label}
          </label>
        ) : null}

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setOpen((prev) => {
                  if (prev) {
                    setSearchTerm("");
                  }
                  return !prev;
                });
              }}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed"
            >
              <span
                className={cn(
                  "truncate",
                  !selectedOption && "text-muted-foreground",
                )}
              >
                {selectedOption?.label || placeholder}
              </span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </button>
          </TooltipTrigger>
          {selectedOption && selectedOption.label.trim().length >= MIN_TOOLTIP_LENGTH ? (
            <TooltipContent side="top">{selectedOption.label}</TooltipContent>
          ) : null}
        </Tooltip>

        {open ? (
          <div
            className={cn(
              "absolute left-0 right-0 z-[70] rounded-md border border-border bg-popover p-2 text-popover-foreground shadow-md",
              dropDirection === "up" ? "bottom-full mb-0.5" : "top-full mt-0",
            )}
          >
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setOpen(false);
                  setSearchTerm("");
                }
              }}
              placeholder={searchPlaceholder}
              className="mb-2 h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            />

            <div
              ref={dropdownRef}
              className="max-h-60 space-y-1 overflow-y-auto"
            >
              {isSearching ? (
                <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  Searching…
                </div>
              ) : filteredOptions.length ? (
                filteredOptions.map((option) => {
                  const isSelected = option.value === String(value ?? "");
                  return (
                    <Tooltip key={option.value}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => {
                            onChange?.(option.value);
                            setOpen(false);
                            setSearchTerm("");
                          }}
                          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                        >
                          <span className="inline-flex w-4 items-center justify-center">
                            {isSelected ? <Check className="size-3.5" /> : null}
                          </span>
                          <span className="truncate">{option.label}</span>
                        </button>
                      </TooltipTrigger>
                      {option.label.trim().length >= MIN_TOOLTIP_LENGTH ? (
                        <TooltipContent side="right">
                          {option.label}
                        </TooltipContent>
                      ) : null}
                    </Tooltip>
                  );
                })
              ) : (
                <p className="px-2 py-1.5 text-sm text-muted-foreground">
                  No results found
                </p>
              )}

              {/* Loading indicator for infinite scroll */}
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
          </div>
        ) : null}
      </div>
    </TooltipProvider>
  );
}
