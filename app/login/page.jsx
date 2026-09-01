// "use client";

// import * as React from "react";

// import LoginForm from "./Pages/LoginForm";
// export default function LoginPage() {
//   return (
//     <>
//       <section className="relative isolate flex h-screen w-full items-center justify-center overflow-hidden">
//         <div className="relative h-full w-full">
//           <SideRays
//             speed={2.5}
//             rayColor1="#EAB308"
//             rayColor2="#96c8ff"
//             intensity={2}
//             spread={2}
//             origin="top-right"
//             tilt={0}
//             saturation={1.5}
//             blend={0.75}
//             falloff={1.6}
//             opacity={1}
//             className="absolute inset-0 h-full w-full"
//           />
//           <div className="absolute inset-0 z-10 flex items-center justify-center px-4 md:justify-end md:px-12 lg:pr-24">
//             <LoginForm />
//           </div>
//         </div>
//       </section>
//     </>
//   );
// }

// "use client";

// import Image from "next/image";
// import { motion } from "framer-motion";
// import {
//   ArrowRight,
//   Ear,
//   Eye,
//   HeartPulse,
//   ShieldCheck,
//   Stethoscope,
//   Syringe,
// } from "lucide-react";
// import SideRays from "../components/ui/SideRays";

// // Adjust this path to wherever LoginForm.jsx actually lives in your
// // project — this import is the ONLY connection to it. The component
// // itself is completely untouched: same useDispatch/useRouter, same
// // handleSubmit, same safeNext redirect logic, same error/success states.
// import LoginForm from "./Pages/LoginForm";

// /* =========================================================
//    ORBIT ANIMATION — same fixed + responsive version as before:
//    each OrbitItem's radius matches its OrbitRing exactly (so icons
//    travel ON the ring line), and everything is sized in cqw (container
//    query width units) so the whole orbit scales as one proportional
//    unit at any container size, no breakpoints needed.
//    ========================================================= */

// function OrbitRing({ radius }) {
//   return (
//     <div
//       className="absolute left-1/2 top-1/2 rounded-full border border-border/60"
//       style={{
//         width: `${radius * 2}cqw`,
//         height: `${radius * 2}cqw`,
//         marginLeft: `${-radius}cqw`,
//         marginTop: `${-radius}cqw`,
//       }}
//     />
//   );
// }

// function OrbitItem({
//   children,
//   radius,
//   duration,
//   angle = 0,
//   reverse = false,
//   size = 6,
//   toneClass,
// }) {
//   return (
//     <motion.div
//       className="absolute left-1/2 top-1/2"
//       style={{
//         width: `${radius * 2}cqw`,
//         height: `${radius * 2}cqw`,
//         marginLeft: `${-radius}cqw`,
//         marginTop: `${-radius}cqw`,
//       }}
//       initial={{ rotate: angle }}
//       animate={{ rotate: angle + (reverse ? -360 : 360) }}
//       transition={{ duration, repeat: Infinity, ease: "linear" }}
//     >
//       <motion.div
//         className={`absolute flex items-center justify-center rounded-full border-[1.5px] border-current bg-card shadow-sm ${toneClass}`}
//         style={{
//           width: `${size}cqw`,
//           height: `${size}cqw`,
//           left: `${radius * 2 - size / 2}cqw`,
//           top: `${radius - size / 2}cqw`,
//         }}
//         initial={{ rotate: -angle }}
//         animate={{ rotate: -angle + (reverse ? 360 : -360) }}
//         transition={{ duration, repeat: Infinity, ease: "linear" }}
//       >
//         {children}
//       </motion.div>
//     </motion.div>
//   );
// }

// function OrbitVisual() {
//   return (
//     <div
//       className="relative mx-auto aspect-square w-full max-w-[380px]"
//       style={{ containerType: "inline-size" }}
//     >
//       <OrbitRing radius={22} />
//       <OrbitRing radius={33} />
//       <OrbitRing radius={45} />

//       <OrbitItem
//         radius={22}
//         duration={14}
//         angle={0}
//         size={9}
//         toneClass="text-info"
//       >
//         <Eye style={{ width: "4.5cqw", height: "4.5cqw" }} />
//       </OrbitItem>
//       <OrbitItem
//         radius={22}
//         duration={14}
//         angle={190}
//         size={9}
//         toneClass="text-destructive"
//       >
//         <HeartPulse style={{ width: "4.5cqw", height: "4.5cqw" }} />
//       </OrbitItem>

