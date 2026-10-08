"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Baby,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  HeartPulse,
  ShieldCheck,
  Users,
} from "lucide-react";

const numberValue = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const formatNumber = (value) => numberValue(value).toLocaleString("en-IN");

const unwrapSummary = (value) => {
  let summary = value;
  for (let depth = 0; depth < 3; depth += 1) {
    if (!summary || typeof summary !== "object" || Array.isArray(summary)) {
      return null;
    }

    if (
      summary.students ||
      summary.screening_count ||
      summary.screening_data ||
      summary.current_screening_status ||
      summary.referral_count ||
      summary.follow_up_status ||
      summary.women_special
    ) {
      return summary;
    }

    // Also accept a student-only payload, e.g. data.students, when the caller
    // does not have the sibling screening summary fields.
    if (
      summary.total !== undefined &&
      (summary.age_wise || summary.gender_wise || summary.class_wise)
    ) {
      return { students: summary };
    }

    summary = summary.data ?? summary.summary;
  }
  return null;
};

function BreakdownBars({ title, icon: Icon, rows, tone }) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <section className="school-insights__panel">
      <div className="school-insights__panel-heading">
        <span className={`school-insights__icon school-insights__icon--${tone}`}>
          <Icon aria-hidden="true" />
        </span>
        <div>
          <h3>{title}</h3>
          <p>{formatNumber(total)} students</p>
        </div>
      </div>
      <div className="school-insights__bar-list">
        {rows.map((row) => {
          const percentage = total ? (row.value / total) * 100 : 0;
          return (
            <div className="school-insights__bar-row" key={row.label}>
              <div className="school-insights__bar-label">
                <span>{row.label}</span>
                <span>{formatNumber(row.value)}</span>
              </div>
              <div
                className="school-insights__track"
                role="progressbar"
                aria-label={`${row.label} student share`}
                aria-valuenow={Math.round(percentage)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <motion.span
                  className={`school-insights__fill school-insights__fill--${tone}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SummaryStat({ label, value, detail, icon: Icon, tone, index }) {
  return (
    <motion.article
      className={`school-insights__stat school-insights__stat--${tone}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: index * 0.07 }}
    >
      <span className="school-insights__stat-icon">
        <Icon aria-hidden="true" />
      </span>
      <span className="school-insights__stat-label">{label}</span>
      <strong>{formatNumber(value)}</strong>
      <span className="school-insights__stat-detail">{detail}</span>
    </motion.article>
  );
}

export default function SchoolDashboardInsights({
  data,
  isLoading = false,
  error = null,
}) {
  
  const summary = React.useMemo(() => unwrapSummary(data), [data]);
  const students = summary?.students?.students ?? {};
  console.log(students,"studentswwwwwwwwww");
  const screeningCount = summary?.screening_count ?? {};
  const screeningData = summary?.screening_data ?? {};
  const byType = screeningData?.by_type ?? {};
  const classRows = Array.isArray(students?.class_wise)
    ? [...students.class_wise].sort((left, right) =>
        String(left?.class ?? "").localeCompare(
          String(right?.class ?? ""),
          undefined,
          { numeric: true, sensitivity: "base" },
        ),
      )
    : [];
  const totalStudents = numberValue(students?.total);
  const screened = numberValue(
    screeningCount?.completed ?? screeningData?.total?.screened,
  );
  const pending = numberValue(screeningCount?.pending);
  const followUps = numberValue(
    summary?.follow_up_status?.pending ??
      summary?.current_screening_status?.["Need Follow up"],
  );

  if (isLoading) {
    return (
      <section
        className="school-insights"
        aria-label="Loading school health insights"
        aria-busy="true"
      >
        <div className="school-insights__loading">
          <span />
          <span />
          <span />
          <span />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="school-insights school-insights__message" role="alert">
        <Activity aria-hidden="true" />
        <div>
          <h2>School health insights are unavailable</h2>
          <p>{error.message || String(error)}</p>
        </div>
      </section>
    );
  }

  if (!summary) return null;
console.log(summary?.students?.women_special?.screened,"summary?.women_special");

  const gender = students?.gender_wise ?? {};
  const ageGroups = students?.age_wise ?? {};
  const screeningTypes = Object.entries(byType);
  const womenScreened = numberValue(summary?.students?.women_special?.screened?.total);
  const womenFindings = numberValue(
    summary?.students?.women_special?.screened?.with_finding,
  );
  const currentStatus = summary?.current_screening_status ?? {};
  const followUpStatus = summary?.follow_up_status ?? {};
  const referralCount = summary?.referral_count ?? {};
  const womenFindingRows = Object.values(
    summary?.students?.women_special?.findings ?? {},
  )
    .filter((finding) => numberValue(finding?.total) > 0)
    .slice(0, 4);

  return (
    <motion.section
      className="school-insights"
      aria-labelledby="school-insights-title"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <header className="school-insights__header">
        <div>
          <span className="school-insights__eyebrow">
            <HeartPulse aria-hidden="true" />
            School health snapshot
          </span>
          <h2 id="school-insights-title">Student wellness at a glance</h2>
          <p>Enrollment, screening coverage, and follow-up activity.</p>
        </div>
        <span className="school-insights__header-mark" aria-hidden="true">
          <Activity />
        </span>
      </header>

      <div className="school-insights__stats">
        <SummaryStat
          label="Total students"
          value={totalStudents}
          detail="Across this school"
          icon={Users}
          tone="blue"
          index={0}
        />
        <SummaryStat
          label="Screened"
          value={screened}
          detail={`${totalStudents ? Math.round((screened / totalStudents) * 100) : 0}% of enrolled`}
          icon={ClipboardCheck}
          tone="green"
          index={1}
        />
        <SummaryStat
          label="Pending screening"
          value={pending}
          detail="Students still to screen"
          icon={Activity}
          tone="violet"
          index={2}
        />
        <SummaryStat
          label="Need follow-up"
          value={followUps}
          detail="Requiring attention"
          icon={CheckCircle2}
          tone="amber"
          index={3}
        />
      </div>

      <div className="school-insights__breakdowns">
        <BreakdownBars
          title="Gender distribution"
          icon={Users}
          tone="blue"
          rows={[
            { label: "Male", value: numberValue(gender.male) },
            { label: "Female", value: numberValue(gender.female) },
            { label: "Other", value: numberValue(gender.other) },
            { label: "Unknown", value: numberValue(gender.unknown) },
          ]}
        />
        <BreakdownBars
          title="Age groups"
          icon={Baby}
          tone="violet"
          rows={Object.entries(ageGroups).map(([label, value]) => ({
            label: label === "unknown" ? "Unknown" : `${label} years`,
            value: numberValue(value),
          }))}
        />
      </div>

      <section className="school-insights__panel school-insights__classes">
        <div className="school-insights__panel-heading">
          <span className="school-insights__icon school-insights__icon--amber">
            <BookOpen aria-hidden="true" />
          </span>
          <div>
            <h3>Class &amp; section overview</h3>
            <p>{classRows.length} classes with enrollment details</p>
          </div>
        </div>
        {classRows.length ? (
          <div className="school-insights__class-grid">
            {classRows.map((row) => {
              const sections = Array.isArray(row?.sections) ? row.sections : [];
              const sectionTotal = sections.reduce(
                (sum, section) =>
                  sum +
                  numberValue(section?.male) +
                  numberValue(section?.female),
                0,
              );
              const reportedClassTotal =
                numberValue(row?.male) + numberValue(row?.female);
              const classTotal = reportedClassTotal || sectionTotal;
              return (
                <article
                  className="school-insights__class-card"
                  key={String(row?.class)}
                >
                  <div className="school-insights__class-heading">
                    <span>Class {row?.class || "—"}</span>
                    <strong>{formatNumber(classTotal)}</strong>
                  </div>
                  <div className="school-insights__section-list">
                    {sections.map((section) => (
                      <span
                        className="school-insights__section-chip"
                        key={`${row?.class}-${section?.section}`}
                      >
                        <b>{section?.section || "—"}</b>
                        {formatNumber(
                          numberValue(section?.male) +
                            numberValue(section?.female),
                        )}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="school-insights__empty">
            No class or section totals are available.
          </p>
        )}
      </section>

      <div className="school-insights__bottom-grid">
        <section className="school-insights__panel">
          <div className="school-insights__panel-heading">
            <span className="school-insights__icon school-insights__icon--green">
              <ClipboardCheck aria-hidden="true" />
            </span>
            <div>
              <h3>Screenings by type</h3>
              <p>{formatNumber(screeningData?.total?.screened)} screening records</p>
            </div>
          </div>
          {screeningTypes.length ? (
            <div className="school-insights__screening-list">
              {screeningTypes.map(([name, item], index) => (
                <motion.div
                  className="school-insights__screening-row"
                  key={name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <span className="school-insights__screening-dot" />
                  <span className="school-insights__screening-name">{name}</span>
                  <span>{formatNumber(item?.students)} students</span>
                  <strong>{formatNumber(item?.count)}</strong>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="school-insights__empty">
              No screening type totals are available.
            </p>
          )}
        </section>

        <section className="school-insights__panel">
          <div className="school-insights__panel-heading">
            <span className="school-insights__icon school-insights__icon--violet">
              <ShieldCheck aria-hidden="true" />
            </span>
            <div>
              <h3>Care outcomes</h3>
              <p>Screening status and referrals</p>
            </div>
          </div>
          <div className="school-insights__outcome-grid">
            <div className="school-insights__outcome school-insights__outcome--good">
              <span>Good</span>
              <strong>{formatNumber(currentStatus.Good)}</strong>
            </div>
            <div className="school-insights__outcome school-insights__outcome--followup">
              <span>Need follow-up</span>
              <strong>
                {formatNumber(currentStatus["Need Follow up"])}
              </strong>
            </div>
            <div className="school-insights__outcome school-insights__outcome--referral">
              <span>Referrals</span>
              <strong>{formatNumber(referralCount.total)}</strong>
            </div>
          </div>
          <div className="school-insights__followup-line">
            <span>Follow-ups completed</span>
            <strong>{formatNumber(followUpStatus.completed)}</strong>
            <span>Pending</span>
            <strong>{formatNumber(followUpStatus.pending)}</strong>
          </div>
          <p className="school-insights__women-note">
            Referral breakdown: {formatNumber(referralCount.male)} male ·{" "}
            {formatNumber(referralCount.female)} female ·{" "}
            {formatNumber(referralCount.other)} other
          </p>
        </section>

        <section className="school-insights__panel school-insights__women">
          <div className="school-insights__panel-heading">
            <span className="school-insights__icon school-insights__icon--rose">
              <HeartPulse aria-hidden="true" />
            </span>
            <div>
              <h3>Women&apos;s health</h3>
              <p>Special screening activity</p>
            </div>
          </div>
          <div className="school-insights__women-stats">
            <div>
              <strong>{formatNumber(womenScreened)}</strong>
              <span>screened</span>
            </div>
            <div>
              <strong>{formatNumber(womenFindings)}</strong>
              <span>with findings</span>
            </div>
          </div>
          <p className="school-insights__women-note">
            {womenScreened
              ? "Specialized health findings are included in this dashboard summary."
              : "No women’s health screening records yet."}
          </p>
          {womenFindingRows.length ? (
            <div className="school-insights__finding-list">
              {womenFindingRows.map((finding) => (
                <span key={finding.label}>
                  {finding.label}
                  <strong>{formatNumber(finding.total)}</strong>
                </span>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </motion.section>
  );
}
