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
  fallbackRatio = "8 / 12",
  aspectRatio,

  fit = "contain",
}) {
  const videoRef = useRef(null);
  const [measuredRatio, setMeasuredRatio] = useState(null);


  useEffect(() => {
    const video = videoRef.current;
    if (!video || !autoPlay) return;

    const attempt = video.play();

    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(() => {

      });
    }
  }, [autoPlay, src]);

  return (
    <div className={`relative w-full overflow-hidden ${className}`.trim()}>
      <video
        ref={videoRef}
        className={`block h-auto w-full ${FIT_CLASS[fit] ?? FIT_CLASS.contain}`}

        style={{ aspectRatio: aspectRatio ?? measuredRatio ?? fallbackRatio }}
        autoPlay={autoPlay}
        loop
        muted
        defaultMuted
        playsInline

        controls={false}
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        // Some engines still skip the first frame at 0s; nudging past it makes
        // the animation actually start.
        onLoadedMetadata={(event) => {
          const video = event.currentTarget;

          if (video.videoWidth && video.videoHeight) {
            setMeasuredRatio(`${video.videoWidth} / ${video.videoHeight}`);
          }

          if (video.currentTime === 0) video.currentTime = 0.01;
        }}
        onError={(event) => {

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