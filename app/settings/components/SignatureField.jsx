"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import SignatureCanvas from "react-signature-canvas";
import { PenLine, Signature, Type } from "lucide-react";

import { normalizeSignatureUrl } from "@/lib/signature-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReusableSelect from "@/components/ui/reusable-select";
import { TextField } from "@/components/ui/text-field";

/* =========================================================
   SVG -> PNG
========================================================= */

function svgToPng(svgElement) {
  return new Promise((resolve) => {
    try {
      if (!svgElement) {
        resolve(null);
        return;
      }

      const serializer = new XMLSerializer();

      const svgString = serializer.serializeToString(svgElement);

      const blob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });

      const url = URL.createObjectURL(blob);

      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");

        canvas.width = 800;
        canvas.height = 200;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve(null);
          return;
        }

        // White background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/png");

        URL.revokeObjectURL(url);

        resolve(dataUrl);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };

      img.src = url;
    } catch (error) {
      console.error("SVG to PNG error:", error);
      resolve(null);
    }
  });
}

/* =========================================================
   TYPE SIGNATURE EDITOR
========================================================= */

function TypeFormatEditor(props) {
  const { onSave, onCancel, initialText = "" } = props;

  const [typedText, setTypedText] = useState(initialText);

  const [fontFamily, setFontFamily] = useState("serif");

  const [fontSize, setFontSize] = useState(48);

  const [fontStyle, setFontStyle] = useState("italic");

  const [fontWeight, setFontWeight] = useState("normal");

  const [fontColor, setFontColor] = useState("#172554");

  const [letterSpacing, setLetterSpacing] = useState(1);

  const [error, setError] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const svgRef = useRef(null);

  const [previewUrl, setPreviewUrl] = useState("");

  /* =========================================================
     Generate preview
  ========================================================= */

  const fontOptions = [
    {
      label: "Serif",
      value: "serif",
    },
    {
      label: "Times New Roman",
      value: "'Times New Roman', Times, serif",
    },
    {
      label: "Georgia",
      value: "Georgia, serif",
    },
    {
      label: "Brush Script",
      value: "'Brush Script MT', 'Segoe Script', cursive",
    },
    {
      label: "Segoe Script",
      value: "'Segoe Script', cursive",
    },
    {
      label: "Comic Sans",
      value: "'Comic Sans MS', cursive",
    },
    {
      label: "Lucida Handwriting",
      value: "'Lucida Handwriting', cursive",
    },
    {
      label: "Sans Serif",
      value: "sans-serif",
    },
  ];

  useEffect(() => {
    let objectUrl = null;

    const generatePreview = async () => {
      if (!typedText.trim() || !svgRef.current) {
        setPreviewUrl("");
        return;
      }

      try {
        const serializer = new XMLSerializer();

        const svgString = serializer.serializeToString(svgRef.current);

        const blob = new Blob([svgString], {
          type: "image/svg+xml;charset=utf-8",
        });

        objectUrl = URL.createObjectURL(blob);

        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement("canvas");

          canvas.width = 800;
          canvas.height = 200;

          const ctx = canvas.getContext("2d");

          if (!ctx) {
            setPreviewUrl("");
            return;
          }

          ctx.fillStyle = "#ffffff";

          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          setPreviewUrl(canvas.toDataURL("image/png"));

          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
          }
        };

        img.onerror = () => {
          setPreviewUrl("");

          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
          }
        };

        img.src = objectUrl;
      } catch (error) {
        console.error("Signature preview error:", error);

        setPreviewUrl("");
      }
    };

    generatePreview();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [
    typedText,
    fontFamily,
    fontSize,
    fontStyle,
    fontWeight,
    fontColor,
    letterSpacing,
  ]);

  /* =========================================================
     Save
  ========================================================= */

  const handleSave = useCallback(async () => {
    if (!typedText.trim()) {
      setError("Please type your name before saving.");
      return;
    }

    if (!svgRef.current) {
      setError("Unable to generate signature. Please try again.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const dataUrl = await svgToPng(svgRef.current);

      if (!dataUrl) {
        setError("Unable to create the signature image. Please try again.");

        return;
      }

      onSave(dataUrl);
    } catch (error) {
      console.error("Signature save error:", error);

      setError("Unable to create the signature image. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [typedText, onSave]);

  /* =========================================================
     Clear
  ========================================================= */

  const handleClear = useCallback(() => {
    setTypedText("");

    setPreviewUrl("");

    setError("");
  }, []);

  return (
    <>
      {/* =====================================================
          NAME
      ===================================================== */}

      <div className="mt-4">
        <label
          htmlFor="signature-text"
          className="block text-sm font-medium text-foreground"
        >
          Type your name
        </label>

        <Input
          id="signature-text"
          type="text"
          value={typedText}
          onChange={(e) => {
            setTypedText(e.target.value);
            setError("");
          }}
          placeholder="Enter your full name"
          className="mt-2 w-full"
          autoFocus
          maxLength={80}
        />

        <p className="mt-1 text-xs text-muted-foreground">
          Your name will be rendered in a signature-style font.
        </p>
      </div>

      {/* =====================================================
          SIGNATURE PREVIEW
      ===================================================== */}

      <div className="mt-5">
        <label className="text-sm font-medium">Preview</label>

        <div className="mt-2 flex min-h-[180px] items-center justify-center overflow-hidden rounded-md border border-border bg-white p-4">
          {!typedText.trim() ? (
            <p className="text-sm text-muted-foreground">
              Type your name above to preview
            </p>
          ) : previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Your typed signature preview"
              className="h-auto max-h-[150px] w-full max-w-[700px] object-contain"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Generating preview...
            </p>
          )}
        </div>
      </div>

      {/* =====================================================
          FONT SETTINGS
      ===================================================== */}

      <div className="mt-5 rounded-md border border-border p-4">
        <h4 className="text-sm font-semibold">Signature style</h4>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* FONT FAMILY */}

          <div>
            {/* <label htmlFor="signature-font" className="text-sm font-medium">
              Font
            </label> */}

            <ReusableSelect
              label="Font"
              aria-label="Font"
              id="signature-font"
              value={fontFamily}
              onChange={(value) => setFontFamily(value)}
              options={fontOptions}
              // className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>

          {/* FONT SIZE */}

          <div>
            <div className="flex items-center justify-between">
              {/* <label htmlFor="signature-size" className="text-sm font-medium">
                Font size
              </label> */}

              <span className="text-xs text-muted-foreground">
                {fontSize}px
              </span>
            </div>

            <TextField
              label="Font size"
              aria-label="Font size"
              id="signature-size"
              type="range"
              min="20"
              max="80"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="mt-3 w-full cursor-pointer"
            />
          </div>

          {/* FONT STYLE */}

          <div>
            {/* <label htmlFor="signature-style" className="text-sm font-medium">
              Font style
            </label> */}

            <ReusableSelect
              label="Font style"
              aria-label="Font style"
              id="signature-style"
              value={fontStyle}
              onChange={(value) => setFontStyle(value)}
              options={[
                { label: "Normal", value: "normal" },
                { label: "Italic", value: "italic" },
                { label: "Oblique", value: "oblique" },
              ]}
              // className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>

          {/* FONT WEIGHT */}

          <div>
            {/* <label htmlFor="signature-weight" className="text-sm font-medium">
              Font weight
            </label> */}

            <ReusableSelect
              id="signature-weight"
              aria-label="Font weight"
              label="Font weight"
              value={fontWeight}
              onChange={(value) => setFontWeight(value)}
              options={[
                { label: "Normal", value: "normal" },
                { label: "Bold", value: "bold" },
                { label: "Semi Bold", value: "500" },
              ]}
              // className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>

          {/* LETTER SPACING */}

          <div>
            <div className="flex items-center justify-between">
              {/* <label
                htmlFor="signature-spacing"
                className="text-sm font-medium"
              >
                Letter spacing
              </label> */}

              <span className="text-xs text-muted-foreground">
                {letterSpacing}px
              </span>
            </div>

            <TextField
              label="Letter spacing"
              id="signature-spacing"
              type="range"
              min="-2"
              max="8"
              step="0.5"
              value={letterSpacing}
              onChange={(e) => setLetterSpacing(Number(e.target.value))}
              className="mt-3 w-full cursor-pointer"
            />
          </div>

          {/* COLOR */}

          <div>
            <label htmlFor="signature-color" className="text-sm font-medium">
              Text color
            </label>

            <div className="mt-2 flex gap-2">
              <input
                id="signature-color"
                type="color"
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
                className="h-10 w-12 cursor-pointer rounded-md border p-1"
              />

              <Input
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
                placeholder="#172554"
              />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          HIDDEN SVG
          This is the source used to generate PNG.
      ===================================================== */}

      <svg
        ref={svgRef}
        className="absolute -left-[9999px] top-0"
        xmlns="http://www.w3.org/2000/svg"
        width="800"
        height="200"
        viewBox="0 0 800 200"
        aria-hidden="true"
      >
        {/* White background */}

        <rect x="0" y="0" width="800" height="200" fill="#ffffff" />

        {/* Signature */}

        <text
          x="400"
          y="120"
          fontSize={fontSize}
          fontFamily={fontFamily}
          fontStyle={fontStyle}
          fontWeight={fontWeight}
          fill={fontColor}
          textAnchor="middle"
          letterSpacing={letterSpacing}
        >
          {typedText}
        </text>
      </svg>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <DialogFooter className="mt-5">
        <Button type="button" variant="outline" onClick={handleClear}>
          Clear
        </Button>

        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>

        <Button
          type="button"
          disabled={!typedText.trim() || isSaving}
          onClick={handleSave}
        >
          {isSaving ? "Saving..." : "Use signature"}
        </Button>
      </DialogFooter>
    </>
  );
}

/* =========================================================
   HANDWRITTEN SIGNATURE EDITOR
========================================================= */

function HandwrittenEditor(props) {
  const { onSave, onCancel } = props;

  const padRef = useRef(null);

  const containerRef = useRef(null);

  const [error, setError] = useState("");

  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const pad = padRef.current;

    const container = containerRef.current;

    let previousWidth = 0;

    let previousRatio = 0;

    if (!pad || !container) {
      return;
    }

    const resize = () => {
      const width = container.clientWidth;

      const ratio = Math.max(window.devicePixelRatio || 1, 1);

      if (!width || (width === previousWidth && ratio === previousRatio)) {
        return;
      }

      const points = pad.toData() || [];

      const scale = previousWidth ? width / previousWidth : 1;

      const canvas = pad.getCanvas();

      if (canvas) {
        canvas.width = Math.round(width * ratio);

        canvas.height = Math.round(220 * ratio);

        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.scale(ratio, ratio);
        }
      }

      pad.clear();

      if (points.length > 0) {
        pad.fromData(
          points.map((group) => ({
            ...group,

            points: group.points.map((point) => ({
              ...point,
              x: point.x * scale,
            })),
          })),
        );
      }

      previousWidth = width;

      previousRatio = ratio;
    };

    resize();

    const observer = new ResizeObserver(resize);

    observer.observe(container);

    window.addEventListener("resize", resize);

    return () => {
      observer.disconnect();

      window.removeEventListener("resize", resize);
    };
  }, []);

  /* =========================================================
     Clear handwritten
  ========================================================= */

  const clear = () => {
    padRef.current?.clear();
    setHasInk(false);
    setError("");
  };

  /* =========================================================
     Save handwritten
  ========================================================= */

  const save = () => {
    const pad = padRef.current;

    if (!pad || pad.isEmpty()) {
      setError("Please draw your signature before saving.");

      return;
    }

    try {
      const image = pad.getTrimmedCanvas().toDataURL("image/png");

      onSave(image);
    } catch (error) {
      console.error("Handwritten signature error:", error);

      setError("Unable to create the signature image.");
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        className="mt-4 overflow-hidden rounded-md border border-border bg-white"
      >
        <SignatureCanvas
          ref={padRef}
          penColor="#172554"
          minWidth={0.7}
          maxWidth={2.5}
          clearOnResize={false}
          onEnd={() => {
            setHasInk(!padRef.current?.isEmpty());

            setError("");
          }}
          canvasProps={{
            className: "block h-[220px] w-full touch-none",
            "aria-label":
              "Draw your signature using a mouse, touch screen, or stylus",
            "aria-describedby": "signature-help",
          }}
        />
      </div>

      <p id="signature-help" className="mt-2 text-xs text-muted-foreground">
        Draw with your mouse, finger, or stylus. Clear the canvas to start
        again.
      </p>

      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <DialogFooter className="mt-5">
        <Button type="button" variant="outline" onClick={clear}>
          Clear
        </Button>

        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="button" disabled={!hasInk} onClick={save}>
          Use signature
        </Button>
      </DialogFooter>
    </>
  );
}

