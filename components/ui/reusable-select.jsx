"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "../../lib/utils"; 

function normalizeOption(option) {
	if (typeof option === "string") {
		return { label: option, value: option };
	}

	return {
		label: String(option?.label ?? option?.value ?? ""),
		value: String(option?.value ?? option?.label ?? ""),
	};
}

export default function ReusableSelect({
	label,
	value,
	onChange,
	options = [],
	placeholder = "Select an option",
	searchPlaceholder = "Search...",
	className = "",
	disabled = false,
}) {
	const [open, setOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const containerRef = useRef(null);
	const inputRef = useRef(null);

	const normalizedOptions = useMemo(
		() => options.map(normalizeOption).filter((opt) => opt.value.length > 0),
		[options],
	);

	const filteredOptions = useMemo(() => {
		const keyword = searchTerm.trim().toLowerCase();
		if (!keyword) {
			return normalizedOptions;
		}

		return normalizedOptions.filter((opt) => opt.label.toLowerCase().includes(keyword));
	}, [normalizedOptions, searchTerm]);

	const selectedOption = normalizedOptions.find((opt) => opt.value === String(value ?? ""));

	useEffect(() => {
		if (!open) {
			return;
		}

		const onPointerDown = (event) => {
			if (containerRef.current && !containerRef.current.contains(event.target)) {
				setOpen(false);
				setSearchTerm("");
			}
		};

		document.addEventListener("mousedown", onPointerDown);
		return () => {
			document.removeEventListener("mousedown", onPointerDown);
		};
	}, [open]);

	useEffect(() => {
		if (open) {
			requestAnimationFrame(() => {
				inputRef.current?.focus();
			});
		}
	}, [open]);

	return (
		<div ref={containerRef} className={cn("relative", className, disabled && "opacity-60")}>
			{label ? <label className="mb-1.5 block text-xs text-muted-foreground">{label}</label> : null}

			<button
				type="button"
				disabled={disabled}
				onClick={() => {
					setOpen((prev) => {
						if (prev) {
							setSearchTerm("");
						}
						return !prev;
					});
				}}
				className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed"
			>
				<span className={cn("truncate", !selectedOption && "text-muted-foreground")}>
					{selectedOption?.label || placeholder}
				</span>
				<ChevronDown className="size-4 text-muted-foreground" />
			</button>

			{open ? (
				<div className="absolute left-0 right-0 top-full z-60 mt-1 rounded-md border border-border bg-popover p-2 text-popover-foreground shadow-md">
					<input
						ref={inputRef}
						type="text"
						value={searchTerm}
						onChange={(event) => setSearchTerm(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === "Escape") {
								setOpen(false);
								setSearchTerm("");
							}
						}}
						placeholder={searchPlaceholder}
						className="mb-2 h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
					/>

					<div className="max-h-60 space-y-1 overflow-y-auto">
						{filteredOptions.length ? (
							filteredOptions.map((option) => {
								const isSelected = option.value === String(value ?? "");
								return (
									<button
										key={option.value}
										type="button"
										onClick={() => {
											onChange?.(option.value);
											setOpen(false);
											setSearchTerm("");
										}}
										className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
									>
										<span className="inline-flex w-4 items-center justify-center">
											{isSelected ? <Check className="size-3.5" /> : null}
										</span>
										<span className="truncate">{option.label}</span>
									</button>
								);
							})
						) : (
							<p className="px-2 py-1.5 text-sm text-muted-foreground">No results found</p>
						)}
					</div>
				</div>
			) : null}
		</div>
	);
}
