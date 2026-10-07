"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAppDispatch } from "./hooks";
import { getPincodeDetails } from "./features/getPincode.slice";

/* ==========================================================================
   usePincodeOptions
   Looks up a pincode once 6 digits are present and returns DE-DUPED option
   lists per field, plus the best single guess for autofill.

   Shared by the school registration form (Contact & Address + Branch steps)
   and Settings → School Details (branch wizard, Address & Contact step) so
   both get the identical lookup/autofill behaviour.
   ========================================================================== */

const toOptions = (values) => values.map((value) => ({ value, label: value }));

export function usePincodeOptions(pincode) {
  const dispatch = useAppDispatch();
  const normalized = String(pincode ?? "").trim();
  const isReady = normalized.length === 6;

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["pincode-details", normalized],

    queryFn: () => dispatch(getPincodeDetails(normalized)).unwrap(),
    enabled: isReady,
    retry: false,
    // Postal data changes rarely — avoid refetching on every step change.
    staleTime: 1000 * 60 * 30,
  });

  /* options[key] -> [{ value, label }], distinct, source order preserved. */
  const options = useMemo(() => {
    const list = data?.options ?? [];

    const collect = (key) => {
      const seen = new Set();
      const out = [];

      list.forEach((entry) => {
        const value = String(entry?.[key] ?? "").trim();
        if (!value) return;

        const dedupeKey = value.toLowerCase();
        if (seen.has(dedupeKey)) return;

        seen.add(dedupeKey);
        out.push(value);
      });

      return out;
    };

    return {
      city: toOptions(collect("city")),
      state: toOptions(collect("state")),
      district: toOptions(collect("district")),
      area: toOptions(collect("taluk")),
    };
  }, [data]);

  /* Best-guess values, for autofilling fields the user hasn't typed into. */
  const autofill = useMemo(() => {
    if (!data) return null;

    return {
      city: String(data.city ?? "").trim(),
      state: String(data.state ?? "").trim(),
      district: String(data.district ?? "").trim(),
      area: String(data.taluk ?? "").trim(),
      country: String(data.country ?? "").trim() || "India",
    };
  }, [data]);

  const errorMessage =
    (error && typeof error === "string" ? error : null) ??
    error?.message ??
    null;

  const isBusy = isReady && (isLoading || isFetching) && !errorMessage;

  return {
    isReady,
    isBusy,
    error: errorMessage,
    options,
    autofill,
    /** Placeholder text that tells the user why the select is empty. */
    emptyPlaceholder: isReady ? "Select" : "Enter a 6-digit pincode first",
  };
}
