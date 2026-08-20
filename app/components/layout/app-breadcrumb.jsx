"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const labelBySegment = {
  dashboard: "Dashboard",
  students: "Students",
  add: "Add Student",
  reports: "Reports",
  settings: "Settings",
  help: "Help & Support",
  fees: "Fees",
  timetable: "Timetable",
};

function formatSegment(segment) {
  const decoded = decodeURIComponent(segment);

  if (labelBySegment[decoded]) {
    return labelBySegment[decoded];
  }

  if (/^-?stu-\d+$/i.test(decoded)) {
    return decoded.toUpperCase();
  }

  if (/-stu-\d+$/i.test(decoded)) {
    const namePart = decoded.replace(/-stu-\d+$/i, "");
    return namePart
      .split("-")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return decoded
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function AppBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <Breadcrumb className="px-4 py-3 sm:px-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          {segments.length === 0 ? (
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          ) : (
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
          )}
        </BreadcrumbItem>

        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;

          return (
            <BreadcrumbItem key={href}>
              <BreadcrumbSeparator />
              {isLast ? (
                <BreadcrumbPage>{formatSegment(segment)}</BreadcrumbPage>
              ) : (
                <Link
                  href={href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {formatSegment(segment)}
                </Link>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
