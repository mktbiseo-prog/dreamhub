"use client";

import { useState, useRef, useEffect } from "react";
import { Button, cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";
import { generateDreamPlanPDF, generateJsonExport } from "@/lib/pdf-export";

type ExportFormat = "html" | "json";

export function ExportButton({ className }: { className?: string }) {
  const { data } = usePlannerStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = async (format: ExportFormat) => {
    setIsLoading(true);
    setShowDropdown(false);

    try {
      // Small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 300));

      const exportData = {
        plannerData: data,
        visionBoardCards: [] as { type: string; content: string; progress?: number }[],
        passionLevel: undefined as number | undefined,
        trafficLightItems: data.part4.trafficLight.items.map((i) => ({
          text: i.text,
          color: i.color,
        })),
        milestones: [] as { title: string; targetDate: string; completed: boolean }[],
        sprintTasks: [] as { title: string; startWeek: number; endWeek: number; priority: string }[],
        supportNodes: [] as { name: string; role: string; ring: string; nodeType: string; strength: number }[],
      };

      let blob: Blob;
      let filename: string;

      if (format === "html") {
        blob = generateDreamPlanPDF(exportData);
        filename = `dream-plan-${data.userName ? data.userName.toLowerCase().replace(/\s+/g, "-") : "export"}-${new Date().toISOString().split("T")[0]}.html`;
      } else {
        blob = generateJsonExport(exportData);
        filename = `dream-plan-${data.userName ? data.userName.toLowerCase().replace(/\s+/g, "-") : "export"}-${new Date().toISOString().split("T")[0]}.json`;
      }

      // Trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isLoading}
        className={cn("gap-2", className)}
      >
        {isLoading ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
            </svg>
            Generating...
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export Plan
          </>
        )}
      </Button>

      {showDropdown && (
        <div className="absolute right-0 top-12 z-20 w-52 rounded-[12px] border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <button
            type="button"
            onClick={() => handleExport("html")}
            className="flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-500">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <div className="text-left">
              <p className="font-medium">HTML Report</p>
              <p className="text-[10px] text-gray-400">Print-friendly format</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleExport("json")}
            className="flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-500">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <div className="text-left">
              <p className="font-medium">JSON Data</p>
              <p className="text-[10px] text-gray-400">Raw plan data</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
