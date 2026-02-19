"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";
import type { JourneyReportData } from "@/lib/ai-insights";
import { PART1_ACTIVITIES } from "@/types/planner";
import { PART2_ACTIVITIES } from "@/types/part2";
import { PART3_ACTIVITIES } from "@/types/part3";
import { PART4_ACTIVITIES } from "@/types/part4";

const TOTAL_ACTIVITY_COUNT = PART1_ACTIVITIES.length + PART2_ACTIVITIES.length + PART3_ACTIVITIES.length + PART4_ACTIVITIES.length;

function PillarBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm font-bold text-gray-900 dark:text-white">{score}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={cn("h-full rounded-full transition-all duration-1000", color)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function ReportPage() {
  const { data } = usePlannerStore();
  const [report, setReport] = useState<JourneyReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const totalActivities =
    data.completedActivities.length +
    data.part2.completedActivities.length +
    data.part3.completedActivities.length +
    data.part4.completedActivities.length;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (res.ok) {
        const result = await res.json() as JourneyReportData;
        setReport(result);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/planner" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Your Dream Journey Report
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          A comprehensive AI analysis of your entire journey across all 4 PARTs.
        </p>
      </div>

      {/* Progress Summary */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">Activities Completed</span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalActivities}/{TOTAL_ACTIVITY_COUNT}</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] to-orange-400 transition-all duration-500"
            style={{ width: `${(totalActivities / TOTAL_ACTIVITY_COUNT) * 100}%` }}
          />
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            { label: "PART 1", count: data.completedActivities.length, total: PART1_ACTIVITIES.length },
            { label: "PART 2", count: data.part2.completedActivities.length, total: PART2_ACTIVITIES.length },
            { label: "PART 3", count: data.part3.completedActivities.length, total: PART3_ACTIVITIES.length },
            { label: "PART 4", count: data.part4.completedActivities.length, total: PART4_ACTIVITIES.length },
          ].map((p) => (
            <div key={p.label} className="text-center">
              <p className="text-xs text-gray-500">{p.label}</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{p.count}/{p.total}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      {!report && (
        <div className="mb-8 text-center">
          <Button
            onClick={handleGenerate}
            disabled={loading || totalActivities < 1}
            className="bg-[#FF6B35] px-8 py-3 text-white hover:bg-[#E85A24]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" className="opacity-75" />
                </svg>
                Generating Your Report...
              </span>
            ) : (
              "Generate Journey Report"
            )}
          </Button>
          {totalActivities < 1 && (
            <p className="mt-2 text-sm text-gray-400">Complete at least one activity to generate your report.</p>
          )}
        </div>
      )}

      {/* Report Content */}
      {report && (
        <div className="space-y-6">
          {/* Title & Score */}
          <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-[#FFF8F5] to-orange-50 p-6 text-center dark:border-orange-800 dark:from-orange-950/50 dark:to-orange-950/50">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{report.title}</h2>
            <div className="mt-4 inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B35] to-orange-500">
              <span className="text-3xl font-bold text-white">{report.overallScore}%</span>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Overall Journey Score</p>
          </div>

          {/* Pillar Scores */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Journey Pillars</h3>
            <div className="space-y-4">
              <PillarBar label="Reality (PART 1)" score={report.pillarScores.reality} color="bg-[#FF6B35]" />
              <PillarBar label="Discovery (PART 2)" score={report.pillarScores.discovery} color="bg-blue-500" />
              <PillarBar label="Validation (PART 3)" score={report.pillarScores.validation} color="bg-emerald-500" />
              <PillarBar label="Connection (PART 4)" score={report.pillarScores.connection} color="bg-amber-500" />
            </div>
          </div>

          {/* Core Assets */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Your Core Assets</h3>
            <ul className="space-y-2">
              {report.coreAssets.map((asset, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FFF3ED] text-[10px] font-bold text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                    {i + 1}
                  </span>
                  {asset}
                </li>
              ))}
            </ul>
          </div>

          {/* Discovered Why */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950/50">
            <h3 className="mb-2 text-lg font-semibold text-blue-900 dark:text-blue-100">Your Discovered Why</h3>
            <p className="text-blue-800 dark:text-blue-200">{report.discoveredWhy}</p>
          </div>

          {/* Validated Idea */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800 dark:bg-emerald-950/50">
            <h3 className="mb-2 text-lg font-semibold text-emerald-900 dark:text-emerald-100">Your Validated Idea</h3>
            <p className="text-emerald-800 dark:text-emerald-200">{report.validatedIdea}</p>
          </div>

          {/* Network */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950/50">
            <h3 className="mb-2 text-lg font-semibold text-amber-900 dark:text-amber-100">Your Network</h3>
            <p className="text-amber-800 dark:text-amber-200">{report.network}</p>
          </div>

          {/* Key Insights */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Key Insights</h3>
            <ul className="space-y-3">
              {report.keyInsights.map((insight, i) => (
                <li key={i} className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <span className="mt-0.5 text-[#FF6B35]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a7 7 0 017 7c0 3-1.5 5-3 6.5V18H8v-2.5C6.5 14 5 12 5 9a7 7 0 017-7z" />
                      <path d="M9 21h6" />
                    </svg>
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Next Steps */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Recommended Next Steps</h3>
            <ol className="space-y-2">
              {report.nextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B35] to-orange-500 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Encouragement */}
          <div className="rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#E85A24] p-6 text-center text-white">
            <p className="text-lg font-medium">{report.encouragement}</p>
          </div>

          {/* Regenerate */}
          <div className="text-center">
            <Button
              onClick={handleGenerate}
              disabled={loading}
              variant="outline"
              className="text-gray-600"
            >
              {loading ? "Regenerating..." : "Regenerate Report"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
