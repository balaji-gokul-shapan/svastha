"use client";

import React, { useState } from "react";
import ImageCropper from "@/components/imageCropper";
import { Input } from "@/components/ui/input";
import FormField from "../components/FormField";
import { Camera, Eye, EyeOff, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordStrengthMeter } from "../components/PasswordStrengthMeter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { changePassword } from "@/lib/features/changePasswordSlice";
import { useAppDispatch } from "@/lib/hooks";
import { toast } from "sonner";
import { changePasswordSchema } from "../validation/change-password-schema";

const ProfilePage = ({
  profileImageFile,
  setProfileImageFile,
  profileInputRef,
  imagePreviewUrl,
  setImagePreviewUrl,
  name,
  username,
  password,
  onChange,
}) => {
  const [imageError, setImageError] = useState("");
  const [showCropper, setShowCropper] = useState(false);

  // ---- Change Password dialog (dispatches `changePassword` thunk) ----
  const dispatch = useAppDispatch();
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  // { fieldName: "message" } — populated when zod validation fails.
  const [formErrors, setFormErrors] = useState({});

  const resetPasswordDialog = () => {
    setPwCurrent("");
    setPwNew("");
    setPwConfirm("");
    setFormErrors({});
    setPwSubmitting(false);
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const handlePasswordOpenChange = (open) => {
    setIsPasswordOpen(open);
    if (!open) {
      resetPasswordDialog();
    }
  };

  const handleChangePassword = async () => {
    if (pwSubmitting) return;

    const formValues = {
      current_password: pwCurrent,
      new_password: pwNew,
      confirm_password: pwConfirm,
    };

    const result = changePasswordSchema.safeParse(formValues);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;

      // Reduce to { fieldName: firstMessage } for inline display.
      const firstPerField = Object.fromEntries(
        Object.entries(errors)
          .map(([field, messages]) => [field, messages?.[0]])
          .filter(([, message]) => Boolean(message)),
      );

      setFormErrors(firstPerField);

      const firstError = Object.values(firstPerField).find(Boolean);
      toast.error(firstError || "Please fill all required fields.");

      return;
    }

    setFormErrors({});

    try {
      setPwSubmitting(true);
      await dispatch(
        changePassword({
          current_password: pwCurrent,
          new_password: pwNew,
          confirm_password: pwConfirm,
        }),
      ).unwrap();

      setPwSubmitting(false);
      toast.success("Password updated successfully.");
      // Briefly keep the dialog open to show the toast, then close it.
      window.setTimeout(() => {
        setIsPasswordOpen(false);
        resetPasswordDialog();
      }, 900);
    } catch (error) {
      setPwSubmitting(false);
      const message =
        typeof error === "object" && error !== null
          ? error?.message || error?.detail || "Unable to change password."
          : error || "Unable to change password.";
      toast.error(message);
    }
  };

  const openProfilePicker = () => {
    profileInputRef.current?.click();
  };

  const handleProfileImageUpload = (event) => {
    const file = event.target.files?.[0];

    setImageError("");

    if (!file) return;

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

    // Remove previous preview URL
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);

    setProfileImageFile(file);
    setImagePreviewUrl(previewUrl);

    // Open cropper
    setShowCropper(true);

    // Allow selecting the same file again
    event.target.value = "";
  };

  const handleCroppedImage = (croppedFile) => {
    // Remove original image preview
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    const croppedUrl = URL.createObjectURL(croppedFile);

    setProfileImageFile(croppedFile);
    setImagePreviewUrl(croppedUrl);
  };

  const clearProfileImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    setProfileImageFile(null);
    setImagePreviewUrl("");
    setShowCropper(false);
    setImageError("");

    if (profileInputRef.current) {
      profileInputRef.current.value = "";
    }
  };

  return (
    <article className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <h3 className="text-lg font-semibold text-foreground">Profile</h3>

      <p className="mt-1 text-sm text-muted-foreground">
        Update your personal details and contact information.
      </p>

      {/* Profile Image */}
      <div className="flex flex-col items-center gap-3 p-5">
        <p className="text-sm font-medium text-foreground">
          {profileImageFile
            ? "Profile photo selected"
            : "Profile Photo (optional)"}
        </p>

        <div className="relative inline-block shrink-0">
          <button
            type="button"
            onClick={openProfilePicker}
            aria-label="Upload profile image"
            className="group relative block size-20 overflow-hidden rounded-full border border-dashed border-foreground/25 bg-background transition-colors hover:border-primary/50"
          >
            {imagePreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagePreviewUrl}
                alt="Profile preview"
                className="size-full rounded-full object-cover"
              />
            ) : (
              <span className="flex size-full items-center justify-center text-muted-foreground">
                <UserRound className="size-8" />
              </span>
            )}
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/50 text-background opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="size-5" />
            </span>
          </button>

          {/* Remove — outside the overflow-hidden circle so it isn't clipped */}
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
              className="absolute -right-1 -top-1 z-10 rounded-full bg-destructive p-1 text-destructive-foreground shadow"
            >
              <X className="size-3" />
            </span>
          )}
        </div>

        {/* Hidden file input */}
        <Input
          ref={profileInputRef}
          id="profile-image-upload"
          name="profileImage"
          type="file"
          accept="image/*"
          onChange={handleProfileImageUpload}
          className="hidden"
        />

        <p className="text-center text-xs text-muted-foreground">
          Click the avatar to upload · JPG, PNG, or WEBP up to 5 MB
        </p>

        {imageError && <p className="text-xs text-destructive">{imageError}</p>}
      </div>

      {/* Profile Form */}
      <form className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FormField
          id="name"
          label="Name"
          placeholder="Enter your name"
          value={name}
          name="name"
          onChange={(value) => onChange("name", value)}
        />

        <FormField
          id="username"
          label="Username"
          placeholder="Enter your username"
          value={username}
          name="username"
          onChange={(value) => onChange("username", value)}
        />

        <div className="flex flex-col gap-4">
          <div className="flex-flex-col-gap-4">
            <FormField
              id="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
              name="password"
              value={password}
              onChange={(value) => onChange("password", value)}
            />
            <Button
              type="button"
              variant="link"
              size="sm"
              className="text-xs font-medium text-primary hover:underline"
              onClick={() => handlePasswordOpenChange(true)}
            >
              Change Password
            </Button>
          </div>
          
        </div>
      </form>

      {/* Reusable Image Cropper */}
      <ImageCropper
        image={imagePreviewUrl}
        open={showCropper}
        onClose={() => setShowCropper(false)}
        onCrop={handleCroppedImage}
        aspect={1}
        cropShape="round"
        title="Adjust Profile Photo"
        description="Drag the image and adjust the zoom."
      />
      <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
        <Button
          type="button"
          className="h-10 rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Save Changes
        </Button>
      </div>

      {/* ================================
          Change Password Modal
      ================================= */}
      <Dialog open={isPasswordOpen} onOpenChange={handlePasswordOpenChange}>
        <DialogContent className="w-full max-w-1/2">
          <DialogHeader className="pb-4">
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>

          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              handleChangePassword();
            }}
            className="space-y-4"
          >
            <FormField
              id="current-password"
              label="Current Password"
              placeholder="Enter your current password"
              value={pwCurrent}
              name="current_password"
              type={showCurrent ? "text" : "password"}
              onChange={(value) => setPwCurrent(value)}
              inputClassName={
                formErrors?.current_password
                  ? "border-destructive"
                  : undefined
              }
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowCurrent((prev) => !prev)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={showCurrent ? "Hide password" : "Show password"}
                >
                  {showCurrent ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              }
            />
            <PasswordStrengthMeter password={pwCurrent} />
            {formErrors?.current_password && (
              <p className="text-xs text-destructive">
                {formErrors.current_password}
              </p>
            )}

            <FormField
              id="new-password"
              label="New Password"
              type={showNew ? "text" : "password"}
              value={pwNew}
              onChange={(value) => setPwNew(value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              required
              inputClassName={
                formErrors?.new_password
                  ? "border-destructive"
                  : undefined
              }
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowNew((prev) => !prev)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              }
            />
            {formErrors?.new_password && (
              <p className="text-xs text-destructive">
                {formErrors.new_password}
              </p>
            )}

            <FormField
              id="confirm-password"
              label="Confirm New Password"
              type={showConfirm ? "text" : "password"}
              value={pwConfirm}
              onChange={(value) => setPwConfirm(value)}
              placeholder="Re-enter new password"
              autoComplete="new-password"
              required
              inputClassName={
                formErrors?.confirm_password
                  ? "border-destructive"
                  : undefined
              }
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              }
            />
            {formErrors?.confirm_password && (
              <p className="text-xs text-destructive">
                {formErrors.confirm_password}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handlePasswordOpenChange(false)}
                disabled={pwSubmitting}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={pwSubmitting}>
                {pwSubmitting ? "Updating..." : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </article>
  );
};

export default ProfilePage;
