"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { AppBreadcrumb } from "./app-breadcrumb";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

const CHROMELESS_ROUTES = ["/login"];

export function AppShell({ children }) {
  const pathname = usePathname();
  const hideChrome = CHROMELESS_ROUTES.some((route) => pathname?.startsWith(route));

  if (hideChrome) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex  flex-1 flex-col">
        <Navbar title="Dashboard" />
        <AppBreadcrumb />
        <main className="flex-1 p-4 py-1.5 sm:px-6">{children}</main>
      </div>
    </div>
  );
}