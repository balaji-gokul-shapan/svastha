"use client";

import React from "react";
import ReusableSelect from "@/components/ui/reusable-select";


const SchoolFilter = ({
  branches = [],
  value = "all",
  onChange,
  selectedBranch = null,
  loading = false,
  error = null,
}) => {
  const list = Array.isArray(branches)
    ? branches
    : Array.isArray(branches?.data)
      ? branches.data
      : [];

  // A branch can be named by school + class/branch — fall back through the
  // common label fields so the option is never blank.
  const getLabel = (item) =>
    String(
      item?.name ??
        item?.branch_name ??
        item?.school_name ??
        item?.label ??
        "",
    ).trim();

  const options = [
    { value: "all", label: "All schools" },
    ...list
      .map((item) => ({
        value: String(item?.id ?? item?.branch_id ?? getLabel(item)),
        label: getLabel(item),
      }))
      .filter((option) => option.value && option.label),
  ];

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Unable to load schools. Please try again.
      </p>
    );
  }

  return (
    <div className="w-full sm:max-w-full">
      <ReusableSelect
        label="School"
        options={options}
        value={value}
        onChange={(next) => onChange?.(next)}
        placeholder="Select a school"
        searchPlaceholder="Search school..."
        disabled={loading}
      />

      {/* Details for the chosen branch - handy when the label alone is vague. */}
      {selectedBranch ? (
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          {[
            selectedBranch.school_name,
            selectedBranch.branch_name,
            selectedBranch.code,
            selectedBranch.id,
          ]
            .filter(Boolean)
            .map((part) => String(part).trim())
            .join(" · ")}
        </p>
      ) : null}
    </div>
  );
};

export default SchoolFilter;