"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Builds the list of page buttons to render, collapsing long ranges
 * into ellipsis markers.
 *
 * Example (page 5 of 12):  [1, "…", 4, 5, 6, "…", 12]
 */
function getPageItems(currentPage, totalPages, maxButtons = 5) {
  if (totalPages <= maxButtons + 2) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items = [];
  const start = Math.max(
    1,
    Math.min(currentPage - Math.floor(maxButtons / 2), totalPages - maxButtons + 1),
  );
  const end = Math.min(totalPages, start + maxButtons - 1);

  if (start > 1) {
    items.push(1);
    if (start > 2) {
      items.push("ellipsis-start");
    }
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (end < totalPages) {
    if (end < totalPages - 1) {
      items.push("ellipsis-end");
    }
    items.push(totalPages);
  }

  return items;
}

export function Pagination({
  page,
  totalPages,
  onChange,
  disabled = false,
  showSummary = true,
  className,
}) {
  const safeTotalPages = Math.max(1, Number(totalPages) || 1);
  const safePage = Math.min(Math.max(1, Number(page) || 1), safeTotalPages);
  const pageItems = React.useMemo(
    () => getPageItems(safePage, safeTotalPages),
    [safePage, safeTotalPages],
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {showSummary ? (
        <p className="text-sm text-muted-foreground">
          Page {safePage} of {safeTotalPages}
        </p>
      ) : (
        <span />
      )}

      <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange(Math.max(1, safePage - 1))}
          disabled={disabled || safePage <= 1}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>

        {pageItems.map((item, index) =>
          typeof item === "number" ? (
            <Button
              key={item}
              type="button"
              variant={item === safePage ? "default" : "outline"}
              size="sm"
              onClick={() => onChange(item)}
              disabled={disabled || item === safePage}
              aria-current={item === safePage ? "page" : undefined}
              className={cn("min-w-9 px-2.5")}
            >
              {item}
            </Button>
          ) : (
            <span
              key={`${item}-${index}`}
              className="px-1.5 text-sm text-muted-foreground"
            >
              …
            </span>
          ),
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange(Math.min(safeTotalPages, safePage + 1))}
          disabled={disabled || safePage >= safeTotalPages}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}