"use client";

import { useRef, useState } from "react";
import { Check, Pencil, X } from "lucide-react";

/**
 * EditableVitalCard — a compact vitals card with inline edit-in-place.
 *
 * Displays a value with an icon tile + unit. Clicking the pencil switches
 * the card into edit mode (a plain input in place of the value). The input
 * is saved when the user presses Enter, clicks ✓, or clicks outside (blur);
 * Escape or ✕ cancels. Edit state is local to each card, so multiple cards
 * can be edited independently.
 *
 * Props:
 *   label        — card label (e.g. "Pulse", "Height")
 *   value        — current value (string; used for display + seeding the draft)
 *   onChange     — (nextValue) => void; called on confirm
 *   unit         — unit pill text (e.g. "bpm", "cm"); hidden while editing
 *   icon         — icon component to render (lucide or @iconify icon)
 *   iconClass    — classes for the icon tile background (e.g. "bg-blue/10")
 *   iconColor    — classes for the icon itself (e.g. "text-blue")
 *   inputType    — "number" (default) or "text" (for BP like "120/80")
 *   placeholder  — edit input placeholder
 *   displayValue — optional; overrides how the value renders in read mode
 */

const EditableVitalCard = ({
  label,
  value,
  onChange,
  unit,
  icon: Icon,
  iconClass = "bg-primary/10",
  iconColor = "text-primary",
  inputType = "number",
  placeholder = "",
  displayValue,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  // Ref guard so an onBlur that fires *after* Enter/Escape already reset the
  // edit state (e.g. on input unmount) cannot ghost-commit a stale draft.
  const editingRef = useRef(false);

  const startEdit = () => {
    setDraft(String(value ?? ""));
    editingRef.current = true;
    setIsEditing(true);
  };

  const confirmEdit = () => {
    if (!editingRef.current) return;
    editingRef.current = false;
    onChange?.(draft);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    editingRef.current = false;
    setIsEditing(false);
  };

  // Clicking outside the input commits the typed value (unless the field was
  // cleared, in which case it reverts to the previous value).
  const handleBlur = () => {
    if (!editingRef.current) return;
    if (draft.trim() === "") {
      cancelEdit();
    } else {
      confirmEdit();
    }
  };

  const resolvedDisplay = displayValue ?? value ?? "0";

  return (
    <div className="rounded-xl border border-border/70 bg-background p-4">
      <div className="flex items-center justify-between">
        <div
          className={`flex size-10 items-center justify-center rounded-lg ${iconClass}`}
        >
          {Icon ? <Icon className={`size-6 ${iconColor}`} /> : null}
        </div>
        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={confirmEdit}
                className="text-success hover:opacity-80"
                aria-label={`Save ${label}`}
              >
                <Check className="size-4" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={cancelEdit}
                className="text-muted-foreground hover:opacity-80"
                aria-label={`Cancel ${label}`}
              >
                <X className="size-4" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={startEdit}
              className="cursor-pointer text-muted-foreground opacity-70 hover:opacity-100"
              aria-label={`Edit ${label}`}
            >
              <Pencil className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <h3 className="mt-4 text-sm text-muted-foreground">{label}</h3>

      <div className="mt-1 flex items-center justify-between gap-1 w-full flex-1">
        {isEditing ? (
          <input
            type={inputType}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-2/3 rounded-md border border-input bg-background px-2 py-1 text-2xl font-semibold"
            placeholder={placeholder}
            autoFocus
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmEdit();
              if (e.key === "Escape") cancelEdit();
            }}
          />
        ) : (
          <span className="text-2xl font-semibold tracking-tight">
            {resolvedDisplay}
          </span>
        )}
      {!isEditing && unit ? (
        <span className="text-xs text-muted-foreground">{unit}</span>
      ) : null}
      </div>

    </div>
  );
};

export default EditableVitalCard;