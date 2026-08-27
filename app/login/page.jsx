"use client";

import * as React from "react";

import LoginForm from "./Pages/LoginForm";
import SideRays from "../components/ui/SideRays";
export default function LoginPage() {
  return (
    <>
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
          <div className="absolute inset-0 z-10 flex items-center justify-center px-4 md:justify-end md:px-12 lg:pr-24">
            <LoginForm />
          </div>
        </div>
      </section>
    </>
  );
}
