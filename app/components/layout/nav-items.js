"use client";

import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  HeartPulse,
  Eye,
  Ear,
  Stethoscope,
  Cross,
  SquareActivity,
  Syringe,
  ReceiptIndianRupee,
} from "lucide-react";

import ToothIcon from "@/app/health-checks/dental-screening/asset/toothIcon";

/* Single source of truth for the app's navigation. The side rail
   (sidebar.jsx) and the top bar (top-nav.jsx) both render from these, so a
   route or role change only has to be made once. Item shape:
   { label, href, icon, roles[], children[] } — an empty or absent `roles`
   means every role can see the item. */

export const NAV_ITEMS = [
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
  },

  {
    label: "Billing & Tax Invoices",
    href: "/billingInvoice",
    icon: ReceiptIndianRupee,
    roles: [
      "admin",
      "school_admin",
      "school",
    ],
  },
];

export const BOTTOM_NAV_ITEMS = [
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

/* Drops items the role can't reach, and drops parents left with no reachable
   children — otherwise a role would see a heading that opens onto nothing. */
export function filterItemsByRole(items, role) {
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

        return { ...item, children };
      }

      return item;
    })
    .filter(Boolean);
}

export function isRouteActive(pathname, href) {
  return pathname === href || pathname?.startsWith(`${href}/`);
}