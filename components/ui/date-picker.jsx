"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

function toIsoDate(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

function formatDateLabel(date) {
	return date.toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

export function DatePicker({
	id,
	name,
	value,
	onValueChange,
	placeholder = "Pick a date",
	className,
	maxDate,
}) {
	const parsedDate = value ? new Date(`${value}T00:00:00`) : undefined;
	const date = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : undefined;

	return (
		<>
			<input type="hidden" name={name} value={value ?? ""} />
			<Popover>
				<PopoverTrigger
					render={
						<Button
							id={id}
							type="button"
							variant="outline"
							data-empty={!date}
							className={cn(
								"w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground ",
								className
							)}
						>
							<CalendarIcon />
							{date ? formatDateLabel(date) : <span>{placeholder}</span>}
						</Button>
					}
				/>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={date}
						onSelect={(nextDate) => {
							const nextValue = nextDate ? toIsoDate(nextDate) : "";
							onValueChange?.(nextValue);
						}}
						defaultMonth={date}
						maxDate={maxDate}
					/>
				</PopoverContent>
			</Popover>
		</>
	);
}
