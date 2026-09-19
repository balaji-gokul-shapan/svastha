"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppDispatch } from "@/lib/hooks";
import { getAssignEvent } from "@/lib/features/getEventAssignSlice";
import useAuthUser from "@/lib/useAuthUser";
import {
  campMatchesSchool,
  getCampId,
  getCampName,
  getCampSchoolName,
} from "@/lib/camp-utils";


const useAssignedEvents = () => {
  const dispatch = useAppDispatch();
  const { authUser } = useAuthUser();
  const userId = authUser?.id ?? authUser?.Id;

  const { data, isLoading, error } = useQuery({
    // Key includes the user id so the query refetches when the session
    // hydrates (authUser resolves asynchronously) or the user changes.
    queryKey: ["get-event", userId ?? null],
    queryFn: () => dispatch(getAssignEvent({ id: userId })).unwrap(),
    // Never fire before the auth user is available — otherwise the
    // request would run with an undefined id and die in the error state.
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
 * Shared camp-matching logic used by StudentFilter, AssessmentCard and the
 * report hooks: resolves which assigned event (camp) is active for a given
 * school filter.
 *
 * Returns { id, name, schoolName, date, location, registrationNumber } — id is
 * null, name is "all" and schoolName is "all" when no specific camp is
 * selected. `id` is a trimmed string (camp ids double as dropdown values), and
 * `date`, `location` and `registrationNumber` are pulled from the matched event
 * (and its school) so detail cards can render them.
 */
export function findSelectedCamp(assignedEvents, schoolName) {
  if (schoolName === "all") {
    return { id: null, name: "all", schoolName: "all" };
  }

  const campList = Array.isArray(assignedEvents) ? assignedEvents : [];
  // campMatchesSchool also normalises the case of the school field, so camps
  // that only expose `school_name` / `Name` / `Id` still resolve.
  const matchedEvent = campList.find((event) =>
    campMatchesSchool(event, schoolName),
  );

  return {
    id: getCampId(matchedEvent) || null,
    name: getCampName(matchedEvent) || "all",
    schoolName: getCampSchoolName(matchedEvent) || schoolName,
    date: matchedEvent?.date ?? matchedEvent?.camp_date ?? null,
    location: [
      matchedEvent?.school?.area ?? matchedEvent?.area,
      matchedEvent?.school?.city ?? matchedEvent?.city,
    ]
      .filter(Boolean)
      .join(", ") || null,
    registrationNumber:
      matchedEvent?.school?.registration_number ??
      matchedEvent?.registration_number ??
      null,
  };
}

export default useAssignedEvents;
