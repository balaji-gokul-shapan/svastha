"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Camera,
  Clock,
  Fingerprint,
  KeyRound,
  Mail,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { getRoleLabel, useAuthRole } from "@/lib/user-role";
import { CompletenessRing } from "../components/CompletenessRing";
import FormField from "../components/FormField";
import { LoginActivity } from "../components/LoginActivity";
import { DeviceSession } from "../components/DeviceSession";
import { AccountAccess } from "../components/AccountAccess";

export default function MyDetailsPage({
  profileImageFile,
  setProfileImageFile,
  name,
  username,
  password,
  onChange,
}) {
  const profileInputRef = useRef(null);
  const [imageError, setImageError] = useState("");

  // Role as a string ("admin" | "school" | "school_sub_account" | "doctor" | …).
  const role = useAuthRole();
  const roleLabel = getRoleLabel(role);

  // Preview URLs follow the parent-owned file so this module also reflects a
  // photo selected elsewhere in Settings. Revoke each object URL when it is
  // replaced or when this module unmounts.
  const imagePreviewUrl = useMemo(
    () => (profileImageFile ? URL.createObjectURL(profileImageFile) : ""),
    [profileImageFile],
  );

  useEffect(
    () => () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    },
    [imagePreviewUrl],
  );

  const clearProfileImage = () => {
    setProfileImageFile(null); // effect cleanup revokes the stale URL
    if (profileInputRef.current) profileInputRef.current.value = "";
  };

  const openProfilePicker = () => profileInputRef.current?.click();

  const handleProfileImageUpload = (event) => {
    const file = event.target.files?.[0];
    setImageError("");

    if (!file) {
      clearProfileImage();
      return;
    }
    if (!file.type.startsWith("image/")) {
      setImageError("Please choose a valid image file.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Profile image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setProfileImageFile(file); // useEffect above regenerates the preview
  };

  // Profile completeness — computed live from the four fields that
  // actually matter here (photo, name, username, a password set).
  const completeness = useMemo(() => {
    const checks = [
      Boolean(profileImageFile),
      Boolean(name?.trim()),
      Boolean(username?.trim()),
      Boolean(password),
    ];
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }, [profileImageFile, name, username, password]);

  return (
    <section className="my-details-shell space-y-5">
      <header className="my-details-heading overflow-hidden rounded-2xl border border-border p-4 sm:p-6">
        <div className="my-details-heading__grid" aria-hidden="true" />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="my-details-heading__icon flex size-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg shadow-primary/20 sm:size-16">
              <UserRound className="size-7" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="my-details-eyebrow">
                <span className="my-details-eyebrow__dot" />
                Personal workspace
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                My details
              </h2>
              <p className="mt-1 max-w-2/3 text-sm leading-6 text-muted-foreground sm:text-base">
                Keep your profile current and review your account security at a glance.
              </p>
            </div>
          </div>

          {roleLabel ? (
            <div className="my-details-status inline-flex items-center gap-2 self-start rounded-full px-3 py-2 text-sm font-semibold sm:self-auto">
              <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
              {roleLabel}
            </div>
          ) : null}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(230px,0.55fr)_minmax(230px,0.55fr)]">
        {/* CONTAINER query, not a viewport one. This card is a grid column that
            is only ~1.45fr wide at lg, so on a 1280px screen it is ~500px — yet
            the old `sm:` rule keyed off the 640px VIEWPORT and forced a cramped
            row. The card must respond to its OWN width.

            `@container` sits on a WRAPPER deliberately: a container query
            resolves against the nearest ANCESTOR container, so putting it on the
            <article> itself would measure the grid track, not this card. */}
        <div className="@container">
          <article className="my-details-identity flex h-full flex-col items-center gap-5 rounded-2xl border border-border bg-card p-4 text-center @md:flex-row @md:items-center @md:gap-6 @md:p-5 @md:text-left">
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={openProfilePicker}
                aria-label="Upload profile image"
                className="my-details-avatar group block size-24 overflow-hidden rounded-full border border-dashed border-primary/30 bg-muted/30 transition-all @md:size-28"
              >
                {imagePreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreviewUrl} alt="Profile preview" className="size-full object-cover" />
                ) : (
                  <span className="flex size-full items-center justify-center text-muted-foreground transition-colors group-hover:text-primary">
                    <UserRound className="size-10" />
                  </span>
                )}
              </button>
              <span className="my-details-avatar__badge" aria-hidden="true">
                <Camera className="size-3.5" />
              </span>
              <input
                ref={profileInputRef}
                id="profile-image-upload"
                type="file"
                accept="image/*"
                onChange={handleProfileImageUpload}
                className="hidden"
              />
            </div>

            {/* min-w-0 lets the truncate/wrap below actually shrink instead of
                forcing the flex row wider than the card. */}
            <div className="w-full min-w-0">
              <p className="my-details-label">Profile identity</p>
              <h3 className="truncate text-xl font-semibold tracking-tight text-foreground">
                {name || "Your name"}
              </h3>

              <p className="mt-1 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-sm text-muted-foreground @md:justify-start">
                <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="min-w-0 break-all">
                  {username ? `${username}@svastha.app` : "Add a username to see your handle"}
                </span>
              </p>
              {imageError ? <p className="mt-2 text-xs font-medium text-destructive">{imageError}</p> : null}
              <div className="mt-4 flex flex-col gap-2 @xs:flex-row @xs:flex-wrap @md:justify-start">
                <button
                  type="button"
                  onClick={openProfilePicker}
                  className="my-details-action w-full @xs:w-auto"
                >
                  <Camera className="size-3.5" />
                  {profileImageFile ? "Replace photo" : "Add photo"}
                </button>
                {profileImageFile ? (
                  <button type="button" onClick={clearProfileImage} className="my-details-action my-details-action--quiet w-full @xs:w-auto">
                    <X className="size-3.5" />
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        </div>

        <article className="my-details-metric my-details-metric--primary flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
          <CompletenessRing percent={completeness} />
          <div>
            <p className="my-details-label">Profile completeness</p>
            <p className="text-lg font-semibold text-foreground">Looking good</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Complete your profile for a smoother experience.</p>
          </div>
        </article>

        <article className="my-details-metric my-details-metric--success flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
          <span className="my-details-metric__icon flex size-11 shrink-0 items-center justify-center rounded-2xl bg-success/10 text-success">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <p className="my-details-label">Account status</p>
            <p className="text-lg font-semibold text-success">Active</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Your account is in good standing.</p>
          </div>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="my-details-panel my-details-panel--activity overflow-hidden rounded-2xl border border-border bg-card">
          <div className="my-details-panel__header">
            <div className="my-details-panel__heading">
              <span className="my-details-panel__icon my-details-panel__icon--blue">
                <Activity className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="my-details-label">Account pulse</p>
                <h3 className="my-details-panel__title">Login activity</h3>
              </div>
            </div>
            <span className="my-details-period">
              <Clock className="size-3.5" aria-hidden="true" />
              Last 5 sign-ins
            </span>
          </div>
          <LoginActivity />
        </article>

        <article className="my-details-panel my-details-panel--security overflow-hidden rounded-2xl border border-border bg-card">
          <div className="my-details-panel__header">
            <div className="my-details-panel__heading">
              <span className="my-details-panel__icon my-details-panel__icon--green">
                <Fingerprint className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="my-details-label">This session</p>
                <h3 className="my-details-panel__title">Device &amp; session</h3>
              </div>
            </div>
          </div>
          <DeviceSession />
        </article>
      </div>

      <article className="my-details-panel my-details-panel--access overflow-hidden rounded-2xl border border-border bg-card">
        <div className="my-details-panel__header">
          <div className="my-details-panel__heading">
            <span className="my-details-panel__icon my-details-panel__icon--green">
              <KeyRound className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="my-details-label">Identity &amp; access</p>
              <h3 className="my-details-panel__title">Account details</h3>
            </div>
          </div>
          <span className="my-details-period">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            {roleLabel || "Your account"}
          </span>
        </div>
        <AccountAccess />
      </article>
    </section>
  );
}
