"use client";

import { useRef } from "react";
import { Input } from "@dreamhub/ui";
import { Label } from "@dreamhub/ui";
import { Textarea } from "@dreamhub/ui";
import { Button } from "@dreamhub/ui";
import type { DreamProfileFormData } from "@/types/onboarding";

interface ProfileStepProps {
  data: DreamProfileFormData;
  onChange: (data: Partial<DreamProfileFormData>) => void;
}

export function ProfileStep({ data, onChange }: ProfileStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return; // 5MB limit

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange({
        avatarFile: file,
        avatarPreview: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Complete Your Profile
        </h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Add a photo and a short bio so other dreamers can get to know you.
        </p>
      </div>

      {/* Avatar upload */}
      <div className="flex flex-col items-center gap-4">
        <div
          className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              fileInputRef.current?.click();
            }
          }}
        >
          {data.avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.avatarPreview}
              alt="Profile preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-center">
              <svg
                className="mx-auto h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
                />
              </svg>
              <p className="mt-1 text-xs text-gray-400">Upload</p>
            </div>
          )}
        </div>

        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          {data.avatarPreview ? "Change Photo" : "Upload Photo"}
        </Button>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          JPG, PNG or WebP. Max 5MB.
        </p>
      </div>

      {/* Bio */}
      <div className="mx-auto max-w-md space-y-2">
        <Label htmlFor="bio">Short Bio</Label>
        <Textarea
          id="bio"
          placeholder="Tell other dreamers a bit about yourself — your background, what drives you, or what you're currently working on..."
          value={data.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
          rows={4}
          className="resize-none"
          maxLength={500}
        />
        <p className="text-right text-xs text-gray-400 dark:text-gray-500">
          {data.bio.length} / 500
        </p>
      </div>
    </div>
  );
}
