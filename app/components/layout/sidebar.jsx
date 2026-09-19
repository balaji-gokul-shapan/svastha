"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Ear,
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
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

import { TooltipProvider } from "@/components/ui/tooltip";

import Image from "next/image";

import ToothIcon from "@/app/health-checks/dental-screening/asset/toothIcon";

import { useAuthRole } from "@/lib/user-role";

export function Sidebar() {
  const [openMenus, setOpenMenus] = React.useState({
    "Health Checks": false,
    "Insurance and Claims": false,
    "Exams & Grades": false,
  });

  const pathname = usePathname();
  const getRole = useAuthRole();

  /*
   * The shadcn SidebarProvider owns the open/collapsed state:
   * desktop -> icon rail, small screens -> off-canvas sheet.
   */
  const { isMobile, open, setOpen, toggleSidebar } = useSidebar();

  const isCollapsed = !isMobile && !open;

  console.log("Current Role:", getRole);

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
      roles: [
        "admin",
        "school_admin",
        "teacher",
        "school",
        "school_sub_account",
      ],
    },

    {
      label: "Health Checks",
      href: "/health-checks",
      icon: HeartPulse,
      roles: ["doctor"],
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

    // {
    //   label: "Insurance and Claims",
    //   href: "/insurance-and-claims",
    //   icon: CalendarCheck,

    //   roles: ["admin", "school_admin"],

    //   children: [
    //     {
    //       label: "Overview",
    //       href: "/insurance-and-claims",
    //       roles: ["admin", "school_admin"],
    //     },

    //     {
    //       label: "Active Claims",
    //       href: "/insurance-and-claims/claims",
    //       roles: ["admin", "school_admin"],
    //     },

    //     {
    //       label: "Settlements",
    //       href: "/insurance-and-claims/settlements",
    //       roles: ["admin"],
    //     },
    //   ],
    // },

    {
      label: "Reports",
      href: "/report",
      icon: BarChart3,
      roles: [
        "admin",
        "school_admin",
        "school",
        "school_sub_account",
        "doctor",
        "teacher",
      ],
      // children: [{
      //     icon: Ear,
      //     label: "Hearing Screening",
      //     href: "/health-checks/hearing-screening",
      //     roles: ["admin", "school_admin", "doctor"],
      //   },]
    },
  ];

  const bottomItems = [
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,

      roles: [],
    },

    {
      label: "Help & Support",
      href: "/help",
      icon: HelpCircle,

      roles: [],
    },
  ];

  const getVisibleItems = React.useCallback((items, role) => {
    if (!Array.isArray(items)) {
      return [];
    }
    return items
      .map((item) => {
        const itemAllowed = !item?.roles?.length || item.roles.includes(role);

        if (!itemAllowed) {
          return null;
        }

        if (Array.isArray(item?.children) && item.children.length > 0) {
          const children = item.children.filter(
            (child) => !child?.roles?.length || child.roles.includes(role),
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
  }, []);

  const visibleNavItems = React.useMemo(
    () => getVisibleItems(navItems, getRole),
    [navItems, getRole, getVisibleItems],
  );

  const visibleBottomItems = React.useMemo(
    () => getVisibleItems(bottomItems, getRole),
    [bottomItems, getRole, getVisibleItems],
  );

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleParentMenuClick = (label) => {
    if (isMobile) {
      toggleMenu(label);
      return;
    }

    if (isCollapsed) {
      setOpen(true);

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
      <SidebarPrimitive collapsible="icon">
        {/* =====================================================
            BRAND
        ====================================================== */}

        <SidebarHeader className="p-2">
          <Link
            href="/"
            aria-label="Svastha home"
            className={cn(
              "flex h-10 w-full items-center gap-2 overflow-hidden rounded-md px-3",
              "transition-[padding,gap] duration-200 ease-linear",
              "group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-2",
            )}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar text-sidebar-primary-foreground">
              <Image src="/logo.svg" alt="Logo" width={24} height={24} />
            </span>

            <span
              className={cn(
                "min-w-0 max-w-40 truncate font-sf text-xl font-bold tracking-wide text-brand-blue",
                "transition-[max-width,opacity] duration-200 ease-linear",
                "group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0",
              )}
            >
              Svas
              <span className="text-brand-green">t</span>
              ha
            </span>
          </Link>
        </SidebarHeader>

        {/* =====================================================
            PRIMARY NAVIGATION
        ====================================================== */}

        <SidebarContent className="px-2">
          <SidebarGroup className="">
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {visibleNavItems.map((item) => (
                  <SidebarLink
                    key={item.href}
                    item={item}
                    collapsed={isCollapsed}
                    pathname={pathname}
                    menuOpen={Boolean(openMenus[item.label])}
                    onMenuToggle={handleParentMenuClick}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* =====================================================
            BOTTOM NAVIGATION
        ====================================================== */}

        <SidebarFooter className="border-t border-sidebar-border px-2 py-3">
          <SidebarMenu className="gap-1 px-2">
            {visibleBottomItems.map((item) => (
              <SidebarLink
                key={item.href}
                item={item}
                collapsed={isCollapsed}
                pathname={pathname}
                menuOpen={false}
                onMenuToggle={toggleMenu}
                onNavigate={() => {
                  if (item.label === "Settings") {
                    setOpen(false);
                  }
                }}
              />
            ))}

            {/* ===================================================
                COLLAPSE BUTTON
            ==================================================== */}

            <SidebarMenuItem className="hidden lg:block">
              <SidebarMenuButton
                type="button"
                onClick={toggleSidebar}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                tooltip={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                className="gap-3 px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-primary/10 hover:text-primary"
              >
                {isCollapsed ? (
                  <ChevronsRight className="size-5 shrink-0" />
                ) : (
                  <ChevronsLeft className="size-5 shrink-0" />
                )}

                <span>Collapse</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </SidebarPrimitive>
    </TooltipProvider>
  );
}

/*
 * ==============================================================
 * ROUTE ACTIVE CHECK
 * ==============================================================
 */

function isRouteActive(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/*
 * ==============================================================
 * SIDEBAR LINK
 * ==============================================================
 */

function SidebarLink({
  item,
  collapsed,
  pathname,
  menuOpen,
  onMenuToggle,
  onNavigate,
}) {
  const { isMobile, setOpenMobile } = useSidebar();

  const Icon = item.icon;

  const hasChildren = Array.isArray(item.children) && item.children.length > 0;

  /*
   * Check if any child is active
   */

  const activeChild = hasChildren
    ? item.children.some((child) => isRouteActive(pathname, child.href))
    : false;

  /*
   * Parent looks active (pill + blue text + accent bar) on its own route
   * OR when any child route is active — per design.
   * The bar also uses (active || activeChild); the child itself gets
   * only the pill, no bar.
   */

  const active = hasChildren
    ? pathname === item.href
    : isRouteActive(pathname, item.href);

  const parentVisualActive = active || activeChild;

  /*
   * Determine whether children should be shown
   */

  const showChildren =
    hasChildren &&
    (isMobile
      ? menuOpen || activeChild
      : !collapsed && (menuOpen || activeChild));

  /*
   * Active / inactive appearance (keeps the original Svastha colors)
   */

  const stateClasses = parentVisualActive
    ? cn(
        "bg-primary/10 text-primary",
        "data-active:bg-primary/10 data-active:text-primary",
      )
    : cn("text-sidebar-foreground", "hover:bg-primary/10 hover:text-primary");

  const handleLinkClick = (event) => {
    onNavigate?.(event);

    if (isMobile) {
      setOpenMobile(false);
    }
  };

  /*
   * Main row
   */

  const rowContent = (
    <>
      {/* Accent bar — shown for a parent row whenever it (or any child) is active.
          Child rows deliberately get no bar. */}
      {parentVisualActive && (
        <span className="absolute left-[0.1rem] top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent" />
      )}

      {Icon && <Icon className="size-5 shrink-0" strokeWidth={2} />}

      <span className="min-w-0 flex-1 truncate whitespace-nowrap transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0">
        {item.label}
      </span>

      {hasChildren && (
        <ChevronDown
          className={cn(
            "ml-auto size-4 shrink-0 whitespace-nowrap text-muted-foreground transition-all duration-200",
            "group-data-[collapsible=icon]:hidden",
            showChildren && "rotate-180",
          )}
        />
      )}
    </>
  );

  /*
   * Parent with children
   */

  const mainRow = hasChildren ? (
    <SidebarMenuButton
      type="button"
      onClick={() => onMenuToggle(item.label)}
      aria-expanded={showChildren}
      aria-label={`${item.label} submenu`}
      isActive={parentVisualActive}
      tooltip={item.label}
      className={cn(
        "relative h-9 gap-3 rounded-lg px-3 text-sm font-medium",
        "transition-colors duration-200",
        stateClasses,
      )}
    >
      {rowContent}
    </SidebarMenuButton>
  ) : (
    <SidebarMenuButton
      render={<Link href={item.href} onClick={handleLinkClick} />}
      isActive={active}
      tooltip={item.label}
      className={cn(
        "relative h-9 gap-3 rounded-lg px-3 text-sm font-medium",
        "transition-colors duration-200",
        stateClasses,
      )}
    >
      {rowContent}
    </SidebarMenuButton>
  );

  return (
    <SidebarMenuItem>
      {mainRow}

      {/* =====================================================
          CHILDREN
      ====================================================== */}

      {hasChildren && (
        <div
          className={cn(
            "grid overflow-hidden transition-all duration-200",

            showChildren
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="min-h-0">
            <SidebarMenuSub className="border-l-0">
              {item.children.map((child) => {
                const childActive = isRouteActive(pathname, child.href);

                const ChildIcon = child.icon;

                return (
                  <SidebarMenuSubItem key={child.href}>
                    <SidebarMenuSubButton
                      render={
                        <Link href={child.href} onClick={handleLinkClick} />
                      }
                      size="sm"
                      isActive={childActive}
                      className={cn(
                        "h-8 gap-2 rounded-lg px-3 text-xs font-medium",
                        "transition-colors duration-200",

                        childActive
                          ? cn(
                              "bg-sidebar-accent text-primary",
                              "data-active:bg-sidebar-accent data-active:text-primary",
                              "[&>svg]:text-primary",
                            )
                          : cn(
                              "text-sidebar-foreground/80",
                              "hover:bg-primary/10 hover:text-primary",
                              "hover:[&>svg]:text-primary",
                              "[&>svg]:text-sidebar-foreground/80",
                            ),
                      )}
                    >
                      {ChildIcon ? (
                        <ChildIcon className="size-4 shrink-0" />
                      ) : null}

                      <span>{child.label}</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                );
              })}
            </SidebarMenuSub>
          </div>
        </div>
      )}
    </SidebarMenuItem>
  );
}
