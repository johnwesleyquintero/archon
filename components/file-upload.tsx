"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2, Check, File } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onUpload: (file: File) => Promise<{ url: string; success: boolean; error?: any }>
  accept?: string
  maxSize?: number // in MB
  className?: string
  buttonText?: string
}

export function FileUpload({
  onUpload,
  accept = "image/*",
  maxSize = 5, // Default 5MB
  className,
  buttonText = "Upload File",
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0])
    }
  }

  const handleFileSelection = (file: File) => {
    setUploadError(null)
    setUploadSuccess(false)

    // Validate file type
    if (!file.type.match(accept.replace(/\*/g, ".*"))) {
      setUploadError(`Invalid file type. Please select a ${accept.replace("*", "")} file.`)
      return
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(`File is too large. Maximum size is ${maxSize}MB.`)
      return
    }

    setSelectedFile(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const result = await onUpload(selectedFile)

      if (result.success) {
        setUploadSuccess(true)
        setSelectedFile(null)
      } else {
        setUploadError("Upload failed. Please try again.")
      }
    } catch (error) {
      setUploadError("An unexpected error occurred. Please try again.")
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setUploadError(null)
    setUploadSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragging ? "border-slate-400 bg-slate-50" : "border-slate-200",
          uploadSuccess ? "border-green-200 bg-green-50" : "",
          uploadError ? "border-red-200 bg-red-50" : "",
          "hover:border-slate-300",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileInputChange} className="hidden" />

        {uploadSuccess ? (
          <div className="flex flex-col items-center justify-center text-green-600">
            <Check className="h-10 w-10 mb-2" />
            <p className="text-sm font-medium">File uploaded successfully!</p>
            <Button variant="ghost" size="sm" onClick={resetUpload} className="mt-2">
              Upload another file
            </Button>
          </div>
        ) : selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-slate-700">
              <File className="h-8 w-8" />
              <div className="text-left">
                <p className="text-sm font-medium truncate max-w-[200px]">{selectedFile.name}</p>
                <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <Button variant="ghost" size="sm" onClick={resetUpload} className="ml-2 h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Button onClick={handleUpload} disabled={isUploading} className="bg-slate-900 hover:bg-slate-800">
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-center">
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                <Upload className="h-5 w-5 text-slate-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-700">Drag and drop your file here</p>
              <p className="text-xs text-slate-500">or click to browse (max {maxSize}MB)</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              {buttonText}
            </Button>
          </div>
        )}
      </div>

      {uploadError && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">{uploadError}</div>
      )}
    </div>
  )
}
