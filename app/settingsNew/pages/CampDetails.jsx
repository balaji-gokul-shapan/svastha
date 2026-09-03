"use client";

import React, { useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  MapPin,
  MoreHorizontal,
  School,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import ReusableSelect from "@/components/ui/reusable-select";
import CampDetailsCard from "@/components/ui/camp-details-card";
import useAssignedEvents from "@/lib/useAssignedEvents";
import useAuthUser from "@/lib/useAuthUser";

/**
 * Campus Details - Settings tab that shows the signed-in school's profile and
 * a picker over its assigned camps (health events), with a details card for
 * the selected camp.
 */
const CampDetails = ({ schoolProfile }) => {
  const { authUser } = useAuthUser();
  const { assignedEvents, assignEventLoading, assignEventError } =
    useAssignedEvents();

  const [selectedCampValue, setSelectedCampValue] = useState("all");

  // School profile (from getRegisterSchool -> /api/v1/school/:id)
  const school = useMemo(() => {
    const record = schoolProfile?.data ?? schoolProfile;
    return record && typeof record === "object" ? record : null;
  }, [schoolProfile]);

  const schoolInfo = useMemo(() => {
    if (!school) return null;
    return {
      name: String(school?.name ?? school?.school_name ?? "").trim() || null,
      registration:
        String(
          school?.registration_number ??
            school?.reg_no ??
            school?.registrationNo ??
            "",
        ).trim() || null,
      area: String(school?.area ?? "").trim() || null,
      city: String(school?.city ?? "").trim() || null,
      pincode:
        String(school?.pincode ?? school?.pin_code ?? "").trim() || null,
    };
  }, [school]);

  // Assigned camps -> dropdown options
  const campOptions = useMemo(() => {
    const list = Array.isArray(assignedEvents) ? assignedEvents : [];
    const options = list
      .map((event) => {
        const name = String(event?.name ?? "").trim();
        if (!name) return null;
        return { label: name, value: name };
      })
      .filter(Boolean)
      .sort((a, b) => a.label.localeCompare(b.label));

    return [{ label: "All Camps", value: "all" }, ...options];
  }, [assignedEvents]);

  const selectedCamp = useMemo(() => {
    if (selectedCampValue === "all") return null;
    const list = Array.isArray(assignedEvents) ? assignedEvents : [];
    return (
      list.find(
        (event) =>
          String(event?.name ?? "").trim() === selectedCampValue,
      ) ?? null
    );
  }, [selectedCampValue, assignedEvents]);

  const selectedCampName =
    selectedCampValue === "all" ? "All Camps" : selectedCampValue;

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-start justify-between gap-4 p-5 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Campus Details
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Your school profile and assigned health camps.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="More campus options"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      <div className="space-y-5 px-5 pb-5">
        {/* School profile */}
        <div className="grid gap-4 border-t border-border/70 pt-5 sm:grid-cols-[minmax(0,220px)_1fr]">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <School className="size-4 text-brand-blue" />
              School Profile
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Registered details of your institution.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {schoolInfo ? (
              <>
                <div className="rounded-xl border border-border/70 bg-background p-4">
                  <p className="text-xs text-muted-foreground">School name</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {schoolInfo.name || "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-border/70 bg-background p-4">
                  <p className="text-xs text-muted-foreground">
                    Registration number
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {schoolInfo.registration || "—"}
                  </p>
                </div>

                {(schoolInfo.area || schoolInfo.city || schoolInfo.pincode) && (
                  <div className="rounded-xl border border-border/70 bg-background p-4 sm:col-span-2">
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <MapPin className="size-4 text-muted-foreground" />
                      {[schoolInfo.area, schoolInfo.city, schoolInfo.pincode]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground sm:col-span-2">
                School profile not loaded.
              </p>
            )}
          </div>
        </div>

        {/* Camp selector */}
        <div className="grid gap-4 border-t border-border/70 pt-5 sm:grid-cols-[minmax(0,220px)_1fr]">
          <div>
            <p className="text-sm font-medium text-foreground">Select Camp</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Choose one of your assigned health camps.
            </p>
          </div>

          <div className="max-w-1/2">
            <ReusableSelect
              label="Camp"
              options={campOptions}
              value={selectedCampValue}
              onChange={setSelectedCampValue}
              placeholder={
                assignEventLoading ? "Loading camps..." : "Select a camp"
              }
              searchPlaceholder="Search camps"
              disabled={assignEventLoading}
            />

            {assignEventError ? (
              <p className="mt-1.5 text-xs text-destructive">
                Unable to load camps. Please retry.
              </p>
            ) : null}

            {!assignEventError &&
            !assignEventLoading &&
            campOptions.length <= 1 ? (
              <p className="mt-1.5 text-xs text-muted-foreground">
                No camps assigned yet.
              </p>
            ) : null}
          </div>
        </div>

        {/* Selected camp details */}
        <div className="border-t border-border/70 pt-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              Camp Information
            </p>

            {selectedCamp ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                <CheckCircle2 className="size-3.5" />
                {selectedCampName}
              </span>
            ) : (
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {selectedCampName}
              </span>
            )}
          </div>

          {selectedCamp ? (
            <CampDetailsCard
              camp={selectedCamp}
              variant="detailed"
              showLocation
              showRegistration
            />
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center">
              <Building2 className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                No camp selected
              </p>
              <p className="max-w-full text-xs text-muted-foreground">
                {assignEventLoading
                  ? "Loading your assigned camps…"
                  : "Select a camp above to see its date, school and location details."}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CampDetails;