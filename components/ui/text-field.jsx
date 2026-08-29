import * as React from "react";

import { cn } from "../../lib/utils";
import { Input } from "./input";
import { Textarea } from "./textarea";

/**
 * TextField — a labeled text input built on shadcn conventions.
 *
 * Composes a <label> with the existing <Input> so every text field in the
 * app can render label + input with one import. The ref forwards to the
 * underlying <input>.
 *
 * Example:
 *   <TextField
 *     id="name"
 *     label="Full name"
 *     placeholder="Enter your name"
 *     value={name}
 *     onChange={(e) => setName(e.target.value)}
 *   />
 */
const Label = React.forwardRef(function Label(
  { className, htmlFor, ...props },
  ref,
) {
  return (
    <label
      ref={ref}
      htmlFor={htmlFor}
      className={cn(
        "block text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
});

const TextField = React.forwardRef(function TextField(
  {
    className,
    id,
    label,
    required = false,
    inputClassName,
    ...props
  },
  ref,
) {
  const fieldId = id;
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <Label htmlFor={fieldId}>
          {label}
          {required ? (
            <span className="ml-0.5 text-destructive">*</span>
          ) : null}
        </Label>
      ) : null}
      <Input
        ref={ref}
        id={fieldId}
        className={inputClassName}
        {...props}
      />
    </div>
  );
});

const TextareaField = React.forwardRef(function TextareaField(
  {
    className,
    id,
    label,
    required = false,
    textareaClassName,
    textFontClass="",
    ...props
  },
  ref,
) {
  const fieldId = id;
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <Label htmlFor={fieldId} className={`!textFontClass ${textFontClass} mb-2`}>
          {label}
          {required ? (
            <span className="ml-0.5 text-destructive">*</span>
          ) : null}
        </Label>
      ) : null}
      <Textarea
        ref={ref}
        id={fieldId}
        className={cn("w-full", textareaClassName)}
        {...props}
      />
    </div>
  );
});

export { TextField, TextareaField, Label };
