"use client";

import { Input } from "@dreamhub/ui";
import { Label } from "@dreamhub/ui";
import type { DreamProfileFormData } from "@/types/onboarding";

interface LocationStepProps {
  data: DreamProfileFormData;
  onChange: (data: Partial<DreamProfileFormData>) => void;
}

export function LocationStep({ data, onChange }: LocationStepProps) {
  function handleLocationChange(field: "city" | "country", value: string) {
    onChange({
      location: {
        ...data.location,
        [field]: value,
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Where are you based?
        </h2>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          Your location helps us find dreamers nearby for local meetups and
          collaboration.
        </p>
      </div>

      <div className="mx-auto max-w-md space-y-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="e.g., San Francisco"
            value={data.location.city}
            onChange={(e) => handleLocationChange("city", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            placeholder="e.g., United States"
            value={data.location.country}
            onChange={(e) => handleLocationChange("country", e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#E8E0FF] bg-[#F5F1FF] p-4 dark:border-[#6C3CE1]/15 dark:bg-[#6C3CE1]/5">
        <p className="text-sm text-[#6C3CE1] dark:text-[#B4A0F0]">
          Dream Place is a global community. You can connect with dreamers
          anywhere in the world, but knowing your location unlocks local events
          and meetups through Dream Cafe.
        </p>
      </div>
    </div>
  );
}
