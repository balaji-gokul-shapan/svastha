"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Ear,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Wallet,
  CalendarDays,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  School,
  HeartPulse,
  Eye,
  Stethoscope,
  Cross,
  SquareActivity,
  Syringe,
} from "lucide-react";

import { cn } from "@/lib/utils";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import Image from "next/image";

import ToothIcon from "@/app/health-checks/dental-screening/asset/toothIcon";

import { selectAuthUser } from "@/lib/features/auth-slice";
import { useAppSelector } from "@/lib/hooks";

export function Sidebar() {
  const [collapsed, setCollapsed] = React.useState(false);

  const isSmallScreen = useMediaQuery("(max-width: 1023px)");

  const isCollapsed = isSmallScreen || collapsed;

  const [openMenus, setOpenMenus] = React.useState({
    "Health Checks": false,
    "Insurance and Claims": false,
    "Exams & Grades": false,
  });

  const pathname = usePathname();
  const authUser = useAppSelector(selectAuthUser);
  console.log("authUser:", authUser);
  const getRole =
    authUser?.account_type ??
    authUser?.role ??
    null;

  console.log("Current Role:", getRole);

  /*
   * ============================================================
   * NAVIGATION ITEMS
   * ============================================================
   *
   * roles:
   * Add the roles that are allowed to see the menu.
   *
   * Example:
   * roles: ["admin", "doctor"]
   *
   * means only admin and doctor can see it.
   */

  const navItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      roles: [],
    },

    {
      label: "Students",
      href: "/students",
      icon: Users,
      roles: ["admin", "school_admin", "teacher","school"],
    },

    {
      label: "Health Checks",
      href: "/health-checks",
      icon: HeartPulse,
      roles: ["admin", "school_admin", "doctor"],
      children: [
        {
          icon: SquareActivity,
          label: "Overview",
          href: "/health-checks/overview-screening",
          roles: ["admin", "school_admin", "doctor"],
        },

        {
          icon: Cross,
          label: "General Screening",
          href: "/health-checks/general-screening",
          roles: ["admin", "school_admin", "doctor"],
        },

        {
          icon: Eye,
          label: "Vision Screening",
          href: "/health-checks/vision-screening",
          roles: ["admin", "school_admin", "doctor"],
        },

        {
          icon: Ear,
          label: "Hearing Screening",
          href: "/health-checks/hearing-screening",
          roles: ["admin", "school_admin", "doctor"],
        },

        {
          icon: Stethoscope,
          label: "ENT Screening",
          href: "/health-checks/ent-screening",
          roles: ["admin", "doctor"],
        },

        {
          icon: ToothIcon,
          label: "Dental Screening",
          href: "/health-checks/dental-screening",
          roles: ["admin", "doctor"],
        },

        {
          icon: Syringe,
          label: "Immunizations",
          href: "/health-checks/immunization",
          roles: ["admin", "school_admin", "doctor"],
        },
      ],
    },

    {
      label: "Insurance and Claims",
      href: "/insurance-and-claims",
      icon: CalendarCheck,

      roles: ["admin", "school_admin"],

      children: [
        {
          label: "Overview",
          href: "/insurance-and-claims",
          roles: ["admin", "school_admin"],
        },

        {
          label: "Active Claims",
          href: "/insurance-and-claims/claims",
          roles: ["admin", "school_admin"],
        },

        {
          label: "Settlements",
          href: "/insurance-and-claims/settlements",
          roles: ["admin"],
        },
      ],
    },

    {
      label: "Reports",
      href: "/report",
      icon: BarChart3,
      roles: ["admin", "school_admin", "school"],
    },
  ];


  const bottomItems = [
    {
      label: "Settings",
      href: "/settingsNew",
      icon: Settings,

      roles: [
       
      ],
    },

    {
      label: "Help & Support",
      href: "/help",
      icon: HelpCircle,

      roles: [
        
      ],
    },
  ];



  const getVisibleItems = React.useCallback(
    (items, role) => {
      if (!Array.isArray(items)) {
        return [];
      }
      return items
        .map((item) => {
          const itemAllowed =
            !item?.roles?.length ||
            item.roles.includes(role);

          if (!itemAllowed) {
            return null;
          }

          if (
            Array.isArray(item?.children) &&
            item.children.length > 0
          ) {
            const children = item.children.filter(
              (child) =>
                !child?.roles?.length ||
                child.roles.includes(role)
            );

            if (children.length === 0) {
              return null;
            }

            return {
              ...item,
              children,
            };
          }

          return item;
        })
        .filter(Boolean);
    },
    []
  );

  
  const visibleNavItems = React.useMemo(
    () => getVisibleItems(navItems, getRole),
    [navItems, getRole, getVisibleItems]
  );

  const visibleBottomItems = React.useMemo(
    () => getVisibleItems(bottomItems, getRole),
    [bottomItems, getRole, getVisibleItems]
  );


  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleParentMenuClick = (label) => {
    if (isSmallScreen) {
      toggleMenu(label);
      return;
    }

    if (isCollapsed) {
      setCollapsed(false);

      setOpenMenus((prev) => ({
        ...prev,
        [label]: true,
      }));

      return;
    }

    toggleMenu(label);
  };

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className={cn(
          "sticky top-0 flex h-screen shrink-0 flex-col overflow-hidden border-r border-border bg-card transition-[width] duration-300 ease-in-out",
          isCollapsed ? "w-17" : "w-64"
        )}
      >
        {/* =====================================================
            BRAND
        ====================================================== */}

        <div className="flex h-auto items-center border-none border-border p-4">
          <Link
            href="/"
            className="flex w-full items-center gap-2 overflow-hidden"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white text-primary-foreground">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={24}
                height={24}
              />
            </span>

            <span
              className={cn(
                "truncate font-sf text-xl font-bold tracking-wide text-[#00A4E3] transition-all duration-200",
                isCollapsed
                  ? "max-w-0 opacity-0"
                  : "max-w-32 opacity-100"
              )}
            >
              Svas
              <span className="text-[#00D55F]">
                t
              </span>
              ha
            </span>
          </Link>
        </div>

        {/* =====================================================
            PRIMARY NAVIGATION
        ====================================================== */}

        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {visibleNavItems.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              collapsed={isCollapsed}
              isSmallScreen={isSmallScreen}
              pathname={pathname}
              menuOpen={Boolean(
                openMenus[item.label]
              )}
              onMenuToggle={
                handleParentMenuClick
              }
            />
          ))}
        </nav>

        {/* =====================================================
            BOTTOM NAVIGATION
        ====================================================== */}

        <div className="space-y-1 border-t border-border px-2 py-3">
          {visibleBottomItems.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              collapsed={isCollapsed}
              isSmallScreen={isSmallScreen}
              pathname={pathname}
              menuOpen={false}
              onMenuToggle={toggleMenu}
              onNavigate={() => {
                if (item.label === "Settings") {
                  setCollapsed(true);
                }
              }}
            />
          ))}

          {/* ===================================================
              COLLAPSE BUTTON
          ==================================================== */}

          <button
            type="button"
            onClick={() =>
              setCollapsed((c) => !c)
            }
            aria-label={
              isCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            className={cn(
              "hidden w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:flex"
            )}
          >
            {isCollapsed ? (
              <ChevronsRight className="size-5 shrink-0" />
            ) : (
              <ChevronsLeft className="size-5 shrink-0" />
            )}

            <span
              className={cn(
                "truncate transition-all duration-200",
                isCollapsed
                  ? "max-w-0 opacity-0"
                  : "max-w-24 opacity-100"
              )}
            >
              Collapse
            </span>
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}

