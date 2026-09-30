"use client";

import React from "react";
import Image from "next/image";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import {
  Activity,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
} from "lucide-react";

import LoginForm from "./Pages/LoginForm";
import BrandVideo from "./components/BrandVideo";

/* ==========================================================================
   PAGE
   ========================================================================== */

const HIGHLIGHTS = [
  { Icon: Stethoscope, label: "General health checkups", tone: "physical" },
  { Icon: Activity, label: "Vision & hearing screening", tone: "vision" },
  { Icon: HeartPulse, label: "Cardiac and oral care", tone: "hearing" },
  { Icon: Syringe, label: "Immunisation tracking", tone: "oral" },
  { Icon: ShieldCheck, label: "Role-based data access", tone: "immunization" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ==========================================================================
   INFINITE HIGHLIGHT SWIPER.
   ========================================================================== */

/* Must stay in sync with .login-swiper__slide in globals.css:
   card width 12.5rem + margin-right 0.5rem = 13rem. */
const ITEM_WIDTH = 208; // 13rem
const AUTOPLAY_MS = 3800;
const COPIES = 3;

function HighlightSlide({ item, isActive }) {
  const { Icon, label, tone } = item;

  return (
    <div
      className={`login-swiper__slide login-tone--${tone}${
        isActive ? " login-swiper__slide--active" : ""
      }`}
    >
      <div className="login-feature w-full">
        <span className="login-feature__dot">
          <Icon className="size-3.5" aria-hidden="true" />
        </span>
        {label}
      </div>
    </div>
  );
}

function HighlightSwiper() {
  const count = HIGHLIGHTS.length;
  const reduceMotion = useReducedMotion();

  // Virtual index: ranges over 0..(COPIES*count)-1 but is only ever allowed to
  // rest inside the middle copy, which is where the viewport is positioned.
  const [index, setIndex] = React.useState(count);
  const [paused, setPaused] = React.useState(false);

  // The track offset lives in a motion value rather than React state so a drag
  // can write to it every frame without re-rendering the component per frame.
  const x = useMotionValue(-count * ITEM_WIDTH);

  const active = index - count; // always 0..count-1 while resting

  const spring = React.useMemo(
    () =>
      reduceMotion
        ? { duration: 0 }
        : { type: "spring", stiffness: 260, damping: 32, mass: 0.7 },
    [reduceMotion],
  );

  // Fold any virtual index back into the middle copy. 0 and COPIES*count are
  // both valid, and both render the same slide, so the fold is seamless.
  const wrapIndex = React.useCallback(
    (raw) => ((raw % count) + count) % count,
    [count],
  );

  // Mirrors `index` so the autoplay interval and pointer handlers always read
  // the current value without having to be re-created on every step.
  const indexRef = React.useRef(index);
  React.useEffect(() => {
    indexRef.current = index;
  }, [index]);

  // Move to a virtual index and spring the track to the matching offset.
  const moveTo = React.useCallback(
    (target) => {
      const wrapped = count + wrapIndex(target - count);
      indexRef.current = wrapped;
      setIndex(wrapped);
      animate(x, -wrapped * ITEM_WIDTH, spring);
    },
    [count, spring, wrapIndex, x],
  );

  const step = React.useCallback(
    (delta) => moveTo(indexRef.current + delta),
    [moveTo],
  );

  // Autoplay — suspended on hover/focus/drag and under reduced motion.
  React.useEffect(() => {
    if (paused || reduceMotion) return undefined;
    const timer = setInterval(() => step(1), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, reduceMotion, step]);

  const onKeyDown = (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
  };

  // Leading copy is inert; the window and trailing copy are decorative repeats
  // of real content, so only the middle copy is exposed to assistive tech.
  const track = Array.from({ length: COPIES }, (_, copy) =>
    HIGHLIGHTS.map((item, i) => ({ item, i, copy })),
  ).flat();

  return (
    <motion.div
      className="w-full"
      variants={fadeUp}
      initial="hidden"
      animate="show"
      custom={2}
    >
      <div
        className="login-swiper"
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="Platform highlights"
        onKeyDown={onKeyDown}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <motion.ul
          className="login-swiper__track"
          style={{ x }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.16}
          onDragStart={() => setPaused(true)}
          onDragEnd={(_, info) => {
            setPaused(false);
            const travelled = info.offset.x;
            const offsetIndex = Math.round(-travelled / ITEM_WIDTH);
            // A short flick that rounds to zero still advances one card, so
            // the carousel never feels stuck; anything smaller snaps back.
            const delta =
              offsetIndex !== 0
                ? offsetIndex
                : Math.abs(travelled) > 24
                  ? -Math.sign(travelled)
                  : 0;
            moveTo(wrapIndex(index + delta));
          }}
        >
          {track.map(({ item, i, copy }) => (
            <li
              key={`${copy}-${i}-${item.label}`}
              className="list-none"
              aria-hidden={copy === 0 ? "true" : undefined}
            >
              <HighlightSlide
                item={item}
                isActive={copy === 1 && i === active}
              />
            </li>
          ))}
        </motion.ul>
      </div>

      {/* Progress rail — also acts as direct navigation. */}
      <div className="login-swiper__rail">
        {HIGHLIGHTS.map((item, i) => (
          <button
            key={item.label}
            type="button"
            className={`login-swiper__pip login-tone--${item.tone}${
              i === active ? " login-swiper__pip--active" : ""
            }`}
            aria-label={`Show ${item.label}`}
            aria-current={i === active}
            onClick={() => {
              setPaused(true);
              moveTo(count + i);
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <section className="login-shell flex min-h-svh flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      {/* Concentric pulse rings, then drifting colour blobs, then dot texture —
          painted back to front. */}
      <div className="login-rings" aria-hidden="true" />
      <div className="login-aurora login-aurora--blue" aria-hidden="true" />
      <div className="login-aurora login-aurora--green" aria-hidden="true" />
      <div className="login-aurora login-aurora--violet" aria-hidden="true" />
      <div className="login-grid" aria-hidden="true" />

      <div className="login-stage">
        {/* LEFT: brand panel, hidden below 900px since it is decorative. */}
        <div className="login-brand">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="Svastha Logo" width={30} height={30} />
            <div>
              <p className="login-wordmark">
                Svas<em>t</em>ha
              </p>
              <p className="login-tagline">
                {" "}
                Healthy Roots{" "}
                <span className="text-brand-green">Rising Stars</span>
              </p>

              {/* <p className="login-tagline">Healthy Roots Rising Stars</p> */}
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <span className="login-eyebrow">
              <Sparkles className="size-3" aria-hidden="true" />
              Student Health Platform
            </span>

            <div className="w-full max-w-[320px]">
              <BrandVideo />
            </div>
          </div>

          <HighlightSwiper />
        </div>

        {/* RIGHT: the form. Logic untouched, only the panel is new. */}
        <div className="login-form-side">
          <LoginForm />
        </div>
      </div>
    </section>
  );
}
