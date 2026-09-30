"use client";

import { isValidElement, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useAppDispatch } from "@/lib/hooks";
import {
  getScreeningIds,
  getScreeningKey,
  isScreeningKeyAssigned,
} from "@/lib/camp-utils";

import {
  Activity,
  BadgeCent,
  Cake,
  Calendar,
  CalendarCheck,
  Check,
  CheckCircle2,
  Copy,
  Droplet,
  Ear,
  Eye,
  IdCard,
  IdCardLanyard,
  Mars,
  School,
  Syringe,
  Transgender,
  Venus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useScreeningRecord } from "@/components/students/getScreeningRecord";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import ToothIcon from "@/app/health-checks/dental-screening/asset/toothIcon";
import { useAppSelector } from "@/lib/hooks";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import WeightIcon from "@iconify-react/healthicons/weight";
import HeightIcon from "@iconify-react/healthicons/height";
import EarNoseThroatOutlineIcon from "@iconify-react/healthicons/ear-nose-throat-outline";
import { cn } from "@/lib/utils";
import { useScreeningRecordByFilter } from "@/components/students/getScreeningRecordByFilter";
import { getDoctorSignature } from "@/lib/features/doctorSignatureSlice";
import { selectAuthUser } from "@/lib/features/auth-slice";
import {
  getSignatureValue,
  normalizeSignatureUrl,
} from "@/lib/signature-utils";
import { useDispatch } from "react-redux";

/* -------------------------------------------------------------------------- */
/* Sub-components                                                              */
/* -------------------------------------------------------------------------- */

function CopyableInfo({
  label,
  value,
  valueClass = "text-foreground",
  hasCopy = true,
  icon,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = String(value ?? "").trim();
    if (!text || text === "--") {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label} copied`, { description: text });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error(`Could not copy ${label}`);
    }
  };

  const IconNode = isValidElement(icon) ? icon : null;
  const LabelIcon = IconNode ? null : icon;

  return (
    <div className="flex w-fit items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2">
      <div>
        <h6 className="flex items-center gap-1 text-[11px] text-muted-foreground">
          {LabelIcon ? <LabelIcon className="size-4" /> : null}
          {IconNode ? <span className="inline-flex">{IconNode}</span> : null}
          {label}
        </h6>
        <p className={`text-sm font-bold ${valueClass}`}>{value}</p>
      </div>
      {hasCopy ? (
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy ${label}`}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
          data-pdf-hide
        >
          {copied ? (
            <Check className="size-3.5 text-success" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>
      ) : null}
    </div>
  );
}

/* Card tones per health domain — colors come from the global domain tokens
   (--domain-*, --domain-*-soft/border/foreground in globals.css), so the
   report cards always match the app theme (dental = oral amber, vision = sky
   blue, ...). Pass `tone="oral"` etc.; `status` still drives the Badge. */
const DOMAIN_TONE = {
  physical: {
    toneClass:
      "border-domain-physical-border bg-gradient-to-br from-domain-physical/25 via-domain-physical-soft to-domain-physical/[0.03] text-domain-physical-foreground",
    iconClass:
      "bg-gradient-to-br from-domain-physical to-domain-physical/60 text-white shadow-sm",
  },
  vision: {
    toneClass:
      "border-domain-vision-border bg-gradient-to-br from-domain-vision/25 via-domain-vision-soft to-domain-vision/[0.03] text-domain-vision-foreground",
    iconClass:
      "bg-gradient-to-br from-domain-vision to-domain-vision/60 text-white shadow-sm",
  },
  hearing: {
    toneClass:
      "border-domain-hearing-border bg-gradient-to-br from-domain-hearing/25 via-domain-hearing-soft to-domain-hearing/[0.03] text-domain-hearing-foreground",
    iconClass:
      "bg-gradient-to-br from-domain-hearing to-domain-hearing/60 text-white shadow-sm",
  },
  oral: {
    toneClass:
      "border-domain-oral-border bg-gradient-to-br from-domain-oral/25 via-domain-oral-soft to-domain-oral/[0.03] text-domain-oral-foreground",
    iconClass:
      "bg-gradient-to-br from-domain-oral to-domain-oral/60 text-white shadow-sm",
  },
  dental: {
    toneClass:
      "border-domain-oral-border bg-gradient-to-br from-domain-oral/25 via-domain-oral-soft to-domain-oral/[0.03] text-domain-oral-foreground",
    iconClass:
      "bg-gradient-to-br from-domain-oral to-domain-oral/60 text-white shadow-sm",
  },
  immunization: {
    toneClass:
      "border-domain-immunization-border bg-gradient-to-br from-domain-immunization/25 via-domain-immunization-soft to-domain-immunization/[0.03] text-domain-immunization-foreground",
    iconClass:
      "bg-gradient-to-br from-domain-immunization to-domain-immunization/60 text-white shadow-sm",
  },
  ent: {
    toneClass:
      "border-domain-ent-border bg-gradient-to-br from-domain-ent/25 via-domain-ent-soft to-domain-ent/[0.03] text-domain-ent-foreground",
    iconClass:
      "bg-gradient-to-br from-domain-ent to-domain-ent/60 text-white shadow-sm",
  },
};

/* Status only decides the Badge variant — card background stays domain-owned. */
const STATUS_TONE = {
  good: { variant: "good" },
  normal: { variant: "normal" },
  warning: { variant: "warning" },
  bad: { variant: "bad" },
  severe: { variant: "severe" },
  critical: { variant: "severe" },
  uptodate: { variant: "good" },
  abnormal: { variant: "bad" },
  poor: { variant: "bad" },
  needfollowup: { variant: "warning" },
};

