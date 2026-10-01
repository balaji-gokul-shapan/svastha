"use client";

import { useEffect, useRef, useState } from "react";

/* Tailwind utility for the `fit` prop. `contain` (the default) letterboxes a
   video whose ratio differs from its box; `cover` fills the box and crops the
   overflow instead. */
const FIT_CLASS = {
  contain: "object-contain",
  cover: "object-cover",
  fill: "object-fill",
};

/**
 * BRAND VIDEO
 * -----------
 * The dentist animation that replaces the old OrbitVisual on the login page.
 */
export default function BrandVideo({
  // NOTE: the file lives in public/GIFs/, so the served URL is "/GIFs/...".
  src = "/GIFs/dentistWaving.mp4",
  className = "",
  autoPlay = true,
  // Placeholder ratio used only until the real dimensions are known, so the
  // panel does not collapse to zero height while loading. Defaults to this
  // asset's ratio (720x1280 -> 9 / 16) so there is no jump when metadata lands.
  fallbackRatio = "8 / 12",
  aspectRatio,
  // `object-fit` for the video: "contain" (default) never crops, "cover" fills
  // a forced box ratio and crops, "fill" stretches.
  fit = "contain",
}) {
  const videoRef = useRef(null);
  // null until `loadedmetadata`; see the handler on the <video> below.
  const [measuredRatio, setMeasuredRatio] = useState(null);

  /**
   * `autoPlay` alone is not reliable across browsers, especially for a file
   * served fresh. Calling play() explicitly and swallowing the rejection means
   * the attempt is retried by the browser rather than silently failing.
   */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !autoPlay) return;

    const attempt = video.play();

    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(() => {
        // Blocked by policy or low-power mode. Nothing to do here: `controls`
        // is off by design, so the onError handler below is the only signal
        // that the source itself could not be used.
      });
    }
  }, [autoPlay, src]);

  return (
    <div className={`relative w-full overflow-hidden ${className}`.trim()}>
      <video
        ref={videoRef}
        className={`block h-auto w-full ${FIT_CLASS[fit] ?? FIT_CLASS.contain}`}
        // Explicit ratio wins; otherwise the one measured from the file when
        // its metadata loads; otherwise the placeholder that keeps the panel
        // from collapsing to zero height while the video is loading.
        style={{ aspectRatio: aspectRatio ?? measuredRatio ?? fallbackRatio }}
        autoPlay={autoPlay}
        loop
        muted
        defaultMuted
        playsInline
        // (`playsInline` above is the modern, spec-blessed replacement for the
        // legacy `webkit-playsinline` attribute, which React no longer wants.)
        controls={false}
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        // Some engines still skip the first frame at 0s; nudging past it makes
        // the animation actually start.
        onLoadedMetadata={(event) => {
          const video = event.currentTarget;
          // The real dimensions, so a portrait file is not letterboxed into a
          // strip by the placeholder ratio (this asset is 720x1280).
          if (video.videoWidth && video.videoHeight) {
            setMeasuredRatio(`${video.videoWidth} / ${video.videoHeight}`);
          }

          if (video.currentTime === 0) video.currentTime = 0.01;
        }}
        onError={(event) => {
          // A missing file, a 404, or an HTML page served in place of the video
          // (which is exactly what a middleware redirect to /login produces)
          // arrives here as MediaError 4, MEDIA_ERR_SRC_NOT_SUPPORTED — and
          // with no poster the panel just stays blank, so say it out loud.
          if (process.env.NODE_ENV !== "production") {
            console.warn(
              "[BrandVideo] source could not be played",
              src,
              event.currentTarget.error?.code,
            );
          }
        }}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}