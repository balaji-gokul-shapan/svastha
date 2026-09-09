"use client";

import { useMemo, useRef, useState } from "react";
import {
  Activity,
  Camera,
  CheckCircle2,
  Circle,
  Clock,
  Fingerprint,
  Mail,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { CompletenessRing } from "../components/CompletenessRing";
import { ActivitySparkline } from "../components/ActivitySparkline";
import { PasswordStrengthMeter, scorePassword } from "../components/PasswordStrengthMeter";

// import { CompletenessRing } from "@/components/profile/completeness-ring";
// import { ActivitySparkline } from "@/components/profile/activity-sparkline";
// import { PasswordStrengthMeter, scorePassword } from "@/components/profile/password-strength-meter";

function FormField({ id, label, placeholder, type = "text", value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
      />
    </div>
  );
}

// Mock recent login activity — replace with real data from your API.
const ACTIVITY_DATA = [1, 0, 2, 1, 3, 2, 4];

const SECURITY_ITEMS = [
  { key: "email", label: "Email verified", done: true },
  { key: "password", label: "Strong password", check: "password" },
  { key: "2fa", label: "Two-factor authentication", done: false },
];

export default function OverAllPreview({ profileImageFile, setProfileImageFile}) {
  console.log();
  
  const profileInputRef = useRef(null);
  // const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imageError, setImageError] = useState("");

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const clearProfileImage = () => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setProfileImageFile(null);
    setImagePreviewUrl("");
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

    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setProfileImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  // Profile completeness — computed live from the four fields that
  // actually matter here (photo, name, username, a password set).
  const completeness = useMemo(() => {
    const checks = [Boolean(profileImageFile), Boolean(name.trim()), Boolean(username.trim()), Boolean(password)];
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }, [profileImageFile, name, username, password]);

  const passwordStrong = scorePassword(password).score >= 3;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground">
          Update your personal details and contact information.
        </p>
      </div>

      {/* HERO */}
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto]">
        <article className="flex flex-wrap items-center gap-5 rounded-lg border border-border bg-card p-5">
          <button
            type="button"
            onClick={openProfilePicker}
            aria-label="Upload profile image"
            className="group relative size-20 shrink-0 rounded-full border border-dashed border-foreground/25 bg-background transition-colors hover:border-primary/50"
          >
            {imagePreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreviewUrl} alt="Profile preview" className="size-full rounded-full object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center text-muted-foreground">
                <UserRound className="size-8" />
              </span>
            )}
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/50 text-background opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="size-5" />
            </span>
            {profileImageFile && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  clearProfileImage();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    clearProfileImage();
                  }
                }}
                aria-label="Remove selected profile image"
                className="absolute right-0 top-0 rounded-full bg-destructive p-1 text-destructive-foreground shadow"
              >
                <X className="size-3" />
              </span>
            )}
          </button>
          <input
            ref={profileInputRef}
            id="profile-image-upload"
            type="file"
            accept="image/*"
            onChange={handleProfileImageUpload}
            className="hidden"
          />

          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-foreground">{name || "Your name"}</p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-3.5" />
              {username ? `${username}@svastha.app` : "Add a username to see your handle"}
            </p>
            {imageError && <p className="mt-1 text-xs text-destructive">{imageError}</p>}
          </div>
        </article>

        <article className="flex items-center gap-3 rounded-lg border border-border bg-card p-5">
          <CompletenessRing percent={completeness} />
          <div>
            <p className="text-xs text-muted-foreground">Profile</p>
            <p className="text-sm font-semibold text-foreground">Completeness</p>
          </div>
        </article>

        <article className="flex items-center gap-3 rounded-lg border border-border bg-card p-5">
          <span className="flex size-11 items-center justify-center rounded-full bg-success/10 text-success">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">Account Status</p>
            <p className="text-sm font-semibold text-success">Active</p>
          </div>
        </article>
      </div>

      {/* ACTIVITY + SECURITY */}
      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Login Activity</h3>
            </div>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              Last 7 days
            </span>
          </div>
          <div className="mt-4">
            <ActivitySparkline data={ACTIVITY_DATA} />
          </div>
        </article>

        <article className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Fingerprint className="size-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Security Checklist</h3>
          </div>
          <div className="mt-3 space-y-2">
            {SECURITY_ITEMS.map((item) => {
              const done = item.check === "password" ? passwordStrong : item.done;
              return (
                <div key={item.key} className="flex items-center gap-2.5 text-sm">
                  {done ? (
                    <CheckCircle2 className="size-4 shrink-0 text-success" />
                  ) : (
                    <Circle className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className={done ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
                </div>
              );
            })}
          </div>
        </article>
      </div>

      {/* EDIT FORM */}
      <article className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground">Edit Details</h3>
        <form className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField id="name" label="Name" placeholder="Enter your name" value={name} onChange={setName} />
          <FormField id="username" label="Username" placeholder="Enter your username" value={username} onChange={setUsername} />
          <div className="space-y-1.5">
            <FormField
              id="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
              value={password}
              onChange={setPassword}
            />
            <PasswordStrengthMeter password={password} />
          </div>
        </form>

        <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
          <button type="button" className="h-10 rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Cancel
          </button>
          <button type="submit" className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Save Changes
          </button>
        </div>
      </article>
    </section>
  );
}