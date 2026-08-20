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
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Image from "next/image";
import { ToothChartSvg } from "@/app/health-checks/dental-screening/tooth-chart-svg";
import ToothIcon from "@/app/health-checks/dental-screening/toothIcon";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Students", href: "/students", icon: Users },
  {
    label: "Health Checks",
    href: "/health-checks",
    icon: HeartPulse,
    children: [
      // { icon: SquareActivity, label: "Overview", href: "/health-checks/overview-screening" },
      { icon: Cross, label: "General Screening", href: "/health-checks/general-screening" },
      { icon: Eye, label: "Vision Screening", href: "/health-checks/vision-screening" },
      { icon: Ear, label: "Hearing Screening", href: "/health-checks/hearing-screening" },
      { icon: Stethoscope, label: "ENT Screening", href: "/health-checks/ent-screening" },
      { icon: ToothIcon, label: "Dental Screening", href: "/health-checks/dental-screening" },
      // { icon: GraduationCap, label: "Dental Screening (New)", href: "/health-checks/dental-screening-new" },
    ],
  },
  // { label: "Referrals", href: "/referrals", icon: BookOpen },
  // {
  //   label: "Insurance and Claims",
  //   href: "/insurance-and-claims",
  //   icon: CalendarCheck,
  //   children: [
  //     { label: "Overview", href: "/insurance-and-claims" },
  //     { label: "Active Claims", href: "/insurance-and-claims/claims" },
  //     { label: "Settlements", href: "/insurance-and-claims/settlements" },
  //   ],
  // },
  // { label: "Reports", href: "/reports", icon: BarChart3 },
  // {
  //   label: "Exams & Grades",
  //   href: "/exams",
  //   icon: ClipboardList,
  //   children: [
  //     { label: "Overview", href: "/exams" },
  //     { label: "Exam Schedule", href: "/exams/schedule" },
  //     { label: "Grade Book", href: "/exams/grades" },
  //   ],
  // },
  // { label: "Fees", href: "/fees", icon: Wallet },
  // { label: "Timetable", href: "/timetable", icon: CalendarDays },
];

const bottomItems = [
  { label: "Settings", href: "/settings", icon: Settings },
  // { label: "Help & Support", href: "/help", icon: HelpCircle },
];

function useMediaQuery(query) {
  return React.useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined") {
        return () => {};
      }

      const mediaQuery = window.matchMedia(query);
      const handler = () => onChange();

      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
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

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className={cn(
          "sticky top-0 flex h-screen shrink-0 flex-col overflow-hidden border-r border-border bg-card transition-[width] duration-300 ease-in-out",
          isCollapsed ? "w-17" : "w-64"
        )}
      >
        {/* Brand */}
        <div className="flex h-auto items-center border-none border-border p-4">
          <Link href="/" className="flex w-full items-center gap-2 overflow-hidden">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white text-primary-foreground">
              {/* <School className="size-4.5" strokeWidth={2.25} /> */}
              <Image src="/logo.svg" alt="Logo" width={24} height={24} />
            </span>
            <span
              className={cn(
                "truncate font-display text-xl font-semibold text-[#00A4E3] transition-all tracking-wide  duration-200",
                isCollapsed ? "max-w-0 opacity-0" : "max-w-32 opacity-100"
              )}
            >
              Svas<span className="text-[#00D55F]">t</span>ha
            </span>
          </Link>
        </div>

        {/* Primary nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-2 ">
          {navItems.map((item) => (
            
            <SidebarLink
              key={item.href}
              item={item}
              collapsed={isCollapsed}
              isSmallScreen={isSmallScreen}
              pathname={pathname}
              menuOpen={Boolean(openMenus[item.label])}
              onMenuToggle={handleParentMenuClick}
            />
          ))}
        </nav>

        {/* Bottom section + collapse toggle */}
        <div className="space-y-1 border-t border-border px-2 py-3">
          {bottomItems.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              collapsed={isCollapsed}
              isSmallScreen={isSmallScreen}
              pathname={pathname}
              menuOpen={false}
              onMenuToggle={toggleMenu}
            />
          ))}

          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
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
                isCollapsed ? "max-w-0 opacity-0" : "max-w-24 opacity-100"
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

function isRouteActive(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarLink({ item, collapsed, isSmallScreen, pathname, menuOpen, onMenuToggle }) {
  const Icon = item.icon;
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const activeChild = hasChildren
    ? item.children.some((child) => isRouteActive(pathname, child.href))
    : false;
  const active = isRouteActive(pathname, item.href) || activeChild;
  const showChildren =
    hasChildren && (isSmallScreen ? (menuOpen || activeChild) : !collapsed && (menuOpen || activeChild));

  const rowClasses = cn(
    "group relative flex w-full items-center gap-3 overflow-hidden rounded-md px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-primary/10 text-primary"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"
  );

  const rowContent = (
    <>
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent" />
      )}
      <Icon className="size-5 shrink-0" strokeWidth={2} />
      <span
        className={cn(
          "truncate transition-all duration-200",
          collapsed ? "max-w-0 opacity-0" : "max-w-40 opacity-100"
        )}
      >
        {item.label}
      </span>
      {hasChildren && (
        <ChevronDown
          className={cn(
            "ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            collapsed && !isSmallScreen ? "opacity-0" : "opacity-100",
            showChildren && "rotate-180"
          )}
        />
      )}
    </>
  );

  const mainRow = hasChildren ? (
    <button
      type="button"
      onClick={() => onMenuToggle(item.label)}
      className={rowClasses}
      aria-expanded={showChildren}
      aria-label={`${item.label} submenu`}
    >
      {rowContent}
    </button>
  ) : (
    <Link
      href={item.href}
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

  const mainRowWithTooltip = collapsed ? (
    <Tooltip>
      <TooltipTrigger asChild>{mainRow}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  ) : (
    mainRow
  );

  return (
    <div>
      {mainRowWithTooltip}

      {hasChildren && (
        <div
          className={cn(
            "grid overflow-hidden transition-all duration-200",
            showChildren ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div
            className={cn(
              "min-h-0 space-y-1 pt-1",
              collapsed ? "flex flex-col items-center" : "pl-8"
            )}
          >
            {item.children.map((child) => {
              const childActive = isRouteActive(pathname, child.href);
              const ChildIcon = child.icon;
              const childLink = (
                <Link
                  href={child.href}
                  className={cn(
                    "flex items-center rounded-md text-xs font-medium transition-colors",
                    collapsed ? "justify-center px-2 py-2" : "gap-2 px-3 py-1.5",
                    childActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {ChildIcon ? <ChildIcon className="size-4 shrink-0" /> : null}
                  <span
                    className={cn(
                      "truncate transition-all duration-200",
                      collapsed ? "max-w-0 opacity-0" : "max-w-36 opacity-100"
                    )}
                  >
                    {child.label}
                  </span>
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={child.href}>
                    <TooltipTrigger asChild>{childLink}</TooltipTrigger>
                    <TooltipContent side="right">{child.label}</TooltipContent>
                  </Tooltip>
                );
              }

              return React.cloneElement(childLink, { key: child.href });
            })}
          </div>
        </div>
      )}
    </div>
  );
}