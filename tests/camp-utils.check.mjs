

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../lib/camp-utils.js", import.meta.url),
  "utf8",
);

const mod = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
);

const {
  getCampDate,
  getCampDisplayLabel,
  getCampDoctorIds,
  getCampId,
  getCampPrimaryDoctorId,
  formatCampDate,
  getCampSchoolId,
  getCampBranchId,
  getCampBranchName,
  getCampStatus,
  isCampActive,
  buildCampSummary,
  EMPTY_CAMP_SUMMARY,
} = mod;

// ---- buildCampSummary: the fallback-mixing fix -------------------------
// Two camps at the SAME school, with genuinely different location /
// registration. The old `{ ...fallback, ...picked }` produced a mixed object.
const campA = {
  id: 14, name: "svasta dev",
  camp_date: "2026-09-15T00:00:00.000000Z",
  status: false, doctor_ids: [88, 100],
  primary_doctor_id: 88, primary_doctor: 1,
  screening_ids: [1, 4, 3],
  school_id: 1, branch_id: 2,
  school: { id: 1, school_name: "Oakridge Public School",
            registration_number: "CBSE-TN-2026-02841", area: "Adyar", city: "Chennai" },
  branch: { id: 2, branch_name: "Oakridge Public School - Madipakkam" },
};
const campB = {
  id: 15, name: "Balaji's Camp",
  camp_date: "2026-09-23T00:00:00.000000Z",
  status: true, doctor_ids: [88],
  primary_doctor_id: 88, primary_doctor: 1,
  screening_ids: [1, 2, 3, 4, 5],
  school_id: 1, branch_id: 2,
  school: { id: 1, school_name: "Oakridge Public School",
            registration_number: "REG-B-DIFFERENT", area: "Velachery", city: "Chennai" },
  branch: { id: 2, branch_name: "Oakridge Public School - Madipakkam" },
};

const sumA = buildCampSummary(campA);
const sumB = buildCampSummary(campB);

// Every field of sumB must come from campB, never campA.
assert.equal(sumB.id, "15");
assert.equal(sumB.name, "Balaji's Camp");
assert.equal(sumB.date, "2026-09-23T00:00:00.000000Z");
assert.equal(sumB.status, true);
assert.deepEqual(sumB.doctorIds, ["88"]);
assert.deepEqual(sumB.screeningIds, ["1", "2", "3", "4", "5"]);
assert.equal(sumB.registrationNumber, "REG-B-DIFFERENT", "must not leak campA's reg no");
assert.equal(sumB.location, "Velachery, Chennai", "must not leak campA's location");
assert.equal(sumB.branchId, "2");
assert.equal(sumB.schoolId, "1");
assert.equal(sumB.primaryDoctorId, "88");
assert.equal(sumB.primaryDoctor, true);

assert.equal(sumA.registrationNumber, "CBSE-TN-2026-02841");
assert.equal(sumA.location, "Adyar, Chennai");
assert.equal(sumA.status, false);
assert.deepEqual(sumA.doctorIds, ["88", "100"]);

// A missing camp yields the neutral shape with a null id.
const none = buildCampSummary(null);
assert.equal(none.id, null, "id null means nothing selected");
assert.equal(none.name, "all");
assert.deepEqual(none.doctorIds, []);
assert.deepEqual(none.screeningIds, []);
assert.equal(none.location, null);

console.log("buildCampSummary: ALL PASS");

// ---- new helpers, against the REAL /assigned payload -------------------
// Camp 15 (status true) and camp 14 (status false) from the live API.
const camp15 = {
  id: 15,
  name: "Balaji's Camp",
  school_id: 1,
  branch_id: 2,
  camp_date: "2026-09-23T00:00:00.000000Z",
  screening_ids: [1, 2, 3, 4, 5],
  status: true,
  doctor_ids: [88],
  primary_doctor_id: 88,
  primary_doctor: 1,
  school: { id: 1, school_name: "Oakridge Public School" },
  branch: { id: 2, branch_name: "Oakridge Public School - Madipakkam" },
};

const camp14 = {
  ...camp15,
  id: 14,
  name: "svasta dev",
  status: false,
  doctor_ids: [88, 100],
  screening_ids: [1, 4, 3],
};

// ids
assert.equal(getCampSchoolId(camp15), "1");
assert.equal(getCampBranchId(camp15), "2");
assert.equal(getCampBranchId(camp14), "2", "same branch as camp 15");
assert.equal(
  getCampBranchName(camp15),
  "Oakridge Public School - Madipakkam",
);
// nested-only shapes
assert.equal(getCampSchoolId({ school: { id: 7 } }), "7");
assert.equal(getCampBranchId({ branch: { id: 9 } }), "9");
assert.equal(getCampSchoolId(null), "");
assert.equal(getCampBranchId(undefined), "");

