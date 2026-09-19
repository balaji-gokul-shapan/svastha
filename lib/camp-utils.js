/**
 * Camp (assigned event) field normalisation shared by the camp dropdown, the
 * selected-camp resolver and the roster queries.
 *
 * Assigned events can arrive as snake_case or PascalCase, so every id / name /
 * school lookup goes through these helpers instead of reading fields inline.
 * Camp ids are always returned as trimmed strings so dropdown values, query
 * keys and API params all use the same representation.
 */

export const getCampId = (camp) => String(camp?.id ?? camp?.Id ?? "").trim();

export const getCampName = (camp) =>
  String(camp?.name ?? camp?.Name ?? camp?.camp_name ?? "").trim();

export const getCampSchoolName = (camp) =>
  String(
    camp?.school?.school_name ??
      camp?.school?.name ??
      camp?.school_name ??
      camp?.schoolName ??
      "",
  ).trim();

/**
 * True when a camp belongs to the school currently applied by the school
 * filter. Camps without a school only match the "all" filter.
 */
export const campMatchesSchool = (camp, schoolName) => {
  const campSchool = getCampSchoolName(camp);
  const filter = String(schoolName ?? "").trim();

  if (!campSchool) {
    return filter === "all";
  }

  return campSchool === filter;
};
