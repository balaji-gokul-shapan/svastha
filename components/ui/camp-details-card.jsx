"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { CalendarDays, MapPin, School } from "lucide-react";

import { cn } from "../../lib/utils";
import { Badge } from "./badge";

/**
 * CampDetailsCard — shadcn-style card that renders camp (event) details.
 *
 * Accepts either:
 *   1. A full camp/event object from the API:
 *        { id, name, camp_date, school: { school_name, area, city, pincode, registration_number } }
 *   2. The simplified shape returned by findSelectedCamp:
 *        { id, name, schoolName }
 *   3. Direct props (name / schoolName / date / location) which override the
 *      object fields.
 *
 * Renders `null` when no camp data is available, so parents can mount it
 * unconditionally.
 */

const campDetailsCardVariants = cva(
  "rounded-xl border border-border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "p-4",
        compact: "p-3",
        detailed: "p-5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function formatCampDate(value) {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function CampDetailsCard({
  camp,
  name: nameProp,
  schoolName: schoolNameProp,
  date: dateProp,
  location: locationProp,
  variant = "default",
  icon: Icon = CalendarDays,
  iconClass = "bg-primary/10",
  iconColor = "text-primary",
  showRegistration = false,
  showLocation = false,
  className,
  ...props
}) {
  // --------------------------------------------------------------
  // Normalize data from either the object shape or direct props.
  // --------------------------------------------------------------
  const resolved = React.useMemo(() => {
    const source = camp && typeof camp === "object" ? camp : {};

    const name =
      nameProp ??
      String(source.name ?? source.camp_name ?? "").trim() ??
      "";

    const schoolName =
      schoolNameProp ??
      String(
        source.schoolName ??
          source.school_name ??
          source.school?.school_name ??
          source.school?.name ??
          "",
      ).trim();

    const date = dateProp ?? source.date ?? source.camp_date ?? null;

    const location =
      locationProp ??
      [
        source.school?.area ?? source.area,
        source.school?.city ?? source.city,
      ]
        .filter(Boolean)
        .join(", ");

    const registrationNumber =
      source.school?.registration_number ?? source.registration_number ?? null;

    const hasData = Boolean(name || schoolName || date);

    return { name, schoolName, date, location, registrationNumber, hasData };
  }, [camp, nameProp, schoolNameProp, dateProp, locationProp]);

  if (!resolved.hasData) {
    return null;
  }

  const formattedDate = formatCampDate(resolved.date);

  return (
    <div
      data-slot="camp-details-card"
      className={cn(campDetailsCardVariants({ variant }), className)}
      {...props}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            iconClass,
          )}
        >
          {Icon ? <Icon className={cn("size-5", iconColor)} /> : null}
        </div>

        <div className="min-w-0 flex-1">
          {resolved.name ? (
            <p className="truncate text-sm font-medium text-foreground">
              {resolved.name}
            </p>
          ) : null}

          {resolved.schoolName ? (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
              <School className="size-3 shrink-0" />
              <span className="truncate">{resolved.schoolName}</span>
            </p>
          ) : null}

          {showLocation && resolved.location ? (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{resolved.location}</span>
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          {formattedDate ? (
            <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <CalendarDays className="size-3.5" />
              {formattedDate}
            </span>
          ) : null}

          {showRegistration && resolved.registrationNumber ? (
            <Badge variant="outline" className="text-[10px]">
              Reg. {resolved.registrationNumber}
            </Badge>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export { CampDetailsCard, campDetailsCardVariants, formatCampDate };
export default CampDetailsCard;
