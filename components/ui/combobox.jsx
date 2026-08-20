"use client";

import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { Check, ChevronDown, X } from "lucide-react";

import { cn } from "@/lib/utils";

function normalizeItems(items) {
  return items.map((item) => {
    if (typeof item === "string") {
      return { value: item, label: item };
    }

    return item;
  });
}

function Combobox({
  id,
  name,
  items,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select an option",
  emptyMessage = "No results found.",
}) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const normalizedItems = normalizeItems(items);

  const selectedValue =
    value === undefined
      ? undefined
      : normalizedItems.find((item) => item.value === value) ?? null;

  const selectedDefault =
    defaultValue === undefined
      ? undefined
      : normalizedItems.find((item) => item.value === defaultValue) ?? null;

  return (
    <ComboboxPrimitive.Root
      items={normalizedItems}
      name={name}
      value={selectedValue}
      defaultValue={selectedDefault}
      onValueChange={(next) => onValueChange?.(next?.value ?? "")}
    >
      <ComboboxPrimitive.InputGroup className="relative flex h-10 w-full items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
        <ComboboxPrimitive.Input
          id={inputId}
          placeholder={placeholder}
          className="h-full w-full border-0 bg-transparent px-3 pr-14 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />

        <div className="absolute right-0 flex h-full items-center text-muted-foreground">
          <ComboboxPrimitive.Clear
            className="combobox-clear inline-flex h-full w-7 items-center justify-center"
            aria-label="Clear selection"
          >
            <X className="size-3.5" />
          </ComboboxPrimitive.Clear>
          <ComboboxPrimitive.Trigger
            className="inline-flex h-full w-7 items-center justify-center"
            aria-label="Open options"
          >
            <ChevronDown className="size-4" />
          </ComboboxPrimitive.Trigger>
        </div>
      </ComboboxPrimitive.InputGroup>

      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner sideOffset={6} className="z-50 outline-none">
          <ComboboxPrimitive.Popup className="w-[var(--anchor-width)] max-h-[min(18rem,var(--available-height))] max-w-[var(--available-width)] origin-[var(--transform-origin)] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md transition-[opacity,transform] data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95">
            <ComboboxPrimitive.Empty className="px-3 py-2 text-sm text-muted-foreground">
              {emptyMessage}
            </ComboboxPrimitive.Empty>

            <ComboboxPrimitive.List className="max-h-[min(18rem,var(--available-height))] overflow-y-auto p-1 outline-none data-empty:p-0">
              {(item) => (
                <ComboboxPrimitive.Item
                  key={item.value}
                  value={item}
                  className={cn(
                    "grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none",
                    "data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                  )}
                >
                  <ComboboxPrimitive.ItemIndicator>
                    <Check className="size-3.5" />
                  </ComboboxPrimitive.ItemIndicator>
                  <span>{item.label}</span>
                </ComboboxPrimitive.Item>
              )}
            </ComboboxPrimitive.List>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  );
}

export { Combobox };
