"use client";

import React, { useState } from "react";
import ImageCropper from "@/components/imageCropper";
import { Input } from "@/components/ui/input";
import FormField from "../components/FormField";
import { Camera, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProfilePage = ({
  profileImageFile,
  setProfileImageFile,
  profileInputRef,
  imagePreviewUrl,
  setImagePreviewUrl,
  name,
  setName,
  username,
  setUsername,
  password,
  setPassword,
}) => {
  const [imageError, setImageError] = useState("");
  const [showCropper, setShowCropper] = useState(false);

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

        <button
          type="button"
          onClick={openProfilePicker}
          aria-label="Upload profile image"
          className="group relative size-20 shrink-0 rounded-full border border-dashed border-foreground/25 bg-background transition-colors hover:border-primary/50"
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
          onChange={setName}
        />

        <FormField
          id="username"
          label="Username"
          placeholder="Enter your username"
          value={username}
          onChange={setUsername}
        />

        <FormField
          id="password"
          label="Password"
          placeholder="Enter your password"
          type="password"
          value={password}
          onChange={setPassword}
        />
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
    </article>
  );
};

export default ProfilePage;
