"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

import Image from "next/image";

import { cn } from "@/lib/utils";
import { useAuthRole } from "@/lib/user-role";

import {
  BOTTOM_NAV_ITEMS,
  NAV_ITEMS,
  filterItemsByRole,
  isRouteActive,
} from "./nav-items";

export function TopNav() {
  const pathname = usePathname();
  const getRole = useAuthRole();
  const [openMenu, setOpenMenu] = React.useState(null);
  const barRef = React.useRef(null);

  const primaryItems = React.useMemo(
    () => filterItemsByRole(NAV_ITEMS, getRole),
    [getRole],
  );

  const bottomItems = React.useMemo(
    () => filterItemsByRole(BOTTOM_NAV_ITEMS, getRole),
    [getRole],
  );

  // Close the open submenu on an outside click or Escape.
  React.useEffect(() => {
    if (openMenu === null) {
      return;
    }

    const handlePointerDown = (event) => {
      if (!barRef.current?.contains(event.target)) {
        setOpenMenu(null);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenu]);

  const itemIsActive = (item) => {
    const activeChild =
      Array.isArray(item.children) &&
      item.children.some((child) => isRouteActive(pathname, child.href));

    return isRouteActive(pathname, item.href) || activeChild;
  };

  const linkClasses = (active) =>
    cn(
      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
      active
        ? "bg-primary/10 text-primary"
        : "text-foreground/80 hover:bg-primary/10 hover:text-primary",
    );

  return (
    <header
      ref={barRef}
      className="sticky top-0 z-50 w-full border-b border-border bg-background"
    >
      <nav className="flex items-center gap-2 px-3 py-2">
        <Link
          href="/"
          aria-label="Svastha home"
          className="flex shrink-0 items-center gap-2 rounded-md px-2 py-1"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar text-sidebar-primary-foreground">
            <Image src="/logo.svg" alt="Logo" width={24} height={24} />
          </span>

          <span className="font-sf text-xl font-bold tracking-wide text-brand-blue">
            Svas
            <span className="text-brand-green">t</span>
            ha
          </span>
        </Link>
        {/* No `overflow-x-auto` here: it establishes a clipping context, which
           would cut off the absolutely-positioned submenu dropdown. Narrow
           screens drop the labels to icons instead of scrolling. */}
        <div className="flex min-w-0 flex-1 items-center gap-1">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const hasChildren =
              Array.isArray(item.children) && item.children.length > 0;
            const active = itemIsActive(item);

            if (!hasChildren) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  title={item.label}
                  className={cn(linkClasses(active), "shrink-0")}
                >
                  {Icon ? (
                    <Icon className="size-4 shrink-0" strokeWidth={2} />
                  ) : null}
                  <span className="hidden whitespace-nowrap md:inline">
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <div key={item.href} className="relative shrink-0">
                <button
                  type="button"
                  aria-expanded={openMenu === item.label}
                  aria-haspopup="menu"
                  onClick={() =>
                    setOpenMenu((prev) =>
                      prev === item.label ? null : item.label,
                    )
                  }
                  className={cn(linkClasses(active), "shrink-0")}
                >
                  {Icon ? (
                    <Icon className="size-4 shrink-0" strokeWidth={2} />
                  ) : null}
                  <span className="hidden whitespace-nowrap md:inline">
                    {item.label}
                  </span>
                  <ChevronDown
                    className={cn(
                      "hidden size-3.5 shrink-0 transition-transform md:block",
                      openMenu === item.label && "rotate-180",
                    )}
                  />
                </button>

                {openMenu === item.label ? (
                  <div
                    role="menu"
                    className="absolute left-0 top-full z-[60] mt-1 min-w-[220px] overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg"
                  >
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const childActive = isRouteActive(pathname, child.href);

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          role="menuitem"
                          onClick={() => setOpenMenu(null)}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                            childActive
                              ? "bg-primary/10 text-primary"
                              : "text-foreground/80 hover:bg-primary/10 hover:text-primary",
                          )}
                        >
                          {ChildIcon ? (
                            <ChildIcon className="size-4 shrink-0" />
                          ) : null}
                          <span className="whitespace-nowrap">
                            {child.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-1 border-l border-border pl-2">
          {bottomItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                title={item.label}
                className={cn(
                  "flex size-9 items-center justify-center rounded-md transition-colors",
                  isRouteActive(pathname, item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/80 hover:bg-primary/10 hover:text-primary",
                )}
              >
                {Icon ? <Icon className="size-4" strokeWidth={2} /> : null}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

export default TopNav;