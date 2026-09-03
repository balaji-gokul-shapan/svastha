"use client";

import { useRef, useState } from "react";
import { Check, Pencil, X } from "lucide-react";

/**
 * TemperatureCard - A vitals card with Celsius/Fahrenheit toggle.
 *
 * Features:
 * - Inline edit-in-place for temperature value
 * - Toggle switch between °C and °F
 * - Automatic conversion when switching units
 * - Saves the value in Celsius (converts Fahrenheit input to Celsius)
 *
 * Props:
 *   value        — current temperature value in Celsius (string)
 *   onChange     — (nextValueInCelsius) => void; called on confirm
 *   icon         — icon component to render
 *   iconClass    — classes for the icon tile background
 *   iconColor    *   placeholder  — edit input placeholder
 */

const celsiusToFahrenheit = (celsius) => {
  const num = parseFloat(celsius);
  if (isNaN(num)) return "";
  return ((num * 9) / 5 + 32).toFixed(1);
};

const fahrenheitToCelsius = (fahrenheit) => {
  const num = parseFloat(fahrenheit);
  if (isNaN(num)) return "";
  return (((num - 32) * 5) / 9).toFixed(1);
};

const TemperatureCard = ({
  value,
  onChange,
  icon: Icon,
  iconClass = "bg-domain-physical/10",
  iconColor = "text-domain-physical",
  placeholder = "0",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [unit, setUnit] = useState("C"); // "C" for Celsius, "F" for Fahrenheit
  const editingRef = useRef(false);

  // Get display value based on current unit
  const getDisplayValue = () => {
    if (!value || value === "0") return "0";
    if (unit === "F") {
      return celsiusToFahrenheit(value);
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

    // Convert to Celsius if in Fahrenheit mode
    let valueInCelsius = draft;
    if (unit === "F" && draft.trim() !== "") {
      valueInCelsius = fahrenheitToCelsius(draft);
    }

    onChange?.(valueInCelsius);
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
    if (unit === "C") {
      setUnit("F");
    } else {
      setUnit("C");
    }
  };

  const displayValue = getDisplayValue();

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
                aria-label="Save Temperature"
              >
                <Check className="size-4" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={cancelEdit}
                className="text-muted-foreground hover:opacity-80"
                aria-label="Cancel Temperature"
              >
                <X className="size-4" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={startEdit}
              className="cursor-pointer text-muted-foreground opacity-70 hover:opacity-100"
              aria-label="Edit Temperature"
            >
              <Pencil className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <h3 className="mt-4 text-sm text-muted-foreground">Temperature</h3>

      <div className="mt-1 flex items-center justify-between gap-1 w-full flex-1">
        {isEditing ? (
          <input
            type="number"
            step="0.1"
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
            {displayValue || "0"}
          </span>
        )}
        {!isEditing && (
          <button
            type="button"
            onClick={toggleUnit}
            className="flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-xs font-medium hover:bg-accent transition-colors"
            title={`Switch to ${unit === "C" ? "Fahrenheit" : "Celsius"}`}
          >
            <span className={unit === "C" ? "text-primary" : "text-muted-foreground"}>
              °C
            </span>
            <span className="text-muted-foreground">/</span>
            <span className={unit === "F" ? "text-primary" : "text-muted-foreground"}>
              °F
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default TemperatureCard;