/* =========================================================
   MAIN SIGNATURE FIELD
========================================================= */

export default function SignatureField(props) {
  const {
    value = "",
    onChange,
    onRemove,
    onEventChange = null,
    selectedEventId = "",
    assignedEvents,
    isEventsLoading = false,
    eventsError = null,
    isBusy = false,
    disabled = false,
    isPrimary,
  } = props;

  const [open, setOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("handwritten");

  const [typedSignature, setTypedSignature] = useState("");
  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState("cursive");
  const [signatureColor, setSignatureColor] = useState("#172554");

  const signatureCanvasRef = useRef(null);

  // "loading" | "loaded" | "empty" | "error"
  // Image load status per normalized URL. Stored per URL so a new signature
  // value always starts at "loading" without any setState-in-effect sync.
  const [imageStatus, setImageStatus] = useState({});

  const handleImageLoad = () => {
    setImageStatus((previous) => ({ ...previous, [normalizedValue]: "loaded" }));
  };

  const handleImageError = () => {
    setImageStatus((previous) => ({ ...previous, [normalizedValue]: "error" }));
  };

  const handleClear = () => {
    setTypedSignature("");
    onChange?.("");
  };

  const handleRetryImage = () => {
    setImageStatus((previous) => ({ ...previous, [normalizedValue]: "loading" }));
  };

  const isNewSignature =
    typeof value === "string" && value.trim().startsWith("data:image/");
  const normalizedValue = normalizeSignatureUrl(value);

  const hasNormalizedValue = Boolean(normalizedValue);

  const signatureImageState = hasNormalizedValue
    ? imageStatus[normalizedValue] ?? "loading"
    : "empty";

  // A signature exists whenever we have a usable URL or a freshly drawn one;
  // that is what decides "Preview + Replace + Remove" versus "Create".
  const hasSignature = hasNormalizedValue || isNewSignature;

  const openEditor = () => {
    setActiveTab("handwritten");
    setOpen(true);
  };

  // A freshly drawn signature is only local state — clearing it must not call
  // the parent's delete handler for an already saved signature.
  const handleRemoveSignature = () => {
    if (isNewSignature || !onRemove) {
      handleClear();
      return;
    }

    onRemove();
  };

  const eventOptions = (() => {
    const safeEvents = Array.isArray(assignedEvents) ? assignedEvents : [];

    /* A leading "no camp" option so the picker can start unselected rather than
       implicitly defaulting to the first event. Its value is "" — falsy — so
       `resolvedEventId` below correctly reads it as "nothing chosen" instead
       of silently selecting the first real camp. */
    return [
      { value: "", label: "Select an option" },
      ...safeEvents.map((event) => ({
        value: String(event?.id ?? event?.Id ?? event?.event_id ?? ""),
        label: String(
          event?.name ?? event?.event_name ?? event?.title ?? "Event",
        ),
      })),
    ];
  })();


  const [internalEventId, setInternalEventId] = useState("");

  const parentEventId = selectedEventId ? String(selectedEventId) : "";
  const controlledEventId = parentEventId || internalEventId;

  /* No implicit default: with nothing chosen the dropdown stays on the
     "Select an option" placeholder. Reading `eventOptions[0]` would be a no-op
     anyway — that entry IS the placeholder. */
  const resolvedEventId = controlledEventId;

  return (
    <section
      className=""
      aria-labelledby="signature-heading"
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <h4 id="signature-heading" className="text-sm font-semibold flex flex-row items-center gap-2">
        <Signature color="#ffffff" />
        E-signature
      </h4>

      <p className="mt-1 text-sm text-muted-foreground">
        Create a signature for your profile by drawing it or typing your name.
      </p>

      {/* =====================================================
          CAMP / EVENT PICKER
          Paired with the signature actions rather than sitting on its own row:
          it belongs to the signature, not the profile, so the association is
          obvious at a glance.
          ===================================================== */}

      {eventOptions.length > 1 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Camp</span>
          <div className="min-w-[200px] flex-1">
            <ReusableSelect
              options={eventOptions}
              value={resolvedEventId || undefined}
              onChange={(nextValue) => {
                const nextId = String(nextValue ?? "");
                setInternalEventId(nextId);
                onEventChange?.(nextId);
              }}
              placeholder={
                isEventsLoading
                  ? "Loading camps…"
                  : eventsError
                    ? "Could not load camps"
                    : "Select a camp"
              }
            />
          </div>
        </div>
      )}

      {/* =====================================================
          SAVED SIGNATURE PREVIEW
      ===================================================== */}

      {hasSignature && (
        <div className="w-full overflow-hidden rounded-xl border bg-background">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
            <div>
              <p className="text-sm font-medium">Signature Preview</p>

              <p className="text-xs text-muted-foreground">
                {isNewSignature ? "Not saved yet" : "Saved signature"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openEditor}
                disabled={disabled || isBusy}
              >
                <PenLine className="size-4" />
                Replace
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveSignature}
                disabled={disabled || isBusy}
              >
                Remove
              </Button>
            </div>
          </div>

          <div className="flex min-h-[160px] w-full items-center justify-center bg-white p-4">
            {signatureImageState === "error" ? (
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <p className="text-sm font-medium text-destructive">
                  Signature preview unavailable
                </p>

                <p className="max-w-full text-xs text-muted-foreground">
                  The saved signature image could not be loaded. You can
                  replace it below.
                </p>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRetryImage}
                  disabled={isBusy}
                >
                  Reload
                </Button>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={normalizedValue}
                alt="Saved signature"
                className="max-h-[180px] max-w-full object-contain"
                referrerPolicy="no-referrer"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          CREATE ACTION (only when nothing is saved yet)
      ===================================================== */}

      {!hasSignature && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={openEditor}
            disabled={disabled}
          >
            <PenLine className="size-4" />
            Create signature
          </Button>
        </div>
      )}

      {/* =====================================================
          DIALOG
      ===================================================== */}

      <Dialog
        open={open}
        onOpenChange={(newState) => {
          setOpen(newState);

          if (newState) {
            setActiveTab("handwritten");
          }
        }}
      >
        <DialogContent className="w-full max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {value ? "Replace e-signature" : "Create e-signature"}
            </DialogTitle>

            <DialogDescription>
              Choose how you want to create your signature: draw it by hand or
              type your name and customize its style.
            </DialogDescription>
          </DialogHeader>

          {/* =================================================
              TABS
          ================================================= */}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="handwritten">
                <PenLine className="mr-2 size-4" />
                Handwritten
              </TabsTrigger>

              <TabsTrigger value="type">
                <Type className="mr-2 size-4" />
                Type & Format
              </TabsTrigger>
            </TabsList>

            {/* ===============================================
                HANDWRITTEN
            =============================================== */}

            <TabsContent value="handwritten" className="mt-0">
              <HandwrittenEditor
                onSave={(image) => {
                  onChange(image);
                  setOpen(false);
                }}
                onCancel={() => setOpen(false)}
              />
            </TabsContent>

            {/* ===============================================
                TYPE
            =============================================== */}

            <TabsContent value="type" className="mt-0">
              <TypeFormatEditor
                onSave={(dataUrl) => {
                  onChange(dataUrl);
                  setOpen(false);
                }}
                onCancel={() => setOpen(false)}
                initialText=""
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </section>
  );
}
