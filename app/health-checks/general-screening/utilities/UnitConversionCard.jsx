"use client";

import { useRef, useState } from "react";
import { Check, Pencil, X } from "lucide-react";

const UnitConversionCard = ({
  label,
  value,
  onChange,
  unit = "°C",
  unitImperial = "°F",
  convertToImperial,
  convertFromImperial,
  icon: Icon,
  iconClass = "bg-primary/10",
  iconColor = "text-primary",
  placeholder = "0",
  step = "0.1",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [useImperial, setUseImperial] = useState(false);
  const editingRef = useRef(false);

  const getDisplayValue = () => {
    if (!value || value === "0") return "";
    if (useImperial && convertToImperial) {
      return convertToImperial(value);
    }
    return value;
  };

  const startEdit = () => {
    setDraft(getDisplayValue());
    editingRef.current = true;
    setIsEditing(true);
  };

  const confirmEdit = () => {
    if (!editingRef.current) return;
    editingRef.current = false;
    let valueInMetric = draft;
    if (useImperial && convertFromImperial && draft.trim() !== "") {
      valueInMetric = convertFromImperial(draft);
    }
    onChange?.(valueInMetric);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    editingRef.current = false;
    setIsEditing(false);
  };

  const handleBlur = () => {
    if (!editingRef.current) return;
    if (draft.trim() === "") {
      cancelEdit();
    } else {
      confirmEdit();
    }
  };

  const toggleUnit = () => {
    setUseImperial((prev) => !prev);
  };

  const displayValue = getDisplayValue();

  return (
    <div className="rounded-xl border border-border/70 bg-background p-4">
      <div className="flex items-center justify-between">
        <div className={`flex size-10 items-center justify-center rounded-lg ${iconClass}`}>
          {Icon ? <Icon className={`size-6 ${iconColor}`} /> : null}
        </div>
        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={confirmEdit} className="text-success hover:opacity-80" aria-label={`Save ${label}`}>
                <Check className="size-4" />
              </button>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={cancelEdit} className="text-muted-foreground hover:opacity-80" aria-label={`Cancel ${label}`}>
                <X className="size-4" />
              </button>
            </>
          ) : (
            <button type="button" onClick={startEdit} className="cursor-pointer text-muted-foreground opacity-70 hover:opacity-100" aria-label={`Edit ${label}`}>
              <Pencil className="size-3.5" />
            </button>
          )}
        </div>
      </div>
      <h3 className="mt-4 text-sm text-muted-foreground">{label}</h3>
      <div className="mt-1 flex items-center justify-between gap-1 w-full flex-1">
        {isEditing ? (
          <input type="number" step={step} value={draft} onChange={(e) => setDraft(e.target.value)} className="w-2/3 rounded-md border border-input bg-background px-2 py-1 text-2xl font-semibold" placeholder={placeholder} autoFocus onBlur={handleBlur} onKeyDown={(e) => { if (e.key === "Enter") confirmEdit(); if (e.key === "Escape") cancelEdit(); }} />
        ) : (
          <span className="text-2xl font-semibold tracking-tight">{displayValue || "0"}</span>
        )}
        {!isEditing && (
          <button type="button" onClick={toggleUnit} className="flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-xs font-medium hover:bg-accent transition-colors">
            <span className={!useImperial ? "text-primary" : "text-muted-foreground"}>{unit}</span>
            <span className="text-muted-foreground">/</span>
            <span className={useImperial ? "text-primary" : "text-muted-foreground"}>{unitImperial}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export const celsiusToFahrenheit = (celsius) => {
  const num = parseFloat(celsius);
  if (isNaN(num)) return "";
  return ((num * 9) / 5 + 32).toFixed(1);
};

export const fahrenheitToCelsius = (fahrenheit) => {
  const num = parseFloat(fahrenheit);
  if (isNaN(num)) return "";
  return (((num - 32) * 5) / 9).toFixed(1);
};

export const cmToInches = (cm) => {
  const num = parseFloat(cm);
  if (isNaN(num)) return "";
  return (num / 2.54).toFixed(1);
};

export const inchesToCm = (inches) => {
  const num = parseFloat(inches);
  if (isNaN(num)) return "";
  return (num * 2.54).toFixed(1);
};

export const kgToLbs = (kg) => {
  const num = parseFloat(kg);
  if (isNaN(num)) return "";
  return (num * 2.20462).toFixed(1);
};

export const lbsToKg = (lbs) => {
  const num = parseFloat(lbs);
  if (isNaN(num)) return "";
  return (num / 2.20462).toFixed(1);
};

export default UnitConversionCard;