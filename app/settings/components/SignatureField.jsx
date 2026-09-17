"use client";

import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

function SignatureEditor({ onSave, onCancel }) {
  const padRef = useRef(null);
  const containerRef = useRef(null);
  const [error, setError] = useState("");
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const pad = padRef.current;
    const container = containerRef.current;
    let previousWidth = 0;
    let previousRatio = 0;
    const resize = () => {
      const width = container.clientWidth;
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      if (!width || (width === previousWidth && ratio === previousRatio)) return;
      const points = pad.toData();
      const scale = previousWidth ? width / previousWidth : 1;
      const canvas = pad.getCanvas();
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(220 * ratio);
      canvas.getContext("2d").scale(ratio, ratio);
      pad.clear();
      pad.fromData(points.map((group) => ({
        ...group,
        points: group.points.map((point) => ({ ...point, x: point.x * scale })),
      })));
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

  const clear = () => {
    padRef.current?.clear();
    setHasInk(false);
    setError("");
  };

  const save = () => {
    if (!padRef.current || padRef.current.isEmpty()) {
      setError("Please draw your signature before saving.");
      return;
    }
    try {
      onSave(padRef.current.getTrimmedCanvas().toDataURL("image/png"));
    } catch {
      setError("Unable to create the signature image. Please try again.");
    }
  };

  return (
    <>
      <div ref={containerRef} className="mt-4 overflow-hidden rounded-md border border-border bg-white">
        <SignatureCanvas
          ref={padRef}
          penColor="#172554"
          minWidth={0.7}
          maxWidth={2.5}
          clearOnResize={false}
          onEnd={() => {
            setHasInk(!padRef.current.isEmpty());
            setError("");
          }}
          canvasProps={{
            className: "block h-[220px] w-full touch-none",
            "aria-label": "Draw your signature using a mouse, touch screen, or stylus",
            "aria-describedby": "signature-help",
          }}
        />
      </div>
      <p id="signature-help" className="mt-2 text-xs text-muted-foreground">
        Draw with your mouse, finger, or stylus. Clear the canvas to start again.
      </p>
      {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={clear}>Clear</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="button" disabled={!hasInk} onClick={save}>Use signature</Button>
      </DialogFooter>
    </>
  );
}

export default function SignatureField({ value = "", onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="mt-6 border-t border-border pt-5" aria-labelledby="signature-heading">
      <h4 id="signature-heading" className="text-sm font-semibold">E-signature</h4>
      <p className="mt-1 text-sm text-muted-foreground">
        Create a handwritten signature for your profile. This draft is not saved to the server;
        download a copy to keep it after leaving settings.
      </p>
      {value && (
        <div className="mt-3 flex h-28 max-w-4xl items-center justify-center rounded-md border border-border bg-white p-4">
          {/* The signature is a locally generated PNG, not a remote image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Your signature preview" className="max-h-full max-w-full object-contain" />
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" onClick={() => setOpen(true)}>
          <PenLine className="size-4" />
          {value ? "Replace signature" : "Create signature"}
        </Button>
        {value && (
          <>
            <a href={value} download="signature.png" className="rounded-md px-3 py-2 text-sm font-medium text-primary underline focus-visible:outline-2">
              Download PNG
            </a>
            <Button type="button" variant="outline" onClick={() => onChange("")}>Remove</Button>
          </>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-4xl">
          <DialogHeader>
            <DialogTitle>{value ? "Replace e-signature" : "Create e-signature"}</DialogTitle>
            <DialogDescription>
              Draw below, then choose Use signature to attach it to your profile draft.
              Cancelling keeps your previous signature unchanged.
            </DialogDescription>
          </DialogHeader>
          {open && <SignatureEditor onCancel={() => setOpen(false)} onSave={(image) => {
            onChange(image);
            setOpen(false);
          }} />}
        </DialogContent>
      </Dialog>
    </section>
  );
}
