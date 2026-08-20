"use client";

import { Button } from "@/components/ui/button";
import SideDrawer from "@/components/ui/side-drawer";
import { UserRoundSearch } from "lucide-react";

export default function CaDrawer({
  triggerLabel = "Advance Search",
  icon,
  title = "CA Drawer",
  description = "Add CA details here. This panel opens from the right side.",
  closeLabel = "Close",
  children,
  open,
  onOpenChange,
}) {
  return (
    <SideDrawer
      trigger={(
        <Button type="button" variant="outline" className="gap-2">
          <UserRoundSearch />
          {/* {icon ? <span className="text-muted-foreground">{icon}</span> : null} */}
          <span>{triggerLabel}</span>
        </Button>
      )}
      icon={icon}
      title={title}
      description={description}
      closeLabel={closeLabel}
      open={open}
      onOpenChange={onOpenChange}
    >
      {children ?? (
        <p className="text-sm text-muted-foreground">
          No Record Found
        </p>
      )}
    </SideDrawer>
  );
}
