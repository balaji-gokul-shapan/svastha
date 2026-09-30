"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppDispatch } from "@/lib/hooks";
import { getAssignEvent } from "@/lib/features/getEventAssignSlice";
import useAuthUser from "@/lib/useAuthUser";
import { campMatchesSchool, buildCampSummary } from "@/lib/camp-utils";


const useAssignedEvents = () => {
  const dispatch = useAppDispatch();
  const { authUser } = useAuthUser();
  const userId = authUser?.id ?? authUser?.Id;

  const { data, isLoading, error } = useQuery({
    queryKey: ["get-event", userId ?? null],
    queryFn: () => dispatch(getAssignEvent({ id: userId })).unwrap(),
    enabled: Boolean(userId),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  return {
    assignedEvents: data ?? null,
    assignEventLoading: isLoading,
    assignEventError: error,
  };
};

/**
 * Returns the RAW assigned event (camp) object that matches `schoolName`, or
 * null. Callers normalise it with `buildCampSummary` — that split matters: the
 * previous `findSelectedCamp` returned an already-flattened object, which made
 * it tempting to spread it under a differently-chosen camp and mix the two.
 */
export function findSelectedCampEvent(assignedEvents, schoolName) {
  if (schoolName === "all") {
    return null;
  }

  const campList = Array.isArray(assignedEvents) ? assignedEvents : [];
  // campMatchesSchool also normalises the case of the school field, so camps
  // that only expose `school_name` / `Name` / `Id` still resolve.
  return campList.find((event) => campMatchesSchool(event, schoolName)) ?? null;
}

/**
 * Shared camp-matching logic used by StudentFilter, AssessmentCard and the
 * report hooks: resolves which assigned event (camp) is active for a given
 * school filter.
 *
 * Returns the normalised summary — id is null, name is "all" and schoolName is
 * "all" when no specific camp is selected. Every field is derived from the SAME
 * matched event (see buildCampSummary).
 */
export function findSelectedCamp(assignedEvents, schoolName) {
  return buildCampSummary(findSelectedCampEvent(assignedEvents, schoolName), {
    schoolName,
  });
}

export default useAssignedEvents;
