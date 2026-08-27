"use client";

import { Bell, ChevronDown, LogOut, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthSession } from "@/lib/features/auth-slice";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ThemeToggle } from "./themeToggle";

export function Navbar({ title = "Dashboard" }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth?.user);
  console.log(authUser,"authUser");
  

  const displayName = authUser?.label || authUser?.username || "Guest";
  const userInitials = displayName
    .split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "S";
  const signedInRole = authUser?.role || "User";

  const handleLogout = () => {
    dispatch(clearAuthSession());
    router.push("/login");
  };

  const handleSetting = () => {
    router.push("/settings")
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-none border-border bg-background/80 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 sm:px-6">
      {/* <h1 className="font-display text-lg font-semibold text-foreground sm:text-xl">
        {title}
      </h1> */}

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search students, staff, records…"
            className="h-9 w-56 rounded-md border border-border bg-muted/50 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30 lg:w-72"
          />
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Bell className="size-4" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-accent" />
        </button>

        <ThemeToggle />

        <Popover className="relative z-50">
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex flex-row items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition hover:scale-105 hover:bg-accent/70 hover:text-accent-foreground"
            >
              <div suppressHydrationWarning className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {userInitials}
              </div>
              <p suppressHydrationWarning className="hidden md:block">{displayName}</p>
              <ChevronDown className="size-4 text-muted-foreground" />
            </button>
          </PopoverTrigger>

          <PopoverContent align="end" className="z-70 w-56 p-2">
            <div onClick={handleSetting} className="mb-2 border-b border-border px-2 pb-2 cursor-pointer">
              <p suppressHydrationWarning className="text-sm font-semibold text-foreground">{displayName}</p>
              <p suppressHydrationWarning className="text-xs text-muted-foreground">{signedInRole} account</p>
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-4" />
              Logout
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
