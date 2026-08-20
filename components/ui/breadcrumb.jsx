import * as React from "react";
import { ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

const Breadcrumb = React.forwardRef(function Breadcrumb({ className, ...props }, ref) {
  return (
    <nav ref={ref} aria-label="breadcrumb" className={cn("w-full", className)} {...props} />
  );
});


const BreadcrumbList = React.forwardRef(function BreadcrumbList(
  { className, ...props },
  ref
) {
  return (
    <ol
      ref={ref}
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 wrap-break-word text-sm sm:gap-2.5",
        className
      )}
      {...props}
    />
  );
});

const BreadcrumbItem = React.forwardRef(function BreadcrumbItem({ className, ...props }, ref) {
  return <li ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...props} />;
});

const BreadcrumbLink = React.forwardRef(function BreadcrumbLink({ className, ...props }, ref) {
  return (
    <a
      ref={ref}
      className={cn("hover:text-foreground transition-colors", className)}
      {...props}
    />
  );
});

const BreadcrumbPage = React.forwardRef(function BreadcrumbPage({ className, ...props }, ref) {
  return (
    <span
      ref={ref}
      aria-current="page"
      className={cn("text-foreground font-normal cursor-default", className)}
      {...props}
    />
  );
});

function BreadcrumbSeparator({ children, className, ...props }) {
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </span>
  );
}

function BreadcrumbEllipsis({ className, ...props }) {
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={cn("flex h-9 w-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
};
