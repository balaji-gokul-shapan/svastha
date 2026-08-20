import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

export function EmptyState({
  title = "No records found",
  description = "There is no data to display right now.",
  icon: Icon = Inbox,
  action,
  className,
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 py-8 text-center", className)}>
      <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className=" text-sm text-muted-foreground">{description}</p>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
