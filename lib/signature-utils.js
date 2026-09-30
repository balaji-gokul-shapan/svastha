// Shared signature URL helpers: resolve every backend shape to a displayable
// string. Handles:
// - doctorSignatureState.signature / .data wrappers
// - url / signatureUrl / signature_url / image / signature
// - data:image/... and blob: URLs
// - http(s) URLs
// - relative API/backend paths (resolved against the API base)
// - invalid / non-string values (mapped to "")
const pickSignatureUrl = (source) => {
  if (!source || typeof source !== "object") return "";

  return (
    source.url ??
    source.signatureUrl ??
    source.signature_url ??
    source.image ??
    source.signature ??
    ""
  );
};

export const getSignatureValue = (doctorSignatureState) => {
  if (!doctorSignatureState || typeof doctorSignatureState !== "object") {
    return "";
  }

  return (
    pickSignatureUrl(doctorSignatureState.signature) ||
    pickSignatureUrl(doctorSignatureState.data) ||
    ""
  );
};

const getApiBaseUrl = () =>
  (
    process.env.NEXT_PUBLIC_API_URL ||
    "https://svasthadev-api.sms24hrs.org/api/v1"
  ).replace(/\/+$/, "");

export const normalizeSignatureUrl = (value) => {
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
