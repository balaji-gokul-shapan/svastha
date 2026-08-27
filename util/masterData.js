/**
 * Get one or multiple master-data records.
 *
 * Single:
 *
 * getMasterData(data, "allergies")
 *
 * Returns:
 *
 * [
 *   {...},
 *   {...}
 * ]
 *
 *
 * Multiple:
 *
 * getMasterData(data, [
 *   "allergies",
 *   "blood-groups"
 * ])
 *
 * Returns:
 *
 * {
 *   allergies: [...],
 *   "blood-groups": [...]
 * }
 */
export const getMasterData = (data, keys) => {
  if (!data || typeof data !== "object") {
    return Array.isArray(keys) ? {} : [];
  }

  // ---------------------------------------------------------
  // Single key
  // ---------------------------------------------------------

  if (typeof keys === "string") {
    return data[keys] ?? [];
  }

  // ---------------------------------------------------------
  // Multiple keys
  // ---------------------------------------------------------

  if (Array.isArray(keys)) {
    return keys.reduce((result, key) => {
      result[key] = data[key] ?? [];

      return result;
    }, {});
  }

  return {};
};
