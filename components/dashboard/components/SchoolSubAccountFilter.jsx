"use client";

import React from "react";
import ReusableSelect from "@/components/ui/reusable-select";

const ALL = "all";

const toOptions = (rawValue, allLabel) => {
  const values = (Array.isArray(rawValue) ? rawValue : String(rawValue ?? "").split(","))
    .map((item) => String(item).trim())
    .filter(Boolean);

  return [
    { value: ALL, label: allLabel },
    ...Array.from(new Set(values)).map((item) => ({
      value: item,
      label: item,
    })),
  ];
};

const getField = (selectedBranch, field) => {
  const details =
    selectedBranch?.school ??
    selectedBranch?.branch_data ??
    selectedBranch?.branch ??
    selectedBranch ??
    {};

  return selectedBranch?.[field] ?? details?.[field] ?? "";
};

const SchoolSubAccountFilter = ({
  branches = [],
  value = "all",
  onChange,
  selectedBranch = null,
  loading = false,
  error = null,
}) => {
  const [selectedSection, setSelectedSection] = React.useState(ALL);
  const [selectedClass, setSelectedClass] = React.useState(ALL);

  const list = React.useMemo(
    () =>
      Array.isArray(branches)
        ? branches
        : Array.isArray(branches?.data)
          ? branches.data
          : [],
    [branches],
  );

  const branchOptions = React.useMemo(() => {
    const getLabel = (item) =>
      String(
        item?.name ??
          item?.branch_name ??
          item?.school_name ??
          item?.label ??
          "",
      ).trim();

    return [
      { value: ALL, label: "All branches" },
      ...list
        .map((item) => ({
          value: String(item?.id ?? item?.branch_id ?? getLabel(item)),
          label: getLabel(item),
        }))
        .filter((option) => option.value && option.label),
    ];
  }, [list]);

  const sectionOptions = React.useMemo(
    () => toOptions(getField(selectedBranch, "section"), "All sections"),
    [selectedBranch],
  );

  const classOptions = React.useMemo(
    () => toOptions(getField(selectedBranch, "class"), "All classes"),
    [selectedBranch],
  );

  const selectedBranchId = String(
    value ?? selectedBranch?.id ?? selectedBranch?.branch_id ?? ALL,
  );

  const handleBranchChange = (nextBranchId) => {
    setSelectedSection(ALL);
    setSelectedClass(ALL);
    onChange?.(nextBranchId);
  };

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Unable to load school sub-account filters. Please try again.
      </p>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
      {/* <ReusableSelect
        label="School branch"
        options={branchOptions}
        value={selectedBranchId}
        onChange={handleBranchChange}
        placeholder="Select a school branch"
        searchPlaceholder="Search school branch..."
        disabled={loading}
        className="w-full"
      /> */}

      <ReusableSelect
        label="Class"
        options={classOptions}
        value={selectedClass}
        onChange={setSelectedClass}
        placeholder="Select a class"
        searchPlaceholder="Search class..."
        disabled={!selectedBranch}
        className="w-full"
      />

      <ReusableSelect
        label="Section"
        options={sectionOptions}
        value={selectedSection}
        onChange={setSelectedSection}
        placeholder="Select a section"
        searchPlaceholder="Search section..."
        disabled={!selectedBranch}
        className="w-full"
      />
    </div>
  );
};

export default SchoolSubAccountFilter;
