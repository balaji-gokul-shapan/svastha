"use client";

import * as React from "react";

import RegisterForm from "./Pages/RegisterForm";
import SideRays from "../components/ui/SideRays";
import DotField from "../components/ui/DotField";

// Public registration page — mirrors app/login/page.jsx.
export default function RegisterPage() {
  return (
    <>
      <section className="relative isolate flex h-screen w-full items-center justify-center overflow-hidden">
        <div className="relative h-full w-full">
          <DotField
            dotRadius={3}
            dotSpacing={34}
            bulgeStrength={27}
            glowRadius={0}
            sparkle={false}
            waveAmplitude={0}
            cursorRadius={500}
            cursorForce={0.1}
            bulgeOnly
            gradientFrom="#5CC4F7"
            gradientTo="#6EDC8C"
            glowColor="#120F17"
          />
          <div className="absolute inset-0 z-10 flex items-center justify-center px-4 md:px-12 lg:pr-24">
            <RegisterForm />
          </div>
        </div>
      </section>
    </>
  );
}