// status coercion across shapes
assert.equal(getCampStatus(camp15), true);
assert.equal(getCampStatus(camp14), false);
assert.equal(getCampStatus({ status: 1 }), true);
assert.equal(getCampStatus({ status: 0 }), false);
assert.equal(getCampStatus({ status: "true" }), true);
assert.equal(getCampStatus({ status: "0" }), false);
assert.equal(getCampStatus({}), null, "absent -> null, not false");
assert.equal(getCampStatus(null), null);

// isCampActive: only an explicit false hides a camp
assert.equal(isCampActive(camp15), true);
assert.equal(isCampActive(camp14), false);
assert.equal(isCampActive({}), true, "missing status must not hide a camp");
assert.equal(isCampActive(null), true);

// primary_doctor FLAG is distinct from primary_doctor_id
assert.equal(getCampPrimaryDoctorId(camp15), "88");
assert.deepEqual(getCampDoctorIds(camp15), ["88"]);
assert.deepEqual(getCampDoctorIds(camp14), ["88", "100"]);
assert.equal(getCampStatus({ status: camp14.primary_doctor }), true);

// both camps share a school but are different events
assert.notEqual(getCampId(camp14), getCampId(camp15));
assert.equal(camp14.school.school_name, camp15.school.school_name);

console.log("camp-utils new helpers: ALL PASS");

// The real /api/v1/medical-event/assigned record (camp id 14).
const apiCamp = {
  id: 14,
  name: "svasta dev",
  camp_date: "2026-09-15T00:00:00.000000Z",
  created_at: "2026-09-15T11:43:17.000000Z",
  doctor_ids: [88, 100],
  primary_doctor: 0,
  primary_doctor_id: 88,
};

// ---- getCampDate ----------------------------------------------------------
assert.equal(getCampDate(apiCamp), "2026-09-15T00:00:00.000000Z");
assert.equal(getCampDate({ campDate: "2026-01-02" }), "2026-01-02");
assert.equal(getCampDate({ date: "2026-01-03" }), "2026-01-03");
assert.equal(getCampDate({ name: "no date" }), "");
assert.equal(getCampDate(null), "");
assert.equal(getCampDate(undefined), "");

// ---- formatCampDate -------------------------------------------------------
assert.equal(formatCampDate(null), null);
assert.equal(formatCampDate(""), null);
assert.equal(formatCampDate("not-a-date"), "not-a-date", "unparseable -> raw");
const formatted = formatCampDate(apiCamp.camp_date);
assert.match(formatted, /^15 Sep 2026$|^15 Sept? 2026$/, `got: ${formatted}`);

// ---- getCampDisplayLabel --------------------------------------------------
assert.equal(
  getCampDisplayLabel(apiCamp),
  `svasta dev — ${formatted}`,
  "name + date",
);
assert.equal(getCampDisplayLabel({ id: 1, name: "No date camp" }), "No date camp");
// A camp with a date but no name renders just the date (no dangling " — ").
assert.equal(
  getCampDisplayLabel({ id: 2, camp_date: "2026-09-15" }),
  formatCampDate("2026-09-15"),
);
assert.equal(getCampDisplayLabel(null), "");

// Two camps sharing a name must now be distinguishable.
const a = getCampDisplayLabel({ id: 14, name: "svasta dev", camp_date: "2026-09-15" });
const b = getCampDisplayLabel({ id: 15, name: "svasta dev", camp_date: "2026-10-20" });
assert.notEqual(a, b, "same name, different dates must differ");

// ---- doctors --------------------------------------------------------------
// `primary_doctor` is a FLAG on this backend (0 while primary_doctor_id is 88).
assert.equal(getCampPrimaryDoctorId(apiCamp), "88");
assert.deepEqual(getCampDoctorIds(apiCamp), ["88", "100"]);
assert.equal(
  getCampPrimaryDoctorId({ doctor_ids: [7], primary_doctor: 0 }),
  null,
  "flag 0 must not be read as a doctor id",
);
assert.equal(
  getCampPrimaryDoctorId({ primary_doctor: { id: 5 } }),
  "5",
  "inlined doctor object",
);
assert.equal(getCampPrimaryDoctorId({ primary_doctor: 9 }), "9", "plain id");
assert.equal(getCampPrimaryDoctorId(null), null);
assert.deepEqual(getCampDoctorIds({ doctor_ids: [{ id: 3 }, { doctor_id: 4 }] }), ["3", "4"]);
assert.deepEqual(getCampDoctorIds({ doctors: 6 }), ["6"]);
assert.deepEqual(getCampDoctorIds({}), []);

console.log("camp-utils checks passed");