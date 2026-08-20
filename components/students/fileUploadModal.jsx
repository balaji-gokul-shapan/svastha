"use client";

import { useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  IdCard,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const ALLOWED_EXTENSIONS = ["csv", "xls", "xlsx"];

const getFileExtension = (fileName = "") =>
  String(fileName).split(".").pop()?.toLowerCase() ?? "";

const isValidUploadFile = (file) => {
  if (!file?.name) {
    return false;
  }

  const extension = getFileExtension(file.name);
  return ALLOWED_EXTENSIONS.includes(extension);
};

const formatFileSize = (size = 0) => {
  if (!Number.isFinite(size) || size <= 0) {
    return "0 KB";
  }

  const kb = size / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  return `${(kb / 1024).toFixed(2)} MB`;
};

export default function FileUploadModal({ onUpload, onDownloadTemplate }) {
  const [open, setOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  const resetState = () => {
    setIsDragging(false);
    setSelectedFile(null);
    setErrorMessage("");
    setIsUploading(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleClose = () => {
    setOpen(false);
    resetState();
  };

  const handleFileSelection = (file) => {
    if (!file) {
      return;
    }

    if (!isValidUploadFile(file)) {
      setSelectedFile(null);
      setErrorMessage("Please upload a valid CSV, XLS, or XLSX file.");
      return;
    }

    setSelectedFile(file);
    setErrorMessage("");
  };

  const handleInputChange = (event) => {
    const [file] = Array.from(event.target.files || []);
    handleFileSelection(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const [file] = Array.from(event.dataTransfer?.files || []);
    handleFileSelection(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading) {
      return;
    }

    try {
      setIsUploading(true);
      if (typeof onUpload === "function") {
        await onUpload(selectedFile);
      }
      handleClose();
    } catch (error) {
      setErrorMessage(error?.message || "Upload failed. Please try again.");
      setIsUploading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="py-4"
        onClick={() => setOpen(true)}
      >
        <Upload className="icon-lg" />  <span className="hidden md:block">Upload Document</span>
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-[95vw] max-h-[90vh] max-w-4xl overflow-y-auto rounded-xl border border-border bg-card p-0 shadow-xl motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:slide-in-from-top-2 motion-safe:duration-200">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="absolute right-1 top-1 z-10"
              aria-label="Close file upload modal"
            >
              <X className="size-4" />
            </Button>
            <div className="border-b px-5 py-4 sm:px-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Add Students by File Upload</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Upload CSV or Excel file with student records.
                  </p>
                </div>
               
              </div>
            </div>

            <div className="space-y-5 px-5 py-5 sm:px-7">
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={handleInputChange}
                className="hidden"
              />

              <section
              onClick={() => inputRef.current?.click()}
                className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors sm:p-8 ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border bg-muted/20"
                }`}
                onDragEnter={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsDragging(true);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsDragging(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsDragging(false);
                }}
                onDrop={handleDrop}
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Upload className="size-6" />
                </div>
                <p className="mt-4 text-sm font-semibold text-foreground">
                  Drag and drop student file here
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Supported formats: .csv, .xls, .xlsx
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  
                >
                  Choose File
                </Button>
              </section>

              <section className="grid gap-3 rounded-xl border bg-background p-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <FileSpreadsheet className="mt-0.5 size-4 text-primary" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Required columns</p>
                    <p className="text-xs text-muted-foreground">
                      name, admission_number, class, section, gender, dob, school_name
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 size-4 text-primary" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Format tips</p>
                    <p className="text-xs text-muted-foreground">
                      Keep first row as headers and avoid empty required fields.
                    </p>
                  </div>
                </div>
              </section>

              {selectedFile ? (
                <section className="rounded-xl border border-success/30 bg-success/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(selectedFile.size)} • {getFileExtension(selectedFile.name).toUpperCase()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-success">
                      <CheckCircle2 className="size-4" />
                      Ready to upload
                    </div>
                  </div>
                </section>
              ) : null}

              {errorMessage ? (
                <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                  <div className="flex items-start gap-2 text-destructive">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    <p className="text-sm">{errorMessage}</p>
                  </div>
                </section>
              ) : null}

              <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
                <Button type="button" variant="outline" onClick={handleClose}>
                  <X className="size-4" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                >
                  <Upload className="size-4" />
                  {isUploading ? "Uploading..." : "Upload Students"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
