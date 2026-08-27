"use client";

import React, { useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import { ZoomIn, ZoomOut } from "lucide-react";

const getCroppedImg = (imageSrc, pixelCrop) => {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.crossOrigin = "anonymous";
    image.src = imageSrc;

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Unable to create canvas context"));
        return;
      }

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }

          const file = new File([blob], "cropped-image.jpg", {
            type: "image/jpeg",
          });

          resolve(file);
        },
        "image/jpeg",
        0.9
      );
    };

    image.onerror = () => {
      reject(new Error("Failed to load image"));
    };
  });
};

const ImageCropper = ({
  image,
  open,
  onClose,
  onCrop,
  aspect = 1,
  cropShape = "round",
  maxZoom = 3,
  minZoom = 1,
  initialZoom = 1,
  title = "Adjust Image",
  description = "Drag the image and adjust the zoom.",
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(initialZoom);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(initialZoom);
      setCroppedAreaPixels(null);
      setError("");
    }
  }, [open, image, initialZoom]);

  if (!open || !image) {
    return null;
  }

  const handleCropComplete = (_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    try {
      setLoading(true);
      setError("");

      const croppedFile = await getCroppedImg(image, croppedAreaPixels);

      await onCrop(croppedFile);

      onClose();
    } catch (err) {
      console.error("Crop failed:", err);
      setError("Unable to crop image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-[500px] rounded-2xl bg-background p-5 shadow-xl">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>

          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        {/* Cropper */}
        <div className="relative h-[350px] overflow-hidden rounded-xl bg-black">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            showGrid={false}
            minZoom={minZoom}
            maxZoom={maxZoom}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        {/* Zoom */}
        <div className="mt-5 flex items-center gap-3">
          <ZoomOut className="size-4 text-muted-foreground" />

          <input
            type="range"
            min={minZoom}
            max={maxZoom}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />

          <ZoomIn className="size-4 text-muted-foreground" />
        </div>

        {/* Error */}
        {error && (
          <p className="mt-3 text-xs text-destructive">
            {error}
          </p>
        )}

        {/* Buttons */}
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Photo"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
