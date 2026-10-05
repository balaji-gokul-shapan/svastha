"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppDispatch } from "@/lib/hooks";
import { getAllScreeningTypes } from "@/lib/features/getAllScreeningTypes";
import { registerScreeningIdMap } from "@/lib/camp-utils";

export default function useScreeningIdMap() {
  const dispatch = useAppDispatch();

  const { data } = useQuery({
    queryKey: ["screening-type-id-map"],
    queryFn: () => dispatch(getAllScreeningTypes()).unwrap(),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    if (Array.isArray(data)) {
      registerScreeningIdMap(data);
    }
  }, [data]);

  return data;
}