function normalizeKey(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function resolveTone(status) {
  return STATUS_TONE[normalizeKey(status)] ?? null;
}

function resolveDomain(toneOrTitle) {
  const key = normalizeKey(toneOrTitle);
  if (DOMAIN_TONE[key]) return DOMAIN_TONE[key];
  // Fallback so titles like "Physical Health" / "Oral Health" still match
  // their domain when no explicit `tone` prop is passed.
  const found = Object.keys(DOMAIN_TONE).find((k) => key.includes(k));
  return found ? DOMAIN_TONE[found] : null;
}

// Acronyms that humanizeKey would otherwise mangle ("bmi" -> "Bmi").
const DETAIL_LABEL_OVERRIDES = {
  bmi: "BMI",
  bp: "BP",
  spo2: "SpO₂",
  id: "ID",
};

function humanizeKey(key) {
  const raw = String(key ?? "").trim();

  const override = DETAIL_LABEL_OVERRIDES[raw.toLowerCase()];
  if (override) return override;

  const spaced = raw
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim();

  if (!spaced) return "";

  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

// Placeholders the report uses for "nothing recorded" — never worth printing.
const EMPTY_DETAIL_VALUES = new Set([
  "",
  "--",
  "-",
  "NA",
  "N/A",
  "null",
  "undefined",
]);
const REMARK_SEPARATOR = " · ";

function buildRemark(pairs, hasRecord) {
  const text = pairs
    .filter(([, value]) => value && value !== "--")
    .map(([label, value]) => (label ? `${label}: ${value}` : value))
    .join(REMARK_SEPARATOR);

  return (
    text || (hasRecord ? "No vitals recorded" : "No screening record available")
  );
}

function StatusCard({
  icon: Icon,
  title,
  status,
  tone,
  toneClass,
  iconClass,
  iconProps,
  iconSize = "size-4",
  record,
}) {
  const badgeTone = resolveTone(status);
  console.log(badgeTone, "badgeTone");

  const domainTone = resolveDomain(tone ?? title);
  const resolvedTone = toneClass ?? domainTone?.toneClass ?? "";
  const resolvedIconBg = iconClass ?? domainTone?.iconClass ?? "";
  const resolvedVariant = badgeTone?.variant ?? "outline";

  console.log(record, "ssssrecord");

  // `record` is a flat { height, weight, bmi, … } summary. Render only the
  // entries that carry a real value instead of dumping raw JSON.
  const details = Object.entries(record ?? {})
    .map(([key, value]) => [humanizeKey(key), String(value ?? "").trim()])
    .filter(
      ([label, value]) => label && value && !EMPTY_DETAIL_VALUES.has(value),
    );

  console.log(details, "details");

  return (
    <div className={`status-card border ${resolvedTone}`}>
      <div className="status-card__head">
        <div className={`status-card__icon ${resolvedIconBg}`}>
          <Icon
            {...iconProps}
            /* iconSize is a dedicated prop rather than something callers smuggle
               through iconProps.className: twMerge resolves `size-4`/`size-5` by
               class order, so the caller's size has to win deterministically. */
            className={cn(iconSize, iconProps?.className)}
          />
        </div>
        <p className="status-card__title">{title}</p>
      </div>

      {/* Badge sits on its own full-width line: sharing the icon's row is what
          forced "Need Follow up" to wrap three deep. */}
      <div className="status-card__status">
        <Badge
          variant={resolvedVariant}
          className="text-xs leading-tight opacity-95"
        >
          {status}
        </Badge>
      </div>

      {details.length ? (
        <>
          <div className="status-card__rule" aria-hidden="true" />
          <dl className="status-card__list">
            {details.map(([label, value]) => (
              <div key={label} className="status-card__row">
                <dt className="status-card__label">{label}</dt>
                <dd className="status-card__value">{value}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : null}
    </div>
  );
}

function ReportRow({
  area,
  finding,
  remark,
  pdfClass = "",
  showRemarks = true,
  padClass = "py-3",
}) {
  return (
    <tr data-pdf-section="report-header" data-pdf-row={pdfClass}>
      <td className={`report-doc__area px-4 ${padClass} text-foreground`}>
        {area}
      </td>
      <td
        className={`report-doc__finding px-4 ${padClass} font-medium text-foreground`}
      >
        {finding}
      </td>
      {showRemarks ? (
        <td
          className={`report-doc__remark px-4 ${padClass} text-muted-foreground`}
        >
          {remark}
        </td>
      ) : null}
    </tr>
  );
}

function MobileReportCard({ area, finding, remark, showRemarks = true }) {
  return (
    <div className="report-doc__card rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="report-doc__area text-sm font-medium text-foreground">
          {area}
        </p>
        <span className="report-doc__badge rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
          {finding}
        </span>
      </div>
      {showRemarks ? (
        <p className="mt-2 text-xs text-muted-foreground">{remark}</p>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatDateTime(date) {
  if (!date) return "--";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function calculateAge(dob) {
  if (!dob) return "--";
  const birthDate = new Date(dob);
  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  if (today.getDate() < birthDate.getDate()) months--;
  if (months < 0) {
    years--;
    months += 12;
  }
  return `${years} Years ${months} Months`;
}

function formatMetric(value, unit) {
  const raw = String(value ?? "").trim();

  if (!raw) return "--";

  const text =
    unit && raw.toLowerCase().endsWith(unit.toLowerCase())
      ? raw.slice(0, -unit.length).trim()
      : raw;

  if (!text) return "--";

  return unit ? `${text} ${unit}` : text;
}

function getRecordName(record, ...keys) {
  for (const key of keys) {
    const value = record?.[key];
    const name =
      typeof value === "object" && value !== null
        ? (value.name ?? value.label)
        : value;
    const text = String(name ?? "").trim();

    if (text) return text;
  }

  return "";
}

/* -------------------------------------------------------------------------- */
/* Main component — page-level (no modal wrapper)                             */
/* -------------------------------------------------------------------------- */

export default function HealthCheckContent({
  selectUser,
  student,
  branch: branchProp,
  camp,
  assignedScreeningIds = [],
}) {
  const dispatch = useDispatch();

  const authUser = useAppSelector(selectAuthUser);
  const doctorId = useMemo(
    () =>
      authUser?.id ??
      authUser?.Id ??
      selectUser?.doctor_id ??
      selectUser?.id ??
      null,
    [authUser, selectUser],
  );
  console.log(authUser, "authUser");

  console.log(selectUser, "ldii");
  const reportRef = useRef(null);
  const doctorSignatureState = useAppSelector((state) => state.doctorSignature);
  const doctorSignatureUrl = normalizeSignatureUrl(
    getSignatureValue(doctorSignatureState),
  );
console.log(branchProp, "dsdsdsdd");


  const signatoryName = useMemo(() => {
    const candidates = [
      authUser?.label,
      authUser?.emp_name,
      authUser?.user_name,
      authUser?.username,
    ];

    return (
      candidates
        .find((value) => typeof value === "string" && value.trim().length > 0)
        ?.trim() ?? ""
    );
  }, [authUser]);

  useEffect(() => {
    // Doctor signature endpoints are role-scoped; other roles get a 401 there.
    if (!doctorId) {
      return;
    }

    dispatch(getDoctorSignature(doctorId));
  }, [dispatch, doctorId]);

  console.log(doctorSignatureState, "doctorSignatureState");

  console.log(camp, "campcamp");
  console.log(student, "studentstudent");

  const studentName = student?.name ?? student?.student_name ?? "Student";
  const studentPhoto =
    student?.image_path ??
    student?.profile_image ??
    student?.student_image ??
    student?.image ??
    student?.photo ??
    "";

  const selectedSchool = branchProp ?? selectUser?.branch ?? selectUser;
  console.log(selectUser, "selectedSchool");

  const getGenderIcon = (gender) => {
    const key = "gender-icon";
    if (!gender) return null;
    switch (gender.toLowerCase()) {
      case "male":
        return (
          <Mars
            key={key}
            size={14}
            aria-hidden="true"
            className="text-primary"
          />
        );
      case "female":
        return (
          <Venus
            key={key}
            size={14}
            aria-hidden="true"
            className="text-primary"
          />
        );
      default:
        return (
          <Transgender
            key={key}
            size={14}
            aria-hidden="true"
            className="text-muted-foreground"
          />
        );
    }
  };

  const schoolName =
    selectedSchool?.label ??
    selectedSchool?.branch_name ??
    selectedSchool?.name ??
    selectedSchool?.school_name ??
    "--";

  // School / branch address — same field conventions as the branch-options
  // `toOption` mapping, read from the selected School Name option.
  const schoolAddress = {
    address_line_1:
      String(
        selectedSchool?.address_line_1 ?? selectedSchool?.address_line1 ?? "",
      ).trim() || null,
    address_line_2:
      String(
        selectedSchool?.address_line_2 ?? selectedSchool?.address_line2 ?? "",
      ).trim() || null,
    area: String(selectedSchool?.area ?? "").trim() || null,
    city: String(selectedSchool?.city ?? "").trim() || null,
    state: String(selectedSchool?.state ?? "").trim() || null,
    country: String(selectedSchool?.country ?? "").trim() || null,
    pincode:
      String(
        selectedSchool?.pincode ??
          selectedSchool?.pin_code ??
          selectedSchool?.zip ??
          "",
      ).trim() || null,
    registration_number:
      String(
        selectedSchool?.registration_number ?? selectedSchool?.reg_no ?? "",
      ).trim() || null,
  };
  const schoolAddressText = [
    schoolAddress.address_line_1,
    schoolAddress.address_line_2,
    schoolAddress.area,
    schoolAddress.city,
    schoolAddress.state,
    schoolAddress.country,
    schoolAddress.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const classValue = student?.class ?? student?.Class ?? "--";
  const sectionValue = student?.sec ?? student?.section ?? "--";

  const admissionNo = student?.admission_number ?? "--";
  const dobValue = student?.dob ?? "--";
  const uhid = student?.uhid ?? "--";
  const svasthaId = student?.svastha_id;
  const studentIdentifier = String(
    student?.student_id ??
      student?.id ??
      student?.studentId ??
      student?.cus_id ??
      "",
  ).trim();

  const reportSettings = useAppSelector((state) => state.reportSettings);
  const reportSection = reportSettings?.reportSection ?? {};

  /* ---------------------------------------------------------------------- */
  /* Camp screening assignment                                              */
  /* The camp only allows a subset of screenings (screening_ids "1".."5").    */
  /* ---------------------------------------------------------------------- */

  const assignedScreeningIdsKey = Array.isArray(assignedScreeningIds)
    ? assignedScreeningIds.join(",")
    : "";

  const assignedScreeningKeys = useMemo(() => {
    const rawIds = assignedScreeningIdsKey
      ? assignedScreeningIdsKey.split(",")
      : getScreeningIds(camp);

    return Array.from(
      new Set(rawIds.map((id) => getScreeningKey(id)).filter(Boolean)),
    );
  }, [assignedScreeningIdsKey, camp]);

  const isAssigned = (key) =>
    isScreeningKeyAssigned(assignedScreeningKeys, key);

  // Report-section setting AND camp assignment.
  const showEnt = (reportSection.ent ?? true) && isAssigned("ent");
  const showStudentInfo = reportSection.student_info ?? true;
  const showVitals = (reportSection.vitals ?? true) && isAssigned("general");
  const showVision = (reportSection.vision ?? true) && isAssigned("vision");
  const showHearing = (reportSection.hearing ?? true) && isAssigned("hearing");
  const showDental = (reportSection.dental ?? true) && isAssigned("dental");
  const showImmunization = reportSection.immunization ?? true;
  const showRecommendations = reportSection.recommendations ?? true;

  const getGridCount = [
    showVision,
    showHearing,
    showDental,
    showEnt,
    showVitals,
    showImmunization,
  ].filter(Boolean);

  const statusCardCount = getGridCount.length;
  const statusGridCols =
    {
      1: "sm:grid-cols-1",
      2: "sm:grid-cols-2",
      3: "sm:grid-cols-3",
      4: "sm:grid-cols-2 lg:grid-cols-4",
      5: "sm:grid-cols-3 lg:grid-cols-5",
      6: "sm:grid-cols-3 lg:grid-cols-3",
    }[statusCardCount] ?? "sm:grid-cols-2";

  const reportTemplate = reportSettings?.reportTemplate ?? "detailed";
  const showStatusCards = reportTemplate !== "summary";
  const showRemarks = reportTemplate !== "compact";

  const tableDensity = reportSettings?.tableDensity ?? "comfortable";
  const rowPadClass = tableDensity === "compact" ? "py-1.5" : "py-3";

  const showLetterhead = reportSettings?.schoolHead ?? false;

  const {
    generalScreeningRecord,
    hearingScreeningRecord,
    dentalScreeningRecord,
    visionScreeningRecord,
    entScreeningRecord,
    isLoading: screeningLoading,
  } = useScreeningRecordByFilter({
    getId: studentIdentifier,
    campId: camp?.id ?? camp?.campId ?? "",
    class: student?.class ?? "",
    section: student?.sec ?? student?.section ?? "",
  });
  console.log(hearingScreeningRecord, "hearingScreeningRecord");

  const getBloodGroup = (bloodGroup) =>
    String(bloodGroup ?? "").trim() ||
    getRecordName(
      generalScreeningRecord,
      "blood_group",
      "blood_group_name",
      "bloodGroup",
    ) ||
    "--";

  const getHeight = (height) =>
    formatMetric(height ?? generalScreeningRecord?.height, "cm");

  const getWeight = (weight) =>
    formatMetric(weight ?? generalScreeningRecord?.weight, "kg");

  const getAllRecordForGeneral = () => ({
    height: getHeight(),
    weight: getWeight(),
    bmi: formatMetric(generalScreeningRecord?.bmi, ""),
    bloodGroup: getBloodGroup(),
    status:
      getRecordName(
        generalScreeningRecord,
        "consolidate_report_result",
        "result",
        "status",
      ) || "--",
    remarks:
      getRecordName(generalScreeningRecord, "remarks", "remarks") || "--",
    regularMedication:
      getRecordName(
        generalScreeningRecord,
        "regular_medication",
        "regularMedication",
      ) || "--",
  });

  const getAllRecordForVision = () => {
    const r = visionScreeningRecord;
    const yesNo = (value) =>
      value === true ? "Yes" : value === false ? "No" : "";
    return {
      odDistanceWith: r?.od_distance_with ?? "NA",
      odDistanceWithout: r?.od_distance_without ?? "NA",
      odNearWith: r?.od_near_with ?? "NA",
      odNearWithout: r?.od_near_without ?? "NA",
      odRemarks: r?.od_remarks ?? "",

      osDistanceWith: r?.os_distance_with ?? "NA",
      osDistanceWithout: r?.os_distance_without ?? "NA",
      osNearWith: r?.os_near_with ?? "NA",
      osNearWithout: r?.os_near_without ?? "NA",
      osRemarks: r?.os_remarks ?? "",

      ouDistanceWith: r?.ou_distance_with ?? "NA",
      ouDistanceWithout: r?.ou_distance_without ?? "NA",
      ouNearWith: r?.ou_near_with ?? "NA",
      ouNearWithout: r?.ou_near_without ?? "NA",
      ouRemarks: r?.ou_remarks ?? "",

      lensPower: r?.lens_power ?? "",
      lensType: r?.lens_type ?? "",
      lensRemarks: r?.lens_remarks ?? "",
      correction: r?.correction ?? "",

      strabismus: yesNo(r?.strabismus),
      pupil: r?.pupil ?? "",
      lids: r?.lids ?? "",
      muscleBalanceRemarks: r?.muscle_balance_remarks ?? "",
      refractiveError: r?.refractive_error ?? "",
      refractiveErrorRemarks: r?.refractive_error_remarks ?? "",

      referralRequired: yesNo(r?.referral_required),
      referralReason: r?.referral_reason ?? "",
      referralGrade: r?.referral_grade ?? "",

      riskScore: r?.risk_score ?? "",
      severityScore: r?.severity_score ?? "",
      followUp: r?.follow_up ?? "",
      remarks: r?.remarks ?? "",
      usesGlassesOrLens: yesNo(r?.uses_glasses_or_lens),
      status: getRecordName(r, "consolidate_report_result", "result", "status"),
    };
  };

  const getDentalStatus = () =>
    getRecordName(
      dentalScreeningRecord,
      "consolidate_report_result",
      "result",
      "status",
    ) ||
    getRecordName(
      dentalScreeningRecord?.report,
      "consolidate_report_result",
      "result",
      "status",
    ) ||
    "--";

  const getAllRecordForDental = () => ({
    teethCondition: dentalScreeningRecord?.report?.teeth_condition ?? "",
    gumCondition: dentalScreeningRecord?.report?.gum_condition ?? "",
    riskScore: dentalScreeningRecord?.report?.risk_score ?? "",
    severityScore: dentalScreeningRecord?.report?.severity_score ?? "",
    followUp: dentalScreeningRecord?.report?.follow_up ?? "",
    remarks: dentalScreeningRecord?.report?.remarks ?? "",
    gingivaHealth: dentalScreeningRecord?.report?.gingival_health ?? "",
    referralReason: dentalScreeningRecord?.report?.referral_reason ?? "",
    healthyCount: dentalScreeningRecord?.report?.healthy_count ?? "",
    status: getDentalStatus(),
  });

  const getAllRecordForHearing = () => ({
    ear_exam_left: hearingScreeningRecord?.ear_exam_le ?? "",
    ear_exam_right: hearingScreeningRecord?.ear_exam_re ?? "",
    follow_up: hearingScreeningRecord?.follow_up ?? "",
    overall_status: hearingScreeningRecord?.overall_status ?? "",
    remarks: hearingScreeningRecord?.remarks ?? "",
    overallStatusLeft: hearingScreeningRecord?.overall_status_le ?? "",
    overallStatusRight: hearingScreeningRecord?.overall_status_re ?? "",
    status: hearingScreeningRecord?.consolidate_report_result ?? "",
    referralReason: hearingScreeningRecord?.referral_reason ?? "",
  });

  const generalRecord = getAllRecordForGeneral();
  const visionRecord = getAllRecordForVision();
  const dentalRecord = getAllRecordForDental();
  const hearingRecord = getAllRecordForHearing();
  console.log(hearingRecord, "hearingRecordsss");

  const followUpSources = [
    ["Physical", generalScreeningRecord],
    ["Vision", visionScreeningRecord],
    ["Hearing", hearingScreeningRecord],
    ["Oral", dentalScreeningRecord],
    ["ENT", entScreeningRecord],
  ];

  console.log(visionRecord, "visionRecord");

  const followUpList = followUpSources
    .map(([label, record]) => {
      const value = String(
        record?.follow_up ??
          record?.follow_up_notes ??
          record?.followUp ??
          record?.referral_reason ??
          record?.advice_suggestions ??
          record?.report?.referral_reason ??
          "",
      ).trim();

      return value ? { label, value } : null;
    })
    .filter(Boolean)
    .filter(
      (item, index, list) =>
        list.findIndex(
          (other) => other.value.toLowerCase() === item.value.toLowerCase(),
        ) === index,
    );
  console.log(followUpSources, "followUpSources");
  console.log(visionScreeningRecord, "visionScreeningRecord");

  const generalCardRecord = {
    bmi: generalRecord.bmi,
  };

  const dentalCardRecord = {
    gingivaHealth: dentalRecord.gingivaHealth,
    teethCondition: dentalRecord.teethCondition,
    gumCondition: dentalRecord.gumCondition,
    healthyCount: dentalRecord.healthyCount,
    // hearingRemarks: hearingRecord.remarks,
  };
  const hearingCardRecord = {
    overallStatusLeft: hearingRecord.overallStatusLeft,
    overallStatusRight: hearingRecord.overallStatusRight,
    overallStatus: hearingRecord.overall_status,
    // referralReason: hearingRecord.referralReason,
  };

  const visionCardRecord = {
    odDistanceWith: visionRecord.odDistanceWith,
    odDistanceWithout: visionRecord.odDistanceWithout,
    osNearWithout: visionRecord.osNearWithout,
    osDistanceWith: visionRecord.osDistanceWith,
    osDistanceWithout: visionRecord.osDistanceWithout,
    osNearWith: visionRecord.osNearWith,
    osNearWithout: visionRecord.osNearWithout,
    // nearWithOS: visionRecord.nearWithOS,
    // remarks: visionRecord.remarks,
    // remarksOS: visionRecord.remarksOS,
    // correction: visionRecord.correction,
    // riskScore: visionRecord.riskScore,
    // severityScore: visionRecord.severityScore,
    // followUp: visionRecord.followUp,
  };

  const heightValue = generalScreeningRecord?.height;
  const weightValue = generalScreeningRecord?.weight;
  const bloodGroupValue = generalRecord.bloodGroup;
  const physicalExamFinding = generalRecord.status;

  const visionStatus = visionRecord.status;
  const visionExamFinding = [visionStatus, visionRecord.muscleBalanceRemarks]
    .filter(Boolean)
    .join(REMARK_SEPARATOR);

  const dentalExamFinding = dentalRecord.status;
  const hearingFinding = hearingRecord.status;

  const physicalExamRemark = buildRemark(
    [
      // ["Height", generalRecord.height],
      // ["Weight", generalRecord.weight],
      // ["BMI", generalRecord.bmi],
      // ["Blood Group", generalRecord.bloodGroup],
      // ["", generalRecord.regularMedication],
      ["", generalRecord.remarks],
    ],
    generalScreeningRecord,
  );

  const dentalExamRemark = buildRemark(
    [["", dentalRecord.remarks]],
    dentalScreeningRecord,
  );

  const hearingExamRemark = buildRemark(
    [["", hearingRecord.remarks]],
    hearingScreeningRecord,
  );
  const visionExamRemark = buildRemark(
    [
      ["OD", visionRecord.odRemarks],
      ["OS", visionRecord.osRemarks],
      ["OU", visionRecord.ouRemarks],
      ["", visionRecord.remarks],
    ],
    visionScreeningRecord,
  );
  console.log(hearingExamRemark, "hearingExamRemarksss");

  const handleDownloadPDF = async () => {
    const element = reportRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (clonedDoc) => {
          clonedDoc
            .querySelectorAll("[data-pdf-hide]")
            .forEach((el) =>
              el.style.setProperty("display", "none", "important"),
            );

          const reportRoot = clonedDoc.querySelector("[data-pdf-report]");
          if (reportRoot) {
            reportRoot
              .querySelectorAll("h1, h2, h3, h4, h5, h6")
              .forEach((h) =>
                h.style.setProperty("color", "#00a4e3", "important"),
              );
            reportRoot
              .querySelectorAll("p, li, span")
              .forEach((el) =>
                el.style.setProperty("color", "#000000", "important"),
              );
          }

          const reportHeader = clonedDoc.querySelector(
            '[data-pdf-section="report-header"]',
          );
          if (reportHeader) {
            reportHeader.style.setProperty(
              "background-color",
              "#f3f4f6",
              "important",
            );
            reportHeader.style.setProperty("color", "#000000", "important");
            reportHeader.querySelectorAll("th").forEach((th) => {
              th.style.setProperty("background-color", "#f3f4f6", "important");
              th.style.setProperty("color", "#000000", "important");
              th.style.setProperty("border-color", "#d1d5db", "important");
            });
          }

          const pdfColors = {
            physical: {
              background: "#ffffff",
              text: "#222222",
              border: "#e5e7eb",
            },
            vision: {
              background: "#ffffff",
              text: "#222222",
              border: "#e5e7eb",
            },
            hearing: {
              background: "#ffffff",
              text: "#222222",
              border: "#e5e7eb",
            },
            dental: {
              background: "#ffffff",
              text: "#222222",
              border: "#e5e7eb",
            },
            immunization: {
              background: "#ffffff",
              text: "#222222",
              border: "#e5e7eb",
            },
          };

          Object.entries(pdfColors).forEach(([type, colors]) => {
            const rows = clonedDoc.querySelectorAll(`[data-pdf-row="${type}"]`);
            rows.forEach((row) => {
              row.querySelectorAll("td").forEach((cell) => {
                cell.style.setProperty(
                  "background-color",
                  colors.background,
                  "important",
                );
                cell.style.setProperty("color", colors.text, "important");
                cell.style.setProperty(
                  "border-color",
                  colors.border,
                  "important",
                );
              });
            });
          });

          const recommendations = clonedDoc.querySelector(
            '[data-pdf-section="recommendations"]',
          );
          if (recommendations) {
            recommendations.style.setProperty(
              "background-color",
              "#ffffff",
              "important",
            );
            recommendations.style.setProperty("color", "#000000", "important");
            recommendations.style.setProperty(
              "border-color",
              "#e5e7eb",
              "important",
            );
            recommendations
              .querySelectorAll("*")
              .forEach((child) =>
                child.style.setProperty(
                  "background-color",
                  "transparent",
                  "important",
                ),
              );
            recommendations
              .querySelectorAll("h1, h2, h3, h4, h5, h6")
              .forEach((h) =>
                h.style.setProperty("color", "#00a4e3", "important"),
              );
            recommendations
              .querySelectorAll("p, li, span")
              .forEach((el) =>
                el.style.setProperty("color", "#000000", "important"),
              );
            recommendations
              .querySelectorAll("svg")
              .forEach((icon) =>
                icon.style.setProperty("color", "#16a34a", "important"),
              );
          }

          if (reportRoot) {
            reportRoot.style.setProperty(
              "background-color",
              "#ffffff",
              "important",
            );

            // The Summary table uses responsive show/hide (hidden sm:block vs
            // sm:hidden). html2canvas re-renders the clone in its own iframe where
            // the sm: breakpoint can resolve differently — if BOTH blocks end up
            // hidden you get a big blank gap before Recommendations. Force the
            // desktop summary table visible and the mobile block hidden in the PDF.
            reportRoot
              .querySelectorAll("[data-pdf-force-block]")
              .forEach((el) =>
                el.style.setProperty("display", "block", "important"),
              );
            reportRoot
              .querySelectorAll("[data-pdf-hide]")
              .forEach((el) =>
                el.style.setProperty("display", "none", "important"),
              );
          }
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      // Equal left/right margin: 6mm each side
      const marginX = 6;
      const imgWidth = pageWidth - marginX * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;
      pdf.addImage(imgData, "PNG", marginX, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 12;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", marginX, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${studentName || "student"}-health-report.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="space-y-5 px-2">
      {/* <div className="sticky top-14 z-10 flex flex-col gap-3 bg-background/80 px-0 backdrop-blur supports-backdrop-filter:bg-background/60 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-sf text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
            Health Check Report
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Academic Year: {student?.academic_year ?? "2026-2027"}
          </p>
        </div>
        <div className="flex flex-row gap-2">
          {showLetterhead ? (
            <div className="rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
              {student?.school_name ?? "SchoolName"}
            </div>
          ) : null}
          <Button
            type="button"
            variant="outline"
            onClick={handleDownloadPDF}
            className="rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary"
          >
            Download PDF
          </Button>
        </div>
      </div> */}

      <div
        ref={reportRef}
        data-pdf-report
        className="report-surface mx-auto w-full max-w-full space-y-6 rounded-lg border border-border px-4 py-8 text-foreground shadow-md sm:px-8 sm:py-10 md:max-w-[90%] md:px-10 lg:max-w-[210mm] lg:px-12 lg:py-12 print:shadow-none print:border-0"
      >
        {showStudentInfo ? (
          <section className="space-y-4">
            {/* <div className="flex flex-col items-center gap-4">
              <h2 className="text-center text-foreground">
                {schoolName}
              </h2>
              {schoolAddressText ? (
                <p className="-mt-4 mb-2 text-center text-xs text-muted-foreground">
                  {schoolAddressText || ""}
                </p>
              ) : (
                null
              )}
            </div> */}

            <div className="flex flex-col items-end gap-1">
              <Link
                href="/"
                aria-label="Svastha home"
                className={cn(
                  "flex h-10 w-full items-center justify-end gap-2 overflow-hidden rounded-md px-3",
                  "transition-[padding,gap] duration-200 ease-linear",
                  "group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-2",
                )}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md">
                  <Image src="/logo.svg" alt="Logo" width={24} height={24} />
                </span>

                <span
                  className={cn(
                    "min-w-0 max-w-40 truncate font-sf text-4xl font-bold tracking-wide text-brand-blue",
                    "transition-[max-width,opacity] duration-200 ease-linear",
                    "group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0",
                  )}
                >
                  Svas
                  <span className="text-brand-green">t</span>
                  ha
                </span>
              </Link>
              <h6 className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="size-3.5 shrink-0 text-primary" />
                <span className="whitespace-nowrap">
                  Academic Session: {student?.academic_year ?? "--"}
                </span>
              </h6>
              {/* <h2 className="text-center text-foreground">{schoolName || "dpokokw[ejrije[wrjiwrwr"}</h2>
              {schoolAddressText ? (
                <p className="-mt-4 mb-2 text-center text-xs text-muted-foreground">
                  {schoolAddressText || ""}
                </p>
              ) : null */}
            </div>
            {/* <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_auto]">
              <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                <Info label="Student Name" value={studentName} />
                <Info label="Age" value={} />
                <Info label="Gender" value={student?.gender ?? "--"} />
                <Info
                  label="Class / Section"
                  value={`${classValue}-${sectionValue}`}
                />
                <Info
                  label="Health Check Date"
                  value={formatDateTime(
                    student?.updated_at ?? student?.updatedAt,
                  )}
                />
              </div>
              <div className="flex justify-start sm:justify-end">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                  {studentPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={studentPhoto}
                      alt="Student"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Paste Photo here
                    </span>
                  )}
                </div>
              </div>
            </div> */}
            <div className="report-doc__identity flex flex-col w-full">
              <div className="flex flex-row gap-5">
                <div className="flex justify-start sm:justify-end relative">
                  <div className="report-doc__photo flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                    {studentPhoto ? (

                      <Image
                        src={studentPhoto}
                        alt="Student"
                        width={96}
                        height={96}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Paste Photo here
                      </span>
                    )}
                  </div>
                 

                  <Image
                    src={"/badge.svg"}
                    alt="Svastha verified student health seal"
                    width={8}
                    height={8}
                    className="size-8 shrink-0 object-contain absolute bottom-2 left-9/12 rotate-325"
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-1 w-full">
                  <div className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <h2 className="min-w-0 flex-1 basis-48 wrap-break-word font-bold leading-snug text-foreground">
                      {studentName}
                    </h2>
                  </div>
                  <div className="flex flex-row gap-2 pb-1">
                    <Badge variant="success" className="w-fit">
                      <span className="text-muted-foreground flex gap-1">
                        <School size={14} className="text-primary" />
                        Class {classValue}-{sectionValue}
                      </span>
                    </Badge>
                    <Badge variant="outline" className="w-fit">
                      <span className="text-muted-foreground font-bold flex items-center gap-1">
                        {getGenderIcon(student?.gender) ?? "--"}
                        <span className="capitalize">{student?.gender}</span>
                      </span>
                    </Badge>
                  </div>
                  <div className="flex w-full flex-wrap items-center gap-3">
                    <div className="flex shrink-0">
                      <Badge
                        variant="special"
                        className="border-secondary bg-secondary"
                      >
                        <span className="font-bold text-muted-foreground flex items-center gap-1">
                          <Cake className="text-primary size-4" />
                          {calculateAge(dobValue)}
                        </span>
                      </Badge>
                    </div>

                    <div className="flex shrink-0">
                      <Badge variant="normal" className="">
                        <span className="font-bold text-muted-foreground flex items-center gap-1">
                          <HeightIcon className="text-primary size-4 stroke-2" />
                          {getHeight(heightValue)}
                        </span>
                      </Badge>
                    </div>

                    <div className="flex shrink-0">
                      <Badge variant="warning">
                        <span className="font-bold text-muted-foreground flex items-center gap-1">
                          <WeightIcon className="text-primary size-4 stroke-2" />
                          {getWeight(weightValue)}
                        </span>
                      </Badge>
                    </div>
                    {/* <div className="flex shrink-0">
                      <Badge
                        variant="normal"
                      >
                        <span className="font-bold text-muted-foreground flex items-center gap-1">
                          <BmiIcon  className="text-primary size-4 " />
                          {getBMI(weightValue, heightValue)}
                        </span>
                      </Badge>
                    </div> */}
                    <div className="flex shrink-0">
                      <Badge variant="bad">
                        <span className="font-bold text-muted-foreground flex items-center gap-1">
                          <Droplet className="text-destructive size-4" />
                          {getBloodGroup(bloodGroupValue)}
                        </span>
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-stretch gap-3">
                <CopyableInfo
                  label="Admission No"
                  value={admissionNo}
                  icon={IdCard}
                />
                <CopyableInfo
                  label="UHID No"
                  value={uhid}
                  icon={IdCardLanyard}
                />
                {svasthaId ? (
                  <CopyableInfo
                    label="SvasthaID No"
                    value={svasthaId}
                    valueClass="text-primary font-bold"
                    icon={
                      <Image
                        src="/logo.svg"
                        width={16}
                        height={16}
                        alt="svastha-id"
                      />
                    }
                  />
                ) : null}
                <CopyableInfo
                  label="Date of Birth"
                  value={dobValue}
                  icon={CalendarCheck}
                />
              </div>
            </div>
          </section>
        ) : null}

        {showStatusCards ? (
          <section className={`grid grid-cols-2 gap-3 ${statusGridCols}`}>
            {showVitals ? (
              <StatusCard
                icon={Activity}
                title="Physical Health"
                status={physicalExamFinding || "Normal"}
                tone="physical"
                record={generalCardRecord}
              />
            ) : null}
            {showVision ? (
              <StatusCard
                icon={Eye}
                title="Vision"
                status={visionStatus || "Normal"}
                tone="vision"
                record={visionCardRecord}
              />
            ) : null}
            {showHearing ? (
              <StatusCard
                icon={Ear}
                title="Hearing"
                status={hearingFinding || "Normal"}
                tone="hearing"
                record={hearingCardRecord}
              />
            ) : null}
            {showDental ? (
              <StatusCard
                icon={ToothIcon}
                title="Oral Health"
                status={dentalExamFinding || "Normal"}
                tone="oral"
                record={dentalCardRecord}
              />
            ) : null}
            {showImmunization ? (
              <StatusCard
                icon={Syringe}
                title="Vaccination"
                status="Up to Date"
                tone="immunization"
              />
            ) : null}

            {showEnt ? (
              <StatusCard
                icon={EarNoseThroatOutlineIcon}
                title="ENT"
                status="Normal"
                tone="ent"
                iconSize="size-5"
                iconProps={{
                  className: "[&_g]:fill-none",
                  stroke: "currentColor",
                  strokeWidth: 1.5,
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                }}
              />
            ) : null}
          </section>
        ) : null}

        <section>
          <h3 className="report-doc__heading mb-3 text-sm font-semibold text-foreground">
            Summary
          </h3>
          <div
            className="report-doc__table hidden overflow-hidden rounded-lg border sm:block"
            data-pdf-force-block
          >
            <table className="w-full text-sm">
              <thead
                data-pdf-section="report-header"
                className="report-doc__thead text-left"
              >
                <tr>
                  <th className="px-4 py-3 font-semibold">Area</th>
                  <th className="px-4 py-3 font-semibold">Findings</th>
                  {showRemarks ? (
                    <th className="px-4 py-3 font-semibold">Remarks</th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="report-doc__tbody divide-y">
                {showVitals ? (
                  <ReportRow
                    area="Physical Examination"
                    finding={physicalExamFinding}
                    remark={physicalExamRemark}
                    pdfClass="physical"
                    showRemarks={showRemarks}
                    padClass={rowPadClass}
                  />
                ) : null}
                {showVision ? (
                  <ReportRow
                    area="Vision Screening"
                    finding={visionExamFinding}
                    remark={visionExamRemark}
                    pdfClass="vision"
                    showRemarks={showRemarks}
                    padClass={rowPadClass}
                  />
                ) : null}
                {showHearing ? (
                  <ReportRow
                    area="Hearing Screening"
                    finding="Normal"
                    remark={hearingExamRemark}
                    pdfClass="hearing"
                    showRemarks={showRemarks}
                    padClass={rowPadClass}
                  />
                ) : null}
                {showDental ? (
                  <ReportRow
                    area="Dental Check-up"
                    finding={dentalExamFinding}
                    remark={dentalExamRemark}
                    pdfClass="dental"
                    showRemarks={showRemarks}
                    padClass={rowPadClass}
                  />
                ) : null}
                {showImmunization ? (
                  <ReportRow
                    area="Immunization"
                    finding="Up to Date"
                    remark="All recommended vaccines completed"
                    pdfClass="immunization"
                    showRemarks={showRemarks}
                    padClass={rowPadClass}
                  />
                ) : null}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 sm:hidden" data-pdf-hide>
            {showVitals ? (
              <MobileReportCard
                area="Physical Examination"
                finding={physicalExamFinding}
                remark={physicalExamRemark}
                showRemarks={showRemarks}
              />
            ) : null}
            {showVision ? (
              <MobileReportCard
                area="Vision Screening"
                finding={visionExamFinding}
                remark="6/6 in both eyes"
                showRemarks={showRemarks}
              />
            ) : null}
            {showHearing ? (
              <MobileReportCard
                area="Hearing Screening"
                finding="Normal"
                remark={hearingExamRemark}
                showRemarks={showRemarks}
              />
            ) : null}
            {showDental ? (
              <MobileReportCard
                // record={dentalCardRecord}
                area="Dental Check-up"
                finding={dentalExamFinding}
                remark={dentalExamRemark}
                showRemarks={showRemarks}
              />
            ) : null}
            {showImmunization ? (
              <MobileReportCard
                area="Immunization"
                finding="Up to Date"
                remark="All recommended vaccines completed"
                showRemarks={showRemarks}
              />
            ) : null}
          </div>
        </section>

        {showRecommendations ? (
          <>
            <section
              data-pdf-section="recommendations"
              className="report-doc__recommendations rounded-lg border bg-muted/40 p-4"
            >
              <h3 className="report-doc__heading mb-3 text-sm font-semibold text-foreground">
                Recommendations
              </h3>
              {followUpList.length ? (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {followUpList.map((item) => (
                    <li
                      key={`${item.label}-${item.value}`}
                      className="flex gap-2"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span>
                        <span className="font-medium text-foreground">
                          {item.label}:
                        </span>{" "}
                        {item.value}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No follow-up recommendations recorded.
                </p>
              )}
            </section>

            {/* <section className="report-doc__signoff flex flex-col items-end p-4">
              <div className="flex justify-start sm:justify-end">
                <div className="relative h-28 w-72">
                  {doctorSignatureUrl ? (
                    
                    <Image
                      src={doctorSignatureUrl}
                      alt="Doctor signature"
                      fill
                      sizes="288px"
                      className="object-contain"
                    />
                  ) : (
                    <div className="report-doc__photo flex h-28 w-72 items-center justify-center overflow-hidden rounded-lg border-dotted border bg-muted">
                      <span className="text-xs text-muted-foreground">
                        No signature
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {signatoryName || "School Health Officer"}
                </h3>
                <h6 className="text-[11px] text-muted-foreground">MBBS</h6>
              </div>
              <p className="text-xs text-muted-foreground">
                School Health Officer
              </p>
              <p className="text-xs text-muted-foreground">
                Svastha Health Services
              </p>
            </section> */}
            {/* Verification band: QR/attestation on the left, the Svastha seal in
                the middle, the examining doctor's identity on the right. Purely
                presentational — it reuses the ids already resolved above. */}
            <div className="report-doc__verification relative flex flex-col gap-5 rounded-lg border border-border/70 bg-card/40 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3 sm:max-w-[calc(50%-4.5rem)]">
                <div className="flex size-20 shrink-0 items-center justify-center rounded-md border border-dashed border-border bg-background">
                  {studentPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={studentPhoto}
                      alt="Student"
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="px-1 text-center text-[10px] leading-tight text-muted-foreground">
                      QR / Photo
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5 font-semibold text-primary">
                    <CheckCircle2 className="size-3.5 shrink-0" />
                    Digital Attestation &amp; Verification
                  </p>
                  <p>
                    Scan QR or verify with UHID:{" "}
                    <span className="font-semibold text-foreground">
                      {uhid}
                    </span>{" "}
                    on Svastha Portal.
                  </p>
                  {schoolAddress.registration_number ? (
                    <p>
                      SHA-256 Verified Medicat Seal{" "}
                      <span className="font-mono text-[11px]">
                        #{schoolAddress.registration_number}
                      </span>
                    </p>
                  ) : null}
                  <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning">
                    Awaiting Primary Doctor Sign-off
                  </span>
                </div>
              </div>

              {/* Seal: in normal flow while the band stacks, then lifted out and
                  pinned to the band's centre from `sm` up. Static at mobile so
                  it can't overlap the stacked columns. */}
              <div className="flex size-28 shrink-0 flex-col items-center justify-center self-center rounded-full border-2 border-dashed border-primary/40 text-center rotate-325 sm:absolute sm:left-3/5 z-1 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2">
                <Image src="/logo.svg" alt="Svastha" width={28} height={28} />
                <span className="mt-1 font-sf text-sm font-bold tracking-wide text-brand-blue">
                  Svastha
                </span>
                <span className="text-[9px] tracking-[0.18em] text-primary">
                  Authorized Signatory
                </span>
                <span className="text-[9px] text-muted-foreground text-brand-green">SMS</span>
              </div>

              <div className="space-y-1 text-right sm:ml-auto sm:max-w-[calc(50%-4.5rem)]">
                <div className="flex justify-end">
                  <div className="relative h-28 w-72">
                    {doctorSignatureUrl ? (
                      <Image
                        src={doctorSignatureUrl}
                        alt="Doctor signature"
                        fill
                        sizes="288px"
                        className="object-contain"
                      />
                    ) : (
                      <div className="report-doc__photo flex h-28 w-72 items-center justify-center overflow-hidden rounded-lg border-dotted border bg-muted">
                        <span className="text-xs text-muted-foreground">
                          No signature
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {signatoryName ? `${signatoryName}` : "Doctor"}
                  <span className="ml-1 text-xs font-medium text-primary">
                    MBBS
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {schoolName} &amp; Primary Examiner
                </p>
                <p className="text-xs text-muted-foreground">
                  Svastha School Health &amp; Preventive Services
                </p>
                {schoolAddress.registration_number ? (
                  <p className="text-xs font-medium text-primary">
                    Reg. No: {schoolAddress.registration_number}
                  </p>
                ) : null}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
