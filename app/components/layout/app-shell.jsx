"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import { FullScreenLoader } from "@/components/ui/global-loader";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { clearAuthSession } from "@/lib/features/auth-slice";

import { AppBreadcrumb } from "./app-breadcrumb";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import { AnimatePresence, motion } from "framer-motion";

const CHROMELESS_ROUTES = ["/login", "/register"];

const subscribeNoop = () => () => {};

export function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state) => state.auth?.isAuthenticated === true,
  );
  // Settings → Appearance → Sidebar position. Defaults to "side" so the rail is
  // unchanged until the doctor explicitly picks "top".
  const sidebarPosition = useSelector(
    (state) => state.appearanceSettings?.sidebarPosition ?? "side",
  );
  const isTopNav = sidebarPosition === "top";
  const hideChrome = CHROMELESS_ROUTES.some((route) => pathname?.startsWith(route));

  // "Are we on the client?" without a setState-in-effect: the server snapshot is
  // false so the server render and the hydrating render agree on the loader,
  // then React switches to the client snapshot and the real UI mounts.
  const isClient = React.useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  React.useEffect(() => {
    if (hideChrome || isAuthenticated) {
      return;
    }

    dispatch(clearAuthSession());
    router.replace("/login");
  }, [dispatch, hideChrome, isAuthenticated, router]);

  if (hideChrome) {
    return <main className="min-h-screen">{children}</main>;
  }

  if (!isClient || !isAuthenticated) {
    return (
      <FullScreenLoader
        label={isAuthenticated ? "Loading your dashboard...!" : "Please wait, We are getting things ready...!"}
        imageSrc="/GIFs/loader.gif"
      />
    );
  }

  const content = (
    <>
      <Navbar title="Dashboard" sticky={!isTopNav} />
      <AppBreadcrumb />
      <main className="min-w-0 flex-1 p-4 py-1.5 sm:px-6">
        {/* Animate the incoming page immediately while removing the outgoing
            page from layout so it cannot delay or shift the new content. */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={pathname ?? "initial"}
            initial={{ opacity: 0, x: 20, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{
              opacity: { duration: 0.3, ease: "easeOut" },
              x: { duration: 0.34, ease: [0.22, 0.61, 0.36, 1] },
              y: { duration: 0.34, ease: [0.22, 0.61, 0.36, 1] },
            }}
            style={{ willChange: "transform, opacity" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );

  return (
    <SidebarProvider className="min-h-screen bg-background">
      {isTopNav ? (
        <div className="flex min-w-0 flex-1 flex-col">
          <TopNav />
          {content}
        </div>
      ) : (
        <>
          <Sidebar />

          {/*
           * Mobile only: opens the off-canvas sheet. The TopNav has no sheet of
           * its own, so this trigger is hidden in that mode.
           */}
          <SidebarTrigger className="fixed left-3 top-4 z-50 md:hidden" />

          {/*
           * `min-w-0` is required here: this is a flex child of the sidebar row,
           * so without it the column keeps `min-width: auto` and any wide child
           * (e.g. a data table on mobile) stretches the whole page instead of
           * scrolling inside its own container.
           */}
          <motion.div
            className="flex min-w-0 flex-1 flex-col"
            layout="position"
            initial={true}
            transition={{
              type: "spring",
              stiffness: 240,
              damping: 32,
              mass: 0.8,
            }}
          >
            {content}
          </motion.div>
        </>
      )}
    </SidebarProvider>
  );
}