
const IMAGE_URL_KEYS = [
  "image_url",
  "profile_image",
  "imageUrl",
  "profileImage",
  "image",
  "url",
  "path",
  "photo",
  "avatar",
];

// Walk a response object and pull the first usable image string from it.
const pickImageUrl = (source) => {
  if (typeof source === "string") {
    return source.trim();
  }

  if (!source || typeof source !== "object") {
    return "";
  }

  for (const key of IMAGE_URL_KEYS) {
    const found = pickImageUrl(source[key]);

    if (found) {
      return found;
    }
  }

  return "";
};

export const getProfileImageValue = (profileImageState) => {
  if (!profileImageState) {
    return "";
  }

  return (
    pickImageUrl(profileImageState.profileImage) ||
    pickImageUrl(profileImageState.data) ||
    ""
  );
};

const getApiBaseUrl = () =>
  (
    process.env.NEXT_PUBLIC_API_URL ||
    "https://svasthadev-api.sms24hrs.org/api/v1"
  ).replace(/\/+$/, "");

export const normalizeProfileImageUrl = (value) => {
  if (!value || typeof value !== "string") {
    return "";
  }

  const url = value.trim();

  if (!url) {
    return "";
  }

  // Base64 image data URLs render as-is.
  if (url.startsWith("data:image/")) {
    return url;
  }

  // Local blob previews render as-is.
  if (url.startsWith("blob:")) {
    return url;
  }

  // Already a complete URL.
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const apiBaseUrl = getApiBaseUrl();

  // Relative API/backend path.
  if (url.startsWith("/")) {
    return `${apiBaseUrl}${url}`;
  }

  return `${apiBaseUrl}/${url}`;
};

/** Convenience: slice state → ready-to-render <img src>. */
export const getDisplayProfileImageUrl = (profileImageState) =>
  normalizeProfileImageUrl(getProfileImageValue(profileImageState));
