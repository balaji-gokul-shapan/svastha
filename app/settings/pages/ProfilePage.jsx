"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

const SignatureField = dynamic(() => import("../components/SignatureField"), {
  ssr: false,
});
import ImageCropper from "@/components/imageCropper";
import { Input } from "@/components/ui/input";
import FormField from "../components/FormField";
import {
  Camera,
  Check,
  CircleUserRound,
  Edit2,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  Mail,
  Phone,
  RotateCcwKey,
  UserRound,
  UserRoundKey,
  X,
} from "lucide-react";
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
import { updateProfile } from "@/lib/features/registerStaffAccount";
import {
  deleteProfileImage,
  getProfileImage,
  uploadProfileImage,
} from "@/lib/features/profileImageRegister";
import { getDisplayProfileImageUrl } from "@/lib/profile-image-utils";
import {
  getDoctorSignature,
  removeDoctorSignature,
  saveDoctorSignature,
} from "@/lib/features/doctorSignatureSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import useAssignedEvents from "@/lib/useAssignedEvents";
import {
  getSignatureValue,
  normalizeSignatureUrl,
} from "@/lib/signature-utils";
import { selectAuthUser, selectUserAccount } from "@/lib/features/auth-slice";
import { toast } from "sonner";
import { changePasswordSchema } from "../validation/change-password-schema";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import Link from "next/link";
import ForgotPasswordFlow from "@/app/login/components/ForgotPasswordFlow";

