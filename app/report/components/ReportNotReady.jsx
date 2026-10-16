"use client";

import { Clock, Info } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils"; 

export function ReportNotReady({
  title = "Report Currently Unavailable",
  description = "Your report is still being processed and is not yet available. Please check back shortly. Thank you for your patience.",
  icon: Icon = Clock,
  className,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-12 rounded-2xl border-2 border-dashed border-warning bg-warning/20 text-center text-warning",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-warning/20 text-warning-foreground">
        <Icon className="size-6 animate-pulse" />
      </span>
      <h3 className="text-xl font-semibold text-warning">{title}</h3>
      <p className="text-sm text-warning">{description}</p>
      <Info className="size-3 opacity-50" aria-hidden="true" />
    </motion.div>
  );
}
