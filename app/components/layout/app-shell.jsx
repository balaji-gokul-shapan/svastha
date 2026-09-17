"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";

import { AppBreadcrumb } from "./app-breadcrumb";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const CHROMELESS_ROUTES = ["/login", "/register"];

export function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useSelector(
    (state) => state.auth?.isAuthenticated === true,
  );
  const [authChecked, setAuthChecked] = React.useState(false);
  const hideChrome = CHROMELESS_ROUTES.some((route) => pathname?.startsWith(route));

  React.useEffect(() => {
    if (hideChrome) {
      setAuthChecked(true);
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    setAuthChecked(true);
  }, [hideChrome, isAuthenticated, router]);

  if (hideChrome) {
    return <main className="min-h-screen">{children}</main>
  }

  if (!authChecked) {
    return <main className="min-h-screen" />;
  }

  return (
    <SidebarProvider className="min-h-screen bg-background">
      <Sidebar />

      {/*
       * Mobile only: opens the off-canvas sidebar sheet.
       */}
      <SidebarTrigger className="fixed left-3 top-4 z-50 md:hidden" />

      <div className="flex  flex-1 flex-col">
        <Navbar title="Dashboard" />
        <AppBreadcrumb />
        <main className="flex-1 p-4 py-1.5 sm:px-6">{children}</main>
      </div>
    </SidebarProvider>
  );
}