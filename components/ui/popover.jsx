"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

import { cn } from "../../lib/util"; "@/lib/utils";

function Popover(props) {
	return <PopoverPrimitive.Root {...props} />;
}

function PopoverTrigger({ asChild = false, render, children, ...props }) {
	if (render) {
		return <PopoverPrimitive.Trigger render={render} {...props} />;
	}

	if (asChild && React.isValidElement(children)) {
		return <PopoverPrimitive.Trigger render={children} {...props} />;
	}

	return <PopoverPrimitive.Trigger {...props}>{children}</PopoverPrimitive.Trigger>;
}

function PopoverContent({
	className,
	side = "bottom",
	align = "center",
	sideOffset = 8,
	children,
	...props
}) {
	return (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Positioner
				side={side}
				align={align}
				sideOffset={sideOffset}
				className="z-120"
			>
				<PopoverPrimitive.Popup
					className={cn(
						"z-121 w-72 origin-(--transform-origin) rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-md",
						"transition-[transform,opacity] duration-100 data-ending-style:opacity-0 data-ending-style:scale-95 data-starting-style:opacity-0 data-starting-style:scale-95",
						className
					)}
					{...props}
				>
					{children}
				</PopoverPrimitive.Popup>
			</PopoverPrimitive.Positioner>
		</PopoverPrimitive.Portal>
	);
}

export { Popover, PopoverTrigger, PopoverContent };
