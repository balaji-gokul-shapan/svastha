"use client";

import { isValidElement } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { X } from "lucide-react";

export default function SideDrawer({
  trigger,
  icon,
  title,
  description,
  closeLabel = "Close",
  children,
  contentClassName = "",
  open,
  onOpenChange,
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>

      <DrawerContent side="right" className={`rounded-none rounded-l-2xl ${contentClassName}`}>
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            {(() => {
              // Accept either style: a ready-made element ("icon={<School />}"),
              // or a component reference ("icon={School}"). Rendering a bare
              // component reference as a child crashes with
              // "Objects are not valid as a React child".
              if (!icon) return null;
              if (isValidElement(icon)) {
                return <span className="text-primary">{icon}</span>;
              }
              const Icon = icon;
              return (
                <span className="text-primary">
                  <Icon />
                </span>
              );
            })()}
            <span>{title}</span>
          </DrawerTitle>
          {description ? <DrawerDescription className="text-muted-foreground pl-8">{description}</DrawerDescription> : null}
        </DrawerHeader>

        <div className="space-y-3 p-4">{children}</div>

        <DrawerFooter className="justify-end border-t border-border">
          <DrawerClose asChild>
            <Button type="button" variant="outline">
              <X className="size-4" />
              {closeLabel}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
