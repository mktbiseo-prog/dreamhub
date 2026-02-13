"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@dreamhub/ui";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  label?: string;
  hint?: string;
}

export function ImageUpload({
  value,
  onChange,
  max = 5,
  label = "Upload Images",
  hint,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      return data.url as string;
    },
    []
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = max - value.length;
      if (remaining <= 0) return;

      const toUpload = fileArray.slice(0, remaining);
      setUploading(true);

      try {
        const urls = await Promise.all(toUpload.map(uploadFile));
        onChange([...value, ...urls]);
      } catch (err) {
        console.error("Upload error:", err);
      } finally {
        setUploading(false);
      }
    },
    [value, onChange, max, uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const removeImage = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange]
  );

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </p>
      )}

      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {value.map((url, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
              <img
                src={url}
                alt={`Upload ${i + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {value.length < max && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed p-6 transition-colors ${
            dragOver
              ? "border-brand-500 bg-brand-50 dark:bg-brand-950/20"
              : "border-gray-300 hover:border-gray-400 dark:border-gray-700"
          }`}
          onClick={() => inputRef.current?.click()}
        >
          <svg
            className="mb-2 h-8 w-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
            />
          </svg>
          {uploading ? (
            <p className="text-sm text-brand-600">Uploading...</p>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Drop images here or click to browse
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {hint || `JPEG, PNG, WebP up to 5MB (${value.length}/${max})`}
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple={max > 1}
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// Single image upload variant
interface SingleImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
}

export function SingleImageUpload({
  value,
  onChange,
  label = "Upload Image",
  hint,
}: SingleImageUploadProps) {
  return (
    <ImageUpload
      value={value ? [value] : []}
      onChange={(urls) => onChange(urls[0] || "")}
      max={1}
      label={label}
      hint={hint}
    />
  );
}
