"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";
import * as React from "react";

import { createCoreRowModel, flexRender, useTable } from "@tanstack/react-table";

import { Pagination } from "@/components/ui/pagination";
import ReusableSelect from "@/components/ui/reusable-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn } from "@/lib/utils";

/**
 * Sort comparator: numbers numerically, everything else case-insensitive and
 * numeric-aware; empty values always sink to the bottom regardless of order.
 */
function compareValues(a, b) {
  const aEmpty = a === null || a === undefined || a === "";
  const bEmpty = b === null || b === undefined || b === "";

  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return 1;
  if (bEmpty) return -1;

  const aNumber = Number(a);
  const bNumber = Number(b);
  if (!Number.isNaN(aNumber) && !Number.isNaN(bNumber)) {
    return aNumber - bNumber;
  }

  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

/**
 * Resolves a column header to plain text so it can be mirrored onto each body
 * cell as `data-label`. Only string headers can be mirrored; a header rendered
 * as a function (e.g. the select-all checkbox) yields an empty label and the
 * stylesheet simply omits the caption for that cell.
 */
function getHeaderLabel(columnDef) {
  const { header } = columnDef ?? {};

  if (typeof header === "string" || typeof header === "number") {
    return String(header);
  }

  return "";
}


// Opt-in animated body row (React 19 passes `ref` through props, so the
// plain TableRow spreads it onto <tr> without a forwardRef wrapper).
const MotionTableRow = motion.create(TableRow);

export function DataTable({
  columns,
  data = [],
  emptyMessage = "No results.",
  emptyState,
  onRowClick,
  enablePagination = false,
  enableSorting = false,
  initialPageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],

  serverPagination,
  // Controlled local pagination (report table): when provided, page state
  // lives in the PARENT so switching table -> detailed -> table keeps your
  // page (e.g. 32) instead of resetting to 1 on remount.
  pageIndex: controlledPageIndex,
  onPageIndexChange,
  pageSize: controlledPageSize,
  onPageSizeChange: onControlledPageSizeChange,
  // Opt-in staggered row fade-in (students table). Off by default so every
  // existing table keeps its exact current markup/behaviour.
  animateRows = false,
  isLoading = false,
  className,
  // Applied to the inner <table>. Use it to force a `min-w-*` so narrow
  // screens scroll the table horizontally instead of squeezing every column.
  tableClassName,
  // Opt-in presentation hooks. All default to undefined so existing callers
  // keep their current markup exactly.
  rootClassName,
  shellClassName,
  headClassName,
  rowClassName,
  footClassName,
  // When true, each body cell receives `data-label` from its column header so
  // a stylesheet can render the label when the table collapses into cards.
  withCellLabels = false,
  columnWidths,
  selectHeader = null,
  selectCell = null,
  selectWidth = "3.5rem",
}) {
  // `sort` is { id, desc } or null (unsorted). Page state is clamped on read so
  // a shrinking dataset can never render an out-of-range blank page.
  const [sort, setSort] = React.useState(null);
  const [innerPageIndex, setInnerPageIndex] = React.useState(0);
  const [innerPageSize, setInnerPageSize] = React.useState(initialPageSize);
  const isControlledPage = typeof controlledPageIndex === "number";
  const pageIndex = isControlledPage ? controlledPageIndex : innerPageIndex;
  const setPageIndex = React.useCallback(
    (next) => {
      const value = typeof next === "function" ? next(pageIndex) : next;
      if (!isControlledPage) setInnerPageIndex(value);
      onPageIndexChange?.(value);
    },
    [isControlledPage, onPageIndexChange, pageIndex],
  );

  const isControlledPageSize = typeof controlledPageSize === "number";
  const pageSize = isControlledPageSize ? controlledPageSize : innerPageSize;
  const setPageSize = React.useCallback(
    (next) => {
      if (!isControlledPageSize) setInnerPageSize(next);
      onControlledPageSizeChange?.(next);
    },
    [isControlledPageSize, onControlledPageSizeChange],
  );

  const table = useTable({
    data,
    columns,
    features: {
      coreRowModel: createCoreRowModel(),
    },
  });

  const rows = table.getRowModel().rows;

  const getSortValue = React.useCallback(
    (rowOriginal, columnId) => {
      const column = columns.find(
        (column) => (column.id ?? column.accessorKey) === columnId,
      );
      if (!column) return "";

      if (typeof column.accessorFn === "function") {
        return column.accessorFn(rowOriginal, 0);
      }

      return column.accessorKey ? rowOriginal?.[column.accessorKey] : "";
    },
    [columns],
  );

  const sortedRows = React.useMemo(() => {
    if (!sort) return rows;

    const sorted = [...rows].sort((a, b) =>
      compareValues(
        getSortValue(a.original, sort.id),
        getSortValue(b.original, sort.id),
      ),
    );

    return sort.desc ? sorted.reverse() : sorted;
  }, [rows, sort, getSortValue]);

  const isServerPaginated = Boolean(serverPagination);
  const serverPage = Math.max(1, Number(serverPagination?.page) || 1);
  const serverTotalPages = Math.max(
    1,
    Number(serverPagination?.totalPages) || 1,
  );
  const serverTotalRows = Math.max(0, Number(serverPagination?.totalRows) || 0);
  const serverPageSize =
    Number(serverPagination?.pageSize) > 0
      ? Number(serverPagination.pageSize)
      : initialPageSize;
  const isBusy = isLoading || Boolean(serverPagination?.isLoading);

  const localTotalRows = sortedRows.length;
  const localTotalPages = Math.max(1, Math.ceil(localTotalRows / pageSize));
  const safePageIndex = Math.min(Math.max(0, pageIndex), localTotalPages - 1);
  const pageRows = isServerPaginated
    ? sortedRows
    : enablePagination
      ? sortedRows.slice(
          safePageIndex * pageSize,
          safePageIndex * pageSize + pageSize,
        )
      : sortedRows;

  const totalRows = isServerPaginated ? serverTotalRows : localTotalRows;
  const totalPages = isServerPaginated ? serverTotalPages : localTotalPages;
  const activePage = isServerPaginated ? serverPage : safePageIndex + 1;
  const activePageSize = isServerPaginated ? serverPageSize : pageSize;

  const firstRow =
    totalRows === 0
      ? 0
      : (activePage - 1) * activePageSize + 1;
  const lastRow = isServerPaginated
    ? Math.min(totalRows, (serverPage - 1) * serverPageSize + sortedRows.length)
    : Math.min(totalRows, (safePageIndex + 1) * pageSize);
  const showFooter = isServerPaginated || (enablePagination && totalRows > 0);

  const toggleSort = (columnId) => {
    setSort((prev) => {
      if (prev?.id !== columnId) return { id: columnId, desc: false };
      if (!prev.desc) return { id: columnId, desc: true };
      return null;
    });
  };

  return (
    <div className={cn("space-y-4", className, rootClassName)}>
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-border bg-card",
          shellClassName,
        )}
      >
        <Table className={tableClassName}>
          {columnWidths?.length || selectHeader ? (
            <colgroup>
              {selectHeader ? <col style={{ width: selectWidth }} /> : null}
              {columnWidths?.map((width, index) => (
                <col
                  key={index}
                  style={width ? { width } : undefined}
                />
              ))}
            </colgroup>
          ) : null}
          <TableHeader className={headClassName}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {selectHeader ? (
                  <TableHead
                    key="select"
                    className="sl-select"
                    data-no-row-click="true"
                  >
                    {selectHeader}
                  </TableHead>
                ) : null}
                {headerGroup.headers.map((header) => {
                  const columnDef = header.column.columnDef;
                  const columnId = header.column.id;
                  const canSort =
                    enableSorting &&
                    Boolean(columnDef.accessorFn || columnDef.accessorKey);
                  const SortIcon =
                    sort?.id === columnId
                      ? sort.desc
                        ? ArrowDown
                        : ArrowUp
                      : ArrowUpDown;

                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : canSort
                          ? (
                            <button
                              type="button"
                              onClick={() => toggleSort(columnId)}
                              className="flex items-center gap-1.5 transition-colors hover:text-foreground"
                            >
                              {flexRender(
                                columnDef.header,
                                header.getContext(),
                              )}
                              <SortIcon className="size-3.5" />
                            </button>
                          )
                          : flexRender(
                              columnDef.header,
                              header.getContext(),
                            )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {pageRows.length ? (
              pageRows.map((row, rowIndex) => {
                const Row = animateRows ? MotionTableRow : TableRow;

                return (
                <Row
                  key={row.id}
                  // Staggered fade-in: capped delay so page 50 doesn't take
                  // seconds to finish animating.
                  {...(animateRows
                    ? {
                        initial: { opacity: 0, y: 6 },
                        animate: { opacity: 1, y: 0 },
                        transition: {
                          duration: 0.28,
                          delay: Math.min(rowIndex * 0.035, 0.5),
                          ease: "easeOut",
                        },
                      }
                    : {})}
                  className={cn(
                    onRowClick ? "cursor-pointer" : undefined,
                    rowClassName,
                  )}
                  onClick={(event) => {
                    if (!onRowClick) {
                      return;
                    }

                    // Don't trigger row navigation when clicking interactive controls.
                    const interactiveTarget = event.target.closest(
                      "a, button, input, textarea, select, [role='button'], [data-no-row-click='true']"
                    );
                    if (interactiveTarget) {
                      return;
                    }

                    onRowClick(row.original);
                  }}
                  onKeyDown={(event) => {
                    if (!onRowClick) {
                      return;
                    }

                    if (event.key !== "Enter" && event.key !== " ") {
                      return;
                    }

                    event.preventDefault();
                    onRowClick(row.original);
                  }}
                  tabIndex={onRowClick ? 0 : undefined}
                >
                  {selectCell ? (
                    <TableCell
                      key={`${row.id}-select`}
                      className="sl-select"
                      data-no-row-click="true"
                    >
                      {selectCell(row)}
                    </TableCell>
                  ) : null}
                  {row.getAllCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="data-cell !p-2"
                      {...(withCellLabels
                        ? { "data-label": getHeaderLabel(cell.column.columnDef) }
                        : {})}
                    >
                      {cell.column.columnDef.cell
                        ? flexRender(cell.column.columnDef.cell, cell.getContext())
                        : String(cell.getValue() ?? "")}
                    </TableCell>
                  ))}
                </Row>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectHeader ? 1 : 0)}
                  className=" text-center"
                >
                  {emptyState ?? emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {showFooter ? (
          <div
            className={cn(
              "flex flex-col gap-2 border-t border-border px-3 py-2 sm:flex-row sm:items-center sm:justify-between",
              footClassName,
            )}
          >
            <p className="text-sm text-muted-foreground">
              Showing {firstRow}–{lastRow} of {totalRows}
              {isBusy ? " · loading…" : ""}
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
              <span className="text-xs text-muted-foreground">Rows per page</span>
              <ReusableSelect
                // label="Rows per page"
                value={String(activePageSize)}
                options={pageSizeOptions.map((size) => ({
                  label: String(size),
                  value: String(size),
                }))}
                onChange={(value) => {
                  const nextPageSize = Number(value) || initialPageSize;

                  // Server mode: the caller refetches with the new per_page.
                  if (isServerPaginated) {
                    serverPagination?.onPageSizeChange?.(nextPageSize);
                    return;
                  }

                  setPageSize(nextPageSize);
                  setPageIndex(0);
                }}
                className="w-24"
                withPortal
                disabled={isBusy}
              />

              <Pagination
                page={activePage}
                totalPages={totalPages}
                onChange={(page) => {
                  // Server mode: ask the caller to fetch this page.
                  if (isServerPaginated) {
                    serverPagination?.onPageChange?.(page);
                    return;
                  }

                  setPageIndex(page - 1);
                }}
                disabled={isBusy}
                showSummary={false}
                className="px-0 py-0"
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}