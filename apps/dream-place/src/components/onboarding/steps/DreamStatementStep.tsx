"use client";

import { useState } from "react";
import { Textarea } from "@dreamhub/ui";
import { Label } from "@dreamhub/ui";
import { Button } from "@dreamhub/ui";
import type { DreamProfileFormData } from "@/types/onboarding";

interface DreamStatementStepProps {
  data: DreamProfileFormData;
  onChange: (data: Partial<DreamProfileFormData>) => void;
}

export function DreamStatementStep({
  data,
  onChange,
}: DreamStatementStepProps) {
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichResult, setEnrichResult] = useState<{
    headline: string;
    category: string;
    interests: string[];
  } | null>(null);

  async function handleEnrich() {
    if (data.dreamStatement.trim().length < 20) return;
    setIsEnriching(true);
    try {
      const res = await fetch("/api/ai/enrich-dream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dreamStatement: data.dreamStatement }),
      });
      if (res.ok) {
        const result = await res.json();
        setEnrichResult(result);
      }
    } catch {
      // Silently fail — enrichment is optional
    } finally {
      setIsEnriching(false);
    }
  }

  function applyEnrichment() {
    if (!enrichResult) return;
    onChange({
      // Store enrichment in the statement step — will be picked up by the wizard on submit
    });
    // The enrichment result will be sent along with the profile data
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          What&apos;s your dream?
        </h2>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          Describe the dream you want to bring to life. Be specific — this helps
          us find people who share your vision.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dreamStatement">Your Dream Statement</Label>
        <Textarea
          id="dreamStatement"
          placeholder="e.g., I want to build an AI-powered language learning app that makes education accessible to everyone..."
          value={data.dreamStatement}
          onChange={(e) => {
            onChange({ dreamStatement: e.target.value });
            setEnrichResult(null); // Reset on edit
          }}
          rows={6}
          className="resize-none"
          maxLength={1000}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            {data.dreamStatement.length} / 1,000
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={data.dreamStatement.trim().length < 20 || isEnriching}
            onClick={handleEnrich}
          >
            {isEnriching ? (
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing...
              </span>
            ) : (
              "AI Enrich"
            )}
          </Button>
        </div>
      </div>

      {/* AI Enrichment result */}
      {enrichResult && (
        <div className="rounded-2xl border border-[#E8E0FF] bg-[#F5F1FF] p-4 dark:border-[#4520A0] dark:bg-[#6C3CE1]/5">
          <p className="mb-3 text-sm font-medium text-[#6C3CE1] dark:text-[#B4A0F0]">
            AI-suggested enhancements
          </p>
          <div className="space-y-2">
            <div>
              <span className="text-xs font-medium text-neutral-500">Headline:</span>
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                {enrichResult.headline}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-neutral-500">Category:</span>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                {enrichResult.category}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-neutral-500">Interests:</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {enrichResult.interests.map((i) => (
                  <span
                    key={i}
                    className="rounded-full bg-[#E8E0FF] px-2.5 py-0.5 text-xs text-[#6C3CE1] dark:bg-[#6C3CE1]/15 dark:text-[#B4A0F0]"
                  >
                    {i}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            className="mt-3"
            onClick={applyEnrichment}
          >
            Apply Suggestions
          </Button>
        </div>
      )}

      <div className="rounded-2xl border border-[#E8E0FF] bg-[#F5F1FF] p-4 dark:border-[#6C3CE1]/15 dark:bg-[#6C3CE1]/5">
        <p className="text-sm font-medium text-[#6C3CE1] dark:text-[#B4A0F0]">
          Tips for a great dream statement:
        </p>
        <ul className="mt-2 space-y-1 text-sm text-[#6C3CE1] dark:text-[#B4A0F0]">
          <li>&#8226; Be specific about what you want to create</li>
          <li>&#8226; Mention the impact you hope to make</li>
          <li>&#8226; Include the field or industry you&apos;re targeting</li>
        </ul>
      </div>
    </div>
  );
}
