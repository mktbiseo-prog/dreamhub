"use client";

import { useState, useCallback } from "react";
import { cn } from "@dreamhub/ui";

interface AiSummaryProps {
  partNumber: number;
  dataSummary: string;
}

interface SummaryResponse {
  message: string;
  suggestions: string[];
  encouragement: string;
}

export function AiSummary({ partNumber, dataSummary }: AiSummaryProps) {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateSummary = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: `Generate a comprehensive summary and analysis of my PART ${partNumber} data. What are my key strengths, patterns, and recommended next steps? Here's my data: ${dataSummary}`,
          activityId: 0,
          activityName: `PART ${partNumber} Reflection`,
          partNumber,
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = (await res.json()) as SummaryResponse;
      setSummary(data);
      setHasGenerated(true);
    } catch {
      setSummary({
        message: "Great work completing this PART! Review your reflections above — they contain the key insights you need for the next phase of your journey.",
        suggestions: [
          "Re-read your answers with fresh eyes tomorrow",
          "Share your key insight with someone you trust",
          "Start the next PART with your biggest discovery in mind",
        ],
        encouragement: "Every PART completed is a step closer to your dream.",
      });
      setHasGenerated(true);
    } finally {
      setIsLoading(false);
    }
  }, [partNumber, dataSummary]);

  const partColors: Record<number, { gradient: string; text: string; bg: string }> = {
    1: { gradient: "from-[#FFF8F5] to-orange-50 dark:from-orange-950 dark:to-orange-950", text: "text-orange-700 dark:text-orange-300", bg: "bg-[#FFF3ED] dark:bg-orange-900" },
    2: { gradient: "from-brand-50 to-blue-50 dark:from-brand-950 dark:to-blue-950", text: "text-brand-700 dark:text-brand-300", bg: "bg-brand-100 dark:bg-brand-900" },
    3: { gradient: "from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950", text: "text-blue-700 dark:text-blue-300", bg: "bg-blue-100 dark:bg-blue-900" },
    4: { gradient: "from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950", text: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-900" },
  };

  const colors = partColors[partNumber] || partColors[1];

  if (!hasGenerated) {
    return (
      <div className="mt-6">
        <button
          type="button"
          onClick={generateSummary}
          disabled={isLoading}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-card p-4 transition-all",
            "bg-gradient-to-r",
            colors.gradient,
            "hover:shadow-md",
            isLoading && "animate-pulse"
          )}
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              <span className={cn("text-sm font-medium", colors.text)}>
                Analyzing your PART {partNumber} journey...
              </span>
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={colors.text}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              <span className={cn("text-sm font-medium", colors.text)}>
                Generate AI Insight for PART {partNumber}
              </span>
            </>
          )}
        </button>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className={cn("mt-6 rounded-card bg-gradient-to-r p-5", colors.gradient)}>
      <div className="mb-3 flex items-center gap-2">
        <div className={cn("rounded-md px-2 py-0.5 text-[10px] font-bold", colors.bg, colors.text)}>
          AI INSIGHT
        </div>
        <span className="text-xs text-gray-500">PART {partNumber} Analysis</span>
      </div>

      <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">{summary.message}</p>

      {summary.suggestions.length > 0 && (
        <div className="mb-4 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Recommended Next Steps
          </p>
          {summary.suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={cn("mt-0.5 text-xs", colors.text)}>{i + 1}.</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">{s}</span>
            </div>
          ))}
        </div>
      )}

      <p className={cn("text-xs font-medium italic", colors.text)}>
        &ldquo;{summary.encouragement}&rdquo;
      </p>
    </div>
  );
}