//       <OrbitItem
//         radius={33}
//         duration={20}
//         angle={90}
//         reverse
//         size={10}
//         toneClass="text-success"
//       >
//         <Stethoscope style={{ width: "5cqw", height: "5cqw" }} />
//       </OrbitItem>
//       <OrbitItem
//         radius={33}
//         duration={20}
//         angle={300}
//         reverse
//         size={10}
//         toneClass="text-warning"
//       >
//         <Ear style={{ width: "5cqw", height: "5cqw" }} />
//       </OrbitItem>

//       <OrbitItem
//         radius={45}
//         duration={28}
//         angle={150}
//         size={11}
//         toneClass="text-primary"
//       >
//         <Syringe style={{ width: "5.5cqw", height: "5.5cqw" }} />
//       </OrbitItem>
//       <OrbitItem
//         radius={45}
//         duration={28}
//         angle={340}
//         size={8}
//         toneClass="text-brand-green"
//       >
//         <ShieldCheck style={{ width: "4cqw", height: "4cqw" }} />
//       </OrbitItem>

//       {/* Center — static */}
//       <div className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary shadow-lg">
//         <Image
//           src="/logo.svg"
//           alt="Svastha"
//           width={32}
//           height={32}
//           className="brightness-0 invert"
//         />
//       </div>
//     </div>
//   );
// }

// /* =========================================================
//    PAGE
//    ========================================================= */

// export default function LoginPage() {
//   return (
//     <section className="relative isolate flex h-screen w-full items-center justify-center overflow-hidden">
//       <div className="relative h-full w-full">
//         <SideRays
//           speed={2.5}
//           rayColor1="#EAB308"
//           rayColor2="#96c8ff"
//           intensity={2}
//           spread={2}
//           origin="top-right"
//           tilt={0}
//           saturation={1.5}
//           blend={0.75}
//           falloff={1.6}
//           opacity={1}
//           className="absolute inset-0 h-full w-full"
//         />
//         {/* LEFT — orbit visual, hidden below lg since it's decorative and
//             the form alone carries mobile layout */}
//         <div className="absolute inset-0 z-10 flex items-center justify-center px-4 md:px-12 lg:pr-24">
//           <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary/5 to-transparent p-8 lg:flex">
//             <div className="flex items-center gap-2">
//               <Image
//                 src="/logo.svg"
//                 alt="Svastha Logo"
//                 width={28}
//                 height={28}
//               />
//               <span className="font-sf text-lg font-semibold text-brand-blue">
//                 Svas<span className="text-brand-green">t</span>ha
//               </span>
//             </div>

//             <OrbitVisual />

//             <div className="rounded-2xl border border-border bg-background/80 p-5 backdrop-blur">
//               <p className="text-sm font-semibold text-foreground">
//                 Every screening, one health record per student.
//               </p>
//               <a
//                 href="#"
//                 className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-brand-blue"
//               >
//                 See what's new
//                 <ArrowRight className="size-3.5" />
//               </a>
//             </div>
//           </div>

//           {/* RIGHT — LoginForm, unmodified logic, only the wrapping panel is new */}
//           <div className="relative flex items-center justify-center p-6 sm:p-10">
//             <LoginForm />
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import LoginForm from "./Pages/LoginForm";
import SideRays from "../components/ui/SideRays";


function OrbitRing({ radius }) {
  return (
    <div
      className="absolute left-1/2 top-1/2 rounded-full border border-border/80"
      style={{
        width: `${radius * 2}cqw`,
        height: `${radius * 2}cqw`,
        marginLeft: `${-radius}cqw`,
        marginTop: `${-radius}cqw`,
      }}
    />
  );
}

