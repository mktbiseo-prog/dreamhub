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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Where are you based?
        </h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
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

      <div className="rounded-[12px] border border-brand-100 bg-brand-50/50 p-4 dark:border-brand-900/30 dark:bg-brand-900/10">
        <p className="text-sm text-brand-600 dark:text-brand-400">
          Dream Place is a global community. You can connect with dreamers
          anywhere in the world, but knowing your location unlocks local events
          and meetups through Dream Cafe.
        </p>
      </div>
    </div>
  );
}
