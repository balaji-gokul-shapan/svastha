"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";

import { store } from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";
import { GlobalLoader } from "@/components/ui/global-loader";
import { AppearanceWatcher } from "@/app/components/layout/AppearanceWatcher";
import { RoleGuard } from "@/app/components/layout/role-guard";
import {
  scheduleProactiveRefresh,
  cancelProactiveRefresh,
} from "../lib/auth-utils";

export function Providers({ children }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // Initialize proactive token refresh when the app loads.
  React.useEffect(() => {
    const dispatch = store.dispatch;
    scheduleProactiveRefresh(60, dispatch);

    // Re-schedule on window focus (in case the user was idle on another tab).
    const handleFocus = () => {
      scheduleProactiveRefresh(60, dispatch);
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      cancelProactiveRefresh();
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppearanceWatcher />
        <RoleGuard>{children}</RoleGuard>
        <GlobalLoader />
        <Toaster position="top-right" richColors headless />
      </QueryClientProvider>
    </Provider>
  );
}
