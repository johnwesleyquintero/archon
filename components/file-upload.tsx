"use client";

import { CheckCircle, Loader2, UploadCloud, XCircle } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type React from "react";

interface FileUploadProps {
  onUpload: (
    file: File,
  ) => Promise<{ success: boolean; url?: string; error?: Error }>;
  accept?: string; // e.g., "image/*", "application/pdf", "image/png,image/jpeg"
  buttonText?: string;
  disabled?: boolean;
}

export function FileUpload({
  onUpload,
  accept,
  buttonText = "Upload File",
  disabled,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
        setFile(event.target.files[0]);
        setUploadStatus("idle");
        setErrorMessage(null);
      }
    },
    [],
  );

  const handleUpload = useCallback(async () => {
    if (!file) {
      setErrorMessage("Please select a file first.");
      return;
    }

    setUploadStatus("uploading");
    setErrorMessage(null);

    try {
      const result = await onUpload(file);
      if (result.success) {
        setUploadStatus("success");
        setFile(null); // Clear file input after successful upload
      } else {
        setUploadStatus("error");
        setErrorMessage(result.error?.message || "File upload failed.");
      }
    } catch (err: unknown) {
      setUploadStatus("error");
      let errorMessageText = "An unexpected error occurred during upload.";
      if (err instanceof Error) {
        errorMessageText = err.message;
      } else if (
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as { message: unknown }).message === "string"
      ) {
        errorMessageText = (err as { message: string }).message;
      }
      setErrorMessage(errorMessageText);
    }
  }, [file, onUpload]);

  return (
    <div className="space-y-3 p-4 border border-slate-200 rounded-md bg-slate-50">
      <Label htmlFor="file-upload" className="sr-only">
        {buttonText}
      </Label>
      <div className="flex items-center gap-3">
        <Input
          id="file-upload"
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="flex-1"
          disabled={uploadStatus === "uploading" || disabled}
        />
        <Button
          onClick={() => {
            void handleUpload();
          }}
          disabled={!file || uploadStatus === "uploading" || disabled}
          className="shrink-0 bg-slate-900 hover:bg-slate-800"
        >
          {uploadStatus === "uploading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <UploadCloud className="mr-2 h-4 w-4" /> {buttonText}
            </>
          )}
        </Button>
      </div>

      {file && uploadStatus === "idle" && (
        <p className="text-sm text-slate-600">Selected: {file.name}</p>
      )}

      {uploadStatus === "success" && (
        <div className="flex items-center text-green-600 text-sm">
          <CheckCircle className="mr-2 h-4 w-4" /> Upload successful!
        </div>
      )}

      {uploadStatus === "error" && errorMessage && (
        <div className="flex items-center text-red-600 text-sm">
          <XCircle className="mr-2 h-4 w-4" /> {errorMessage}
        </div>
      )}
    </div>
  );
}