/*
 * ==============================================================
 * MEDIA QUERY
 * ==============================================================
 */

function useMediaQuery(query) {
  return React.useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined") {
        return () => {};
      }

      const mediaQuery =
        window.matchMedia(query);

      const handler = () => onChange();

      mediaQuery.addEventListener(
        "change",
        handler
      );

      return () =>
        mediaQuery.removeEventListener(
          "change",
          handler
        );
    },

    () => {
      if (typeof window === "undefined") {
        return true;
      }

      return window.matchMedia(query).matches;
    },

    () => true
  );
}

/*
 * ==============================================================
 * ROUTE ACTIVE CHECK
 * ==============================================================
 */

function isRouteActive(pathname, href) {
  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

/*
 * ==============================================================
 * SIDEBAR LINK
 * ==============================================================
 */

function SidebarLink({
  item,
  collapsed,
  isSmallScreen,
  pathname,
  menuOpen,
  onMenuToggle,
  onNavigate,
}) {
  const Icon = item.icon;

  const hasChildren =
    Array.isArray(item.children) &&
    item.children.length > 0;

  /*
   * Check if any child is active
   */

  const activeChild = hasChildren
    ? item.children.some((child) =>
        isRouteActive(
          pathname,
          child.href
        )
      )
    : false;

  /*
   * Check if parent is active
   */

  const active =
    isRouteActive(pathname, item.href) ||
    activeChild;

  /*
   * Determine whether children should be shown
   */

  const showChildren =
    hasChildren &&
    (isSmallScreen
      ? menuOpen || activeChild
      : !collapsed &&
        (menuOpen || activeChild));

  /*
   * Main row classes
   */

  const rowClasses = cn(
    "group relative flex w-full items-center gap-3 overflow-hidden rounded-md px-3 py-2 text-sm font-medium transition-colors",

    active
      ? "bg-primary/10 text-primary"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"
  );

  /*
   * Main content
   */

  const rowContent = (
    <>
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent" />
      )}

      {Icon && (
        <Icon
          className="size-5 shrink-0"
          strokeWidth={2}
        />
      )}

      <span
        className={cn(
          "truncate transition-all duration-200",

          collapsed
            ? "max-w-0 opacity-0"
            : "max-w-40 opacity-100"
        )}
      >
        {item.label}
      </span>

      {hasChildren && (
        <ChevronDown
          className={cn(
            "ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-200",

            collapsed &&
              !isSmallScreen
              ? "opacity-0"
              : "opacity-100",

            showChildren &&
              "rotate-180"
          )}
        />
      )}
    </>
  );

  /*
   * Parent with children
   */

  const mainRow = hasChildren ? (
    <button
      type="button"
      onClick={() =>
        onMenuToggle(item.label)
      }
      className={rowClasses}
      aria-expanded={showChildren}
      aria-label={`${item.label} submenu`}
    >
      {rowContent}
    </button>
  ) : (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "group relative flex items-center gap-3 overflow-hidden rounded-md px-3 py-2 text-sm font-medium transition-colors",

        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {rowContent}
    </Link>
  );

  /*
   * Tooltip when sidebar is collapsed
   */

  const mainRowWithTooltip = collapsed ? (
    <Tooltip>
      <TooltipTrigger asChild>
        {mainRow}
      </TooltipTrigger>

      <TooltipContent side="right">
        {item.label}
      </TooltipContent>
    </Tooltip>
  ) : (
    mainRow
  );

  return (
    <div>
      {mainRowWithTooltip}

      {/* =====================================================
          CHILDREN
      ====================================================== */}

      {hasChildren && (
        <div
          className={cn(
            "grid overflow-hidden transition-all duration-200",

            showChildren
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div
            className={cn(
              "min-h-0 space-y-1 pt-1",

              collapsed
                ? "flex flex-col items-center"
                : "pl-8"
            )}
          >
            {item.children.map(
              (child) => {
                const childActive =
                  isRouteActive(
                    pathname,
                    child.href
                  );

                const ChildIcon =
                  child.icon;

                const childLink = (
                  <Link
                    href={child.href}
                    className={cn(
                      "flex items-center rounded-md text-xs font-medium transition-colors",

                      collapsed
                        ? "justify-center px-2 py-2"
                        : "gap-2 px-3 py-1.5",

                      childActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {ChildIcon ? (
                      <ChildIcon className="size-4 shrink-0" />
                    ) : null}

                    <span
                      className={cn(
                        "truncate transition-all duration-200",

                        collapsed
                          ? "max-w-0 opacity-0"
                          : "max-w-36 opacity-100"
                      )}
                    >
                      {child.label}
                    </span>
                  </Link>
                );

                /*
                 * Tooltip for collapsed sidebar
                 */

                if (collapsed) {
                  return (
                    <Tooltip
                      key={child.href}
                    >
                      <TooltipTrigger
                        asChild
                      >
                        {childLink}
                      </TooltipTrigger>

                      <TooltipContent side="right">
                        {child.label}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return React.cloneElement(
                  childLink,
                  {
                    key: child.href,
                  }
                );
              }
            )}
          </div>
        </div>
      )}
    </div>
  );
}