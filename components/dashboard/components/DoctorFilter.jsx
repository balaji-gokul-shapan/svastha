"use client";

import React from "react";
import ReusableSelect from "@/components/ui/reusable-select";
import {
  getCampDisplayLabel,
  getCampDoctorIds,
  getCampId,
  getCampPrimaryDoctorId,
} from "@/lib/camp-utils";
import { normalizeEvents } from "@/lib/dashboard-stats";

const DoctorFilter = ({
  events = [],
  doctors,
  value = "all",
  onChange,
  loading = false,
  error = null,
}) => {
  const options = React.useMemo(() => {
    const seen = new Set();
    const campOptions = normalizeEvents(events)
      .map((event) => ({
        value: getCampId(event),
        label: getCampDisplayLabel(event) || `Camp ${getCampId(event)}`,
      }))
      .filter((camp) => {
        if (!camp.value || seen.has(camp.value)) return false;
        seen.add(camp.value);
        return true;
      });

    return [{ value: "all", label: "All camps" }, ...campOptions];
  }, [events]);

  const handleChange = (campId) => {
    const event = normalizeEvents(events).find(
      (item) => getCampId(item) === String(campId),
    );
    const doctorId =
      getCampPrimaryDoctorId(event) || getCampDoctorIds(event)[0] || "all";

    onChange?.(String(campId), String(doctorId));
  };

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Unable to load doctors. Please try again.
      </p>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 gap-4">
      <ReusableSelect
        label="Camp"
        options={options}
        value={String(value ?? "all")}
        onChange={handleChange}
        placeholder="Select a camp"
        searchPlaceholder="Search camp..."
        disabled={loading}
        className="w-full sm:w-3/4 md:w-2/3 lg:w-96"
      />
    </div>
  );
};

export default DoctorFilter;