// Pragmatic email shape check — catches typos and a missing "@" without
// attempting to out-parse RFC 5322.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const ProfilePage = ({
  profileImageFile,
  setProfileImageFile,
  profileInputRef,
  imagePreviewUrl,
  setImagePreviewUrl,
  name,
  username,
  password = "********",
  signature = "",
  onChange,
  phoneNumber,
  email,
}) => {
  const [imageError, setImageError] = useState("");
  const [showCropper, setShowCropper] = useState(false);
  const [isDeleteImageOpen, setIsDeleteImageOpen] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(selectAuthUser);
  const authAccount = useAppSelector(selectUserAccount);
  const doctorId = authUser?.id ?? authUser?.Id ?? null;
  const doctorSignatureState = useAppSelector((state) => state.doctorSignature);
  const profileImageState = useAppSelector((state) => state.profileImage);
  const [isSavingSignature, setIsSavingSignature] = useState(false);
  const [pendingSignature, setPendingSignature] = useState("");
  const [signatureTouched, setSignatureTouched] = useState(false);
  const { assignedEvents, assignEventLoading, assignEventError } =
    useAssignedEvents();
  const [signatureEventId, setSignatureEventId] = useState("");

  const roleValues = [
    authUser?.account_type,
    authUser?.role,
    authUser?.user_type_id,
    authUser?.userTypeId,
    authUser?.user_type,
    authUser?.user_type?.id,
    authUser?.user_type?.name,
    authAccount?.account_type,
    authAccount?.role,
    authAccount?.user_type_id,
    authAccount?.userTypeId,
    authAccount?.user_type,
    authAccount?.user_type?.id,
    authAccount?.user_type?.name,
  ];

  const isDoctorProfileRoute = roleValues.some((value) => {
    if (value == null) return false;
    if (typeof value === "number") return value === 5;
    const normalized = String(value).trim().toLowerCase();
    return normalized === "doctor" || normalized === "5";
  });

  const dispatchProfile = useCallback(
    (payload) => dispatch(updateProfile(payload)),
    [dispatch],
  );

  useEffect(() => {
    dispatch(getProfileImage());
  }, [dispatch]);

  const savedProfileImageUrl = getDisplayProfileImageUrl(profileImageState);

  const savedSignatureEventId = (() => {
    const source = doctorSignatureState?.signature ?? {};

    return String(source.event_id ?? source.eventId ?? "").trim();
  })();

  const resolvedSignatureEventId = signatureEventId || savedSignatureEventId;

  const savedSignatureImage = getSignatureValue(doctorSignatureState);
  const displayImageUrl = imagePreviewUrl || savedProfileImageUrl;
  useEffect(() => {
    // Doctor signature endpoints are role-scoped; other roles get a 401 there.
    if (!doctorId || !isDoctorProfileRoute) {
      return;
    }

    dispatch(getDoctorSignature(doctorId));
  }, [dispatch, doctorId, isDoctorProfileRoute]);

  useEffect(() => {
    const savedSignature = getSignatureValue(doctorSignatureState);

    if (!isDoctorProfileRoute) {
      return;
    }

    if (signatureTouched) {
      return;
    }

    if (!savedSignature) {
      return;
    }

    const normalizedSignature = normalizeSignatureUrl(savedSignature);

    if (normalizedSignature && normalizedSignature !== signature) {
      onChange?.("signature", normalizedSignature);
    }
  }, [
    doctorSignatureState,
    isDoctorProfileRoute,
    signatureTouched,
    signature,
    onChange,
  ]);

  const handleSignatureSave = (dataUrl, maybeField, maybeValue) => {
    const staged =
      typeof dataUrl === "string"
        ? dataUrl
        : typeof maybeValue === "string"
          ? maybeValue
          : "";

    setSignatureTouched(true);

    if (!staged) {
      // "Replace" clicked — drop the staged value silently. The
      // "create a signature" validation belongs to handleSubmit only.
      setPendingSignature("");
      onChange?.("signature", "");
      return;
    }

    setPendingSignature(staged);
    onChange?.("signature", staged);
  };

  const handleSignatureRemove = async () => {
    if (isSavingSignature) {
      return;
    }

    setSignatureTouched(true);
    setPendingSignature("");
    setIsSavingSignature(true);
    onChange?.("signature", "");

    if (!doctorId || !isDoctorProfileRoute) {
      setIsSavingSignature(false);
      return;
    }

    try {
      await dispatch(removeDoctorSignature(doctorId)).unwrap();
      toast.success("Signature removed successfully.");
    } catch (error) {
      const message =
        typeof error === "object" && error !== null
          ? error?.message || error?.detail || "Failed to remove signature."
          : error || "Failed to remove signature.";
      toast.error(message);
    } finally {
      setIsSavingSignature(false);
    }
  };

  // ---- Change Password dialog (dispatches `changePassword` thunk) ----
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

  /* ---- Forgot password (3-step security-question flow) ---- */
 
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const showForgotPassword = () => {
    // Leave any half-typed inline password edit so the dialog opens clean.
    cancelEditingPassword();
    resetPasswordDialog();
    setIsForgotOpen(true);
  };

  const handleForgotOpenChange = (open) => {
    setIsForgotOpen(open);
  };

  const maskedPhoneNumber = phoneNumber
    ? phoneNumber.replace(/.(?=.{4})/g, "*")
    : "";

  // ---- Inline name editing: pencil → text field → Save/Cancel ----
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  const startEditingName = () => {
    setNameDraft(String(name ?? ""));
    setIsEditingName(true);
  };

  const cancelEditingName = () => {
    setIsEditingName(false);
    setNameDraft("");
  };

  // const saveName = async () => {
  //   const trimmed = nameDraft.trim();

  //   if (!trimmed) {
  //     toast.error("Name is required.");
  //     return;
  //   }

  //   if (isSavingName) return;

  //   // Unchanged value — just close the editor.
  //   if (trimmed === String(name ?? "").trim()) {
  //     cancelEditingName();
  //     return;
  //   }

  //   try {
  //     setIsSavingName(true);
  //     await dispatch(updateProfile({ name: trimmed })).unwrap();

  //     // Sync the parent's settingsFormData so the header and the Profile
  //     // form field both pick up the new value (this also marks the field as
  //     // touched, so the auth re-sync effect won't overwrite it).
  //     onChange?.("name", trimmed);

  //     toast.success("Name updated successfully.");
  //     cancelEditingName();
  //   } catch (error) {
  //     const message =
  //       typeof error === "object" && error !== null
  //         ? error?.message || error?.detail || "Unable to update name."
  //         : error || "Unable to update name.";
  //     toast.error(message);
  //   } finally {
  //     setIsSavingName(false);
  //   }
  // };
  const saveName = () => {
    const trimmed = nameDraft.trim();

    if (!trimmed) {
      toast.error("Name is required.");
      return;
    }
    if (!(trimmed.length >= 3)) {
      toast.error("Name must be at least 3 characters.");
      return;
    }

    // Unchanged value — just close the editor.
    if (trimmed === String(name ?? "").trim()) {
      cancelEditingName();
      return;
    }

    onChange?.("name", trimmed);
    toast.success("Name updated successfully.");
    cancelEditingName();
  };

  const [isEditingPhoneNumber, setIsEditingPhoneNumber] = useState(false);
  const [phoneNumberDraft, setPhoneNumberDraft] = useState("");
  const [isSavingPhoneNumber, setIsSavingPhoneNumber] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordDraft, setPasswordDraft] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const startEditingPassword = () => {
    setPasswordDraft("");
    setIsEditingPassword(true);
  };

  const cancelEditingPassword = () => {
    setIsEditingPassword(false);
    setPasswordDraft("");
  };
  const savePassword = () => {
    const trimmed = passwordDraft.trim();

    if (!trimmed) {
      toast.error("Password is required.");
      return;
    }

    setPwNew(trimmed);
    setFormErrors({});
    cancelEditingPassword();
    setIsPasswordOpen(true);
  };

  // ---- Inline email editing: pencil -> text field -> Save/Cancel ----
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailDraft, setEmailDraft] = useState("");

  const startEditingEmail = () => {
    setEmailDraft(String(email ?? ""));
    setIsEditingEmail(true);
  };

  const cancelEditingEmail = () => {
    setIsEditingEmail(false);
    setEmailDraft("");
  };

  const saveEmail = () => {
    const trimmed = emailDraft.trim();

    if (!trimmed) {
      toast.error("Email is required.");
      return;
    }

    if (!EMAIL_PATTERN.test(trimmed)) {
      toast.error("Enter a valid email address.");
      return;
    }

    // Unchanged value — just close the editor.
    if (trimmed === String(email ?? "").trim()) {
      cancelEditingEmail();
      return;
    }

    onChange?.("email", trimmed);
    toast.success("Email updated successfully.");
    cancelEditingEmail();
  };

  const startEditingPhoneNumber = () => {
    setPhoneNumberDraft(String(phoneNumber ?? ""));
    setIsEditingPhoneNumber(true);
  };

  const cancelEditingPhoneNumber = () => {
    setIsEditingPhoneNumber(false);
    setPhoneNumberDraft("");
  };

  const savePhoneNumber = async () => {
    const trimmed = phoneNumberDraft.trim();
    const digits = phoneNumberDraft.replace(/\D/g, "");

    if (!digits) {
      toast.error("Phone number is required.");
      return;
    }

    if (digits.length < 7 || digits.length > 15) {
      toast.error("Phone number must be 7–15 digits.");
      return;
    }

    if (!trimmed) {
      toast.error("Phone number is required.");
      return;
    }

    if (isSavingPhoneNumber) return;

    // Unchanged value — just close the editor.
    if (trimmed === String(phoneNumber ?? "").trim()) {
      cancelEditingPhoneNumber();
      return;
    }
    onChange?.("phoneNumber", trimmed);

    toast.success("Phone number updated successfully.");
    cancelEditingPhoneNumber();
    // try {
    //   setIsSavingPhoneNumber(true);
    //   // Field name matches the backend convention used by sub-account/create.
    //   await dispatch(updateProfile({ phone_number: trimmed })).unwrap();

    //   // Sync the parent's settingsFormData so the masked display and the
    //   // Profile form field both pick up the new value.
    //   onChange?.("phoneNumber", trimmed);

    //   toast.success("Phone number updated successfully.");
    //   cancelEditingPhoneNumber();
    // } catch (error) {
    //   const message =
    //     typeof error === "object" && error !== null
    //       ? error?.message || error?.detail || "Unable to update phone number."
    //       : error || "Unable to update phone number.";
    //   toast.error(message);
    // } finally {
    //   setIsSavingPhoneNumber(false);
    // }
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

  const handleSubmit = async (event) => {
    event?.preventDefault?.();

    if (isSavingProfile || isSavingSignature) return;

    const trimmedName = String(name ?? "").trim();
    const trimmedPhoneNumber = String(phoneNumber ?? "").trim();
    const trimmedEmail = String(email ?? "").trim();

    if (isDoctorProfileRoute) {
      const stagedSignature = pendingSignature.startsWith("data:")
        ? pendingSignature
        : String(signature ?? "").trim();
      const hasPendingSignature = stagedSignature.startsWith("data:");

      if (!hasNewProfileImage && !hasPendingSignature) {
        toast.success("Profile is already up to date.");
        return;
      }

      setIsSavingProfile(hasNewProfileImage);
      setIsSavingSignature(hasPendingSignature);

      let imageSaved = false;
      try {
        if (hasNewProfileImage) {
          const imageError = await saveProfileImage();
          if (imageError) throw new Error(imageError);
          imageSaved = true;
        }

        if (hasPendingSignature) {
          if (!doctorId) {
            throw new Error(
              "Unable to save signature: doctor profile not loaded. Please reload the page and try again.",
            );
          }
          if (!resolvedSignatureEventId) {
            throw new Error("Please select a camp before saving the signature.");
          }

          await dispatch(
            saveDoctorSignature({
              doctorId,
              signature: stagedSignature,
              eventId: resolvedSignatureEventId,
            }),
          ).unwrap();
          setPendingSignature("");
          setSignatureTouched(false);
        }

        toast.success(
          hasPendingSignature && hasNewProfileImage
            ? "Profile image and signature updated."
            : hasPendingSignature
              ? "Signature updated successfully."
              : "Profile image updated successfully.",
        );
      } catch (error) {
        const message =
          typeof error === "object" && error !== null
            ? error?.message || error?.detail || "Failed to save signature."
            : error || "Failed to save signature.";
        toast.error(
          imageSaved
            ? `Profile image updated, but ${message}`
            : message,
        );
      } finally {
        setIsSavingProfile(false);
        setIsSavingSignature(false);
      }

      return;
    }

    // if (!trimmedName) {
    //   toast.error("Name is required.");
    //   return;
    // }

    // if (!trimmedPhoneNumber) {
    //   toast.error("Phone number is required.");
    //   return;
    // }
    // if (!trimmedEmail) {
    //   toast.error("Email is required.");
    //   return;
    // }

    const profilePayload = {
      name: trimmedName,
      // username: trimmedPhoneNumber,
      email: trimmedEmail,
      phone_number: trimmedPhoneNumber,
    };

    setIsSavingProfile(true);

    try {
      await dispatchProfile(profilePayload).unwrap();

      const imageError = await saveProfileImage();
      console.log(imageError,"imageError");
      
      if (imageError) {
        toast.error(`Profile updated, but ${imageError}`);
      } else {
        toast.success("Profile updated successfully.");
      }
    } catch (error) {
      const message =
        typeof error === "object" && error !== null
          ? error?.message || error?.detail || "Unable to update profile."
          : error || "Unable to update profile.";
      toast.error(message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const hasNewProfileImage =
    typeof Blob !== "undefined" && profileImageFile instanceof Blob;

  const saveProfileImage = async () => {
    if (!hasNewProfileImage) return null;

    try {
      await dispatch(uploadProfileImage({ image: profileImageFile })).unwrap();
      dispatch(getProfileImage());
      clearProfileImage();
      return null;
    } catch (error) {
      return typeof error === "object" && error !== null
        ? error?.message || error?.detail || "Profile image upload failed."
        : error || "Profile image upload failed.";
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

  const handleDeleteProfileImage = async () => {
    // Drop the staged file/preview first so the UI responds immediately.
    clearProfileImage();

    // Only hit the API when a photo is actually stored on the server.
    if (!savedProfileImageUrl) {
      setIsDeleteImageOpen(false);
      toast.success("Profile image removed.");
      return;
    }

    try {
      setIsDeletingImage(true);
      await dispatch(deleteProfileImage()).unwrap();
      setIsDeleteImageOpen(false);
      toast.success("Profile image removed.");
    } catch (error) {
      const message =
        typeof error === "object" && error !== null
          ? error?.message ||
            error?.detail ||
            "Unable to remove the profile image."
          : error || "Unable to remove the profile image.";
      toast.error(message);
    } finally {
      setIsDeletingImage(false);
    }
  };

  return (
    <article className="profile-settings-shell overflow-hidden rounded-2xl border border-border bg-card">
      <header className="profile-settings-heading relative overflow-hidden px-5 py-6 sm:px-7 sm:py-7">
        <div
          aria-hidden="true"
          className="profile-settings-heading__orb profile-settings-heading__orb--one"
        />
        <div
          aria-hidden="true"
          className="profile-settings-heading__orb profile-settings-heading__orb--two"
        />
        <div aria-hidden="true" className="profile-settings-heading__grid" />
        <div className="relative z-10 flex items-center gap-3">
          <span className="my-details-heading__icon flex size-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg shadow-primary/20 sm:size-16">
            <CircleUserRound className="size-6 text-white" aria-hidden="true" />
          </span>
          <div className="w-full">
            <p className="profile-settings-eyebrow">
              <span className="profile-settings-eyebrow__dot" />
              Account workspace
            </p>
            <h3 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Profile
            </h3>
            <p className="mt-1 max-w-2/3 text-sm leading-6 text-muted-foreground">
              Keep your identity, contact details, and professional signature in
              one place.
            </p>
          </div>
        </div>
      </header>

      {/* Profile Image */}
      <div className="profile-settings-identity p-4 sm:p-5 lg:p-6">
        <div className="flex w-full min-w-0 flex-col items-center gap-3 py-3 sm:flex-row sm:items-center sm:gap-6">
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={openProfilePicker}
              aria-label="Upload profile image"
              className="profile-settings-avatar group relative block size-24 overflow-hidden rounded-full bg-background transition-all sm:size-28 md:size-32"
            >
              {displayImageUrl ? (
                <Image
                  src={displayImageUrl}
                  alt="Profile preview"
                  onError={() =>
                    setImageError("Unable to load the profile image.")
                  }
                  className="size-full rounded-full object-cover"
                  width={128}
                  height={128}
                />
              ) : (
                <span className="flex size-full items-center justify-center text-muted-foreground">
                  <UserRound className="size-7 sm:size-8" />
                </span>
              )}

              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/50 text-background opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="size-5" />
              </span>
            </button>

            {(profileImageFile || savedProfileImageUrl) && (
              <button
                type="button"
                disabled={isDeletingImage}
                onClick={(e) => {
                  e.stopPropagation();
                  // A staged, not-yet-saved file clears locally; removing an
                  // already-saved photo hits the API, so confirm first.
                  if (savedProfileImageUrl) {
                    setIsDeleteImageOpen(true);
                    return;
                  }
                  clearProfileImage();
                }}
                aria-label="Remove profile image"
                className="absolute -right-1 -top-1 z-10 rounded-full bg-destructive p-1 text-destructive-foreground shadow disabled:opacity-60"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          <div className="profile-settings-identity__details min-w-0 text-center sm:text-left">
            <h2 className="truncate font-semibold text-foreground mb-2">
              {username || "No username"}
            </h2>

            <div className="grid grid-cols-2 gap-4 space-y-4">
              {isEditingName ? (
                <span className="mt-1 inline-flex w-full min-w-0 items-center gap-1.5">
                  <Input
                    autoFocus
                    value={nameDraft}
                    onChange={(event) => setNameDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        saveName();
                      } else if (event.key === "Escape") {
                        event.preventDefault();
                        cancelEditingName();
                      }
                    }}
                    disabled={isSavingName}
                    aria-label="Name"
                    className="h-7 w-full min-w-0 max-w-56 text-sm"
                  />

                  <Button
                    type="button"
                    size="xs"
                    onClick={saveName}
                    disabled={isSavingName}
                    aria-label="Save name"
                  >
                    {isSavingName ? "Saving…" : <Check className="size-4" />}
                  </Button>

                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    onClick={cancelEditingName}
                    disabled={isSavingName}
                    aria-label="Cancel name edit"
                  >
                    <X className="size-4" />
                  </Button>
                </span>
              ) : (
                <h4 className="mt-0 truncate text-muted-foreground flex flex-row items-center ">
                  <CircleUserRound className="size-4 mr-1 text-brand-blue" />
                  {name}{" "}
                  <Button
                    type="button"
                    variant="link"
                    size="xs"
                    className="text-xs font-medium text-primary hover:underline p-1"
                    onClick={startEditingName}
                    aria-label="Edit name"
                  >
                    <Edit2 className="size-3" />
                  </Button>
                </h4>
              )}
              {isEditingPhoneNumber ? (
                <span className="mt-1 inline-flex w-full min-w-0 items-center gap-1.5">
                  <Input
                    autoFocus
                    value={phoneNumberDraft}
                    onChange={(event) =>
                      setPhoneNumberDraft(event.target.value.replace(/\D/g, ""))
                    }
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={15}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        savePhoneNumber();
                      } else if (event.key === "Escape") {
                        event.preventDefault();
                        cancelEditingPhoneNumber();
                      }
                    }}
                    disabled={isSavingPhoneNumber}
                    aria-label="Phone number"
                    className="h-7 w-full min-w-0 max-w-56 text-sm"
                  />

                  <Button
                    type="button"
                    size="xs"
                    onClick={savePhoneNumber}
                    disabled={isSavingPhoneNumber}
                    aria-label="Save phone number"
                    // className={"p-1"}
                  >
                    {isSavingPhoneNumber ? (
                      "Saving…"
                    ) : (
                      <Check className="size-4" />
                    )}
                  </Button>

                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    onClick={cancelEditingPhoneNumber}
                    disabled={isSavingPhoneNumber}
                    aria-label="Cancel phone number edit"
                    // className={"p-1"}
                  >
                    <X className="size-4" />
                  </Button>
                </span>
              ) : (
                <h6 className="mt-0 truncate text-muted-foreground flex flex-row items-center">
                  <Phone className="size-4 mr-1 text-brand-green" />
                  {maskedPhoneNumber}
                  <Button
                    type="button"
                    variant="link"
                    size="xs"
                    className="text-xs font-medium text-primary hover:underline p-1"
                    onClick={startEditingPhoneNumber}
                  >
                    <Edit2 className="size-3" />
                  </Button>
                </h6>
              )}
              {isEditingEmail ? (
                <span className="mt-1 inline-flex w-full min-w-0 items-center gap-1.5">
                  <Input
                    type="email"
                    autoFocus
                    value={emailDraft}
                    onChange={(event) => setEmailDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        saveEmail();
                      } else if (event.key === "Escape") {
                        event.preventDefault();
                        cancelEditingEmail();
                      }
                    }}
                    aria-label="Email"
                    placeholder="name@example.com"
                    className="h-7 w-full min-w-0 max-w-72 text-sm"
                  />

                  <Button
                    type="button"
                    size="xs"
                    onClick={saveEmail}
                    aria-label="Save email"
                  >
                    <Check className="size-4" />
                  </Button>

                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    onClick={cancelEditingEmail}
                    aria-label="Cancel email edit"
                  >
                    <X className="size-4" />
                  </Button>
                </span>
              ) : (
                <h6 className="mt-0 truncate text-muted-foreground flex flex-row items-center">
                  <Mail className="size-4 mr-1 text-info" />
                  {email || "Not added"}
                  <Button
                    type="button"
                    variant="link"
                    size="xs"
                    className="text-xs font-medium text-primary hover:underline p-1"
                    onClick={startEditingEmail}
                    aria-label="Edit email"
                  >
                    <Edit2 className="size-3" />
                  </Button>
                </h6>
              )}
              {isEditingPassword ? (
                <span className="mt-1 inline-flex w-full min-w-0 items-center gap-1.5">
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoFocus
                    value={passwordDraft}
                    onChange={(event) => setPasswordDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        savePassword();
                      } else if (event.key === "Escape") {
                        event.preventDefault();
                        cancelEditingPassword();
                      }
                    }}
                    aria-label="Password"
                    className="h-7 w-full min-w-0 max-w-56 text-sm"
                  />

                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    // className="p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>

                  <Button
                    type="button"
                    size="xs"
                    onClick={savePassword}
                    aria-label="Save password"
                    // className={"p-1"}
                  >
                    <Check className="size-4" />
                  </Button>

                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    onClick={cancelEditingPassword}
                    aria-label="Cancel password edit"
                    // className={"p-1"}
                  >
                    <X className="size-4" />
                  </Button>
                </span>
              ) : (
                <h6 className="mt-0 truncate text-muted-foreground flex flex-row items-center">
                  <UserRoundKey className="size-4 mr-1 text-info" />
                  {"********"}
                  <Button
                    type="button"
                    variant="link"
                    size="xs"
                    className="text-xs font-medium text-primary hover:underline p-1"
                    onClick={startEditingPassword}
                  >
                    <Edit2 className="size-3" />
                  </Button>
                </h6>
              )}

              {/* <button
                  type="button"
                  onClick={() => {
                    cancelEditingPassword();
                    resetPasswordDialog();
                    setIsPasswordOpen(true);
                  }}
                  className="p-1 text-xs inline-flex items-center font-medium text-primary hover:underline"
                >
                  <RotateCcwKey className="mr-1 size-4 text-info" />
                 <span className="text-xs font-medium text-primary">Forgot Password?</span>
                </button> */}
                <button
              type="button"
              onClick={showForgotPassword}
              className="flex w-full items-center justify-end gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <KeyRound className="size-3.5" aria-hidden="true" />
              Forgot password?
            </button>
            </div>
          </div>
        </div>
        <p className="profile-settings-photo-hint text-xs font-medium text-foreground">
          {profileImageFile ? null : "Profile Photo (optional)"}
          {profileImageFile ? null : (
            <>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-4 cursor-help text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Click the avatar to upload · JPG, PNG, or WEBP up to 5 MB
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </p>

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

        {imageError && <p className="text-xs text-destructive">{imageError}</p>}
      </div>

      <form
        id="profile-form"
        noValidate
        onSubmit={handleSubmit}
        className="profile-settings-form mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {/* <FormField
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
        /> */}

        {/* <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
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
        </div> */}
      </form>

      {isDoctorProfileRoute && (
        <section className="profile-settings-signature mx-4 mt-6 rounded-2xl border border-border p-4 sm:mx-6 sm:p-5 lg:mx-8">
          <SignatureField
            value={signature || normalizeSignatureUrl(savedSignatureImage)}
            onChange={handleSignatureSave}
            onRemove={handleSignatureRemove}
            isPrimary={true}
            assignedEvents={assignedEvents}
            selectedEventId={resolvedSignatureEventId}
            onEventChange={setSignatureEventId}
            isEventsLoading={assignEventLoading}
            eventsError={assignEventError}
            isBusy={isSavingSignature || doctorSignatureState?.loading}
          />
        </section>
      )}

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
      <div className="profile-settings-actions mt-5 flex flex-col-reverse gap-2 border-t border-border p-4 sm:flex-row sm:justify-end sm:px-6 lg:p-4">
        <Button
          type="button"
          className="h-10 rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="profile-form"
          disabled={
            isSavingProfile || isSavingSignature || profileImageState?.loading
          }
          className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {isSavingProfile || isSavingSignature || profileImageState?.loading
            ? "Saving..."
            : "Save Changes"}
        </Button>
      </div>

      {/* ================================
          Remove Profile Photo Modal
      ================================= */}
      <Dialog open={isDeleteImageOpen} onOpenChange={setIsDeleteImageOpen}>
        <DialogContent className="w-full max-w-full sm:max-w-2/3">
          <DialogHeader className="pb-4">
            <DialogTitle>Remove profile photo?</DialogTitle>
            <DialogDescription>
              This deletes the profile image saved on your account. You can
              upload a new one at any time.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteImageOpen(false)}
              disabled={isDeletingImage}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteProfileImage}
              disabled={isDeletingImage}
            >
              {isDeletingImage ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================
          Change Password Modal
      ================================= */}
      <Dialog open={isPasswordOpen} onOpenChange={handlePasswordOpenChange}>
        <DialogContent className="w-full max-w-full sm:max-w-1/2">
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
                formErrors?.current_password ? "border-destructive" : undefined
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
                formErrors?.new_password ? "border-destructive" : undefined
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
            {/* Strength of the password being CHOSEN (not the current one). */}
            <PasswordStrengthMeter password={pwNew} />
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
                formErrors?.confirm_password ? "border-destructive" : undefined
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

      {/* ---- Forgot password: the same 3-step recovery flow as the login
          page, shown here as a dialog so the rest of the profile stays put. */}
      <Dialog open={isForgotOpen} onOpenChange={handleForgotOpenChange}>
        <DialogContent className="w-full max-w-full sm:max-w-[92%] md:max-w-[80%] lg:max-w-[42%]">
          <DialogHeader className="sr-only">
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              Recover access using your security questions.
            </DialogDescription>
          </DialogHeader>

          <ForgotPasswordFlow
            onCancel={() => handleForgotOpenChange(false)}
          />
        </DialogContent>
      </Dialog>
    </article>
  );
};

export default ProfilePage;