function OrbitItem({
  children,
  radius,
  duration,
  angle = 0,
  reverse = false,
  size = 6,
  toneClass,
}) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{
        width: `${radius * 2}cqw`,
        height: `${radius * 2}cqw`,
        marginLeft: `${-radius}cqw`,
        marginTop: `${-radius}cqw`,
      }}
      initial={{ rotate: angle }}
      animate={{ rotate: angle + (reverse ? -360 : 360) }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      <motion.div
        className={`absolute flex items-center justify-center rounded-full border-[1.5px] border-current bg-card shadow-sm ${toneClass}`}
        style={{
          width: `${size}cqw`,
          height: `${size}cqw`,
          left: `${radius * 2 - size / 2}cqw`,
          top: `${radius - size / 2}cqw`,
        }}
        initial={{ rotate: -angle }}
        animate={{ rotate: -angle + (reverse ? 360 : -360) }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function OrbitVisual() {
  return (
    <div
      className="relative mx-auto aspect-square w-full"
      style={{ containerType: "inline-size" }}
    >
      <OrbitRing radius={22} />
      <OrbitRing radius={33} />
      <OrbitRing radius={45} />

      {/* Orbit icons — custom artwork from public/login/images. Rendered with
          <img> because the files carry their own baked-in colors; the chip's
          toneClass still colors the ring border via border-current. */}
      <OrbitItem
        radius={22}
        duration={14}
        angle={0}
        size={11}
        toneClass="text-info"
      >
        <img
          src="/login/images/vision.svg"
          alt=""
          draggable={false}
          className="object-contain"
          style={{ width: "8cqw", height: "8cqw" }}
        />
      </OrbitItem>
      <OrbitItem
        radius={22}
        duration={14}
        angle={190}
        size={11}
        toneClass="text-success"
      >
        <img
          src="/login/images/cardiac.svg"
          alt=""
          draggable={false}
          className="object-contain"
          style={{ width: "10cqw", height: "10cqw" }}
        />
      </OrbitItem>

      <OrbitItem
        radius={33}
        duration={20}
        angle={90}
        reverse
        size={11}
        toneClass="text-info"
      >
        <img
          src="/login/images/general.svg"
          alt=""
          draggable={false}
          className="object-contain"
          style={{ width: "8cqw", height: "8cqw" }}
        />
      </OrbitItem>
      <OrbitItem
        radius={33}
        duration={20}
        angle={300}
        reverse
        size={11}
        toneClass="text-success"
      >
        <img
          src="/login/images/hearing.svg"
          alt=""
          draggable={false}
          className="object-contain"
          style={{ width: "15cqw", height: "15cqw" }}
        />
      </OrbitItem>

      <OrbitItem
        radius={45}
        duration={28}
        angle={150}
        size={11}
        toneClass="text-info"
      >
        <img
          src="/login/images/immunization.svg"
          alt=""
          draggable={false}
          className="object-contain"
          style={{ width: "8cqw", height: "8cqw" }}
        />
      </OrbitItem>
      <OrbitItem
        radius={45}
        duration={28}
        angle={340}
        size={11}
        toneClass="text-success"
      >
        <img
          src="/login/images/dental.svg"
          alt=""
          draggable={false}
          className="object-contain"
          style={{ width: "15cqw", height: "15cqw" }}
        />
      </OrbitItem>

      {/* Center — static */}
      <div className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary shadow-lg">
        <Image
          src="/logo.svg"
          alt="Svastha"
          width={32}
          height={32}
          className="brightness-0 invert"
        />
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
   ========================================================= */

export default function LoginPage() {
  return (
    <section className="relative isolate flex h-screen w-full items-center justify-center overflow-hidden">
      <div className="relative h-full w-full">
        <SideRays
          speed={2.5}
          rayColor1="#EAB308"
          rayColor2="#96c8ff"
          intensity={2}
          spread={2}
          origin="top-right"
          tilt={0}
          saturation={1.5}
          blend={0.75}
          falloff={1.6}
          opacity={1}
          className="absolute inset-0 h-full w-full"
        />
        {/* <div className="absolute inset-0 z-10 flex items-center justify-center px-4 md:justify-end md:px-12 lg:pr-24">
             <LoginForm />
           </div> */}
        <div className="absolute inset-0 z-10 flex items-center justify-center px-4 md:justify-end md:px-12 lg:pr-24">
          {/* <LoginForm /> */}
          <section className="relative isolate flex h-screen w-full items-center justify-center overflow-hidden">
            <div className="relative h-full w-full">
              <div className="flex min-h-screen items-center justify-center  p-4">
<div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl md:grid-cols-2">
                  {/* LEFT — orbit visual, hidden below lg since it's decorative and
            the form alone carries mobile layout */}
<div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary/5 to-transparent p-8 md:flex">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/logo.svg"
                        alt="Svastha Logo"
                        width={28}
                        height={28}
                      />
                      <span className="font-sf text-lg font-semibold text-brand-blue">
                        Svas<span className="text-brand-green">t</span>ha
                      </span>
                    </div>

                    <OrbitVisual />

                    <div className="rounded-2xl border border-border bg-background/80 p-5 backdrop-blur my-4">
                      <p className="text-sm font-semibold text-foreground">
                        {/* Every screening, one health record per student. */}
                        One Portal, Complete student health, all in one place.
                      </p>
                      <a
                        href="#"
                        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-brand-blue"
                      >
                        See what's new
                        <ArrowRight className="size-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* RIGHT — LoginForm, unmodified logic, only the wrapping panel is new */}
                  <div className="relative flex items-center justify-center p-6 sm:p-10">
                    <LoginForm />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
