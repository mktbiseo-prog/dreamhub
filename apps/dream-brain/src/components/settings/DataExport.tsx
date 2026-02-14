"use client";

import { useState } from "react";
import { Download, FileJson, FileSpreadsheet, Loader2, Check } from "lucide-react";

interface DataExportProps {
  userId: string;
  className?: string;
}

type ExportFormat = "json" | "csv";

export function DataExport({ userId, className }: DataExportProps) {
  const [format, setFormat] = useState<ExportFormat>("json");
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastExportDate, setLastExportDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setIsExporting(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 20, 80));
      }, 200);

      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, userId }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error("Export failed");
      }

      setProgress(100);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dream-brain-export-${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLastExportDate(new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }));
    } catch {
      setError("Export failed. Please try again.");
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setProgress(0);
      }, 1000);
    }
  }

  return (
    <div className={className}>
      <h4 className="text-sm font-semibold text-gray-200 mb-3">
        Export Your Data
      </h4>

      {/* Format Selection */}
      <div className="flex gap-3 mb-4">
        <label
          className={`flex flex-1 cursor-pointer items-center gap-2 rounded-xl border p-3 transition-colors ${
            format === "json"
              ? "border-brand-500/30 bg-brand-500/5"
              : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
          }`}
        >
          <input
            type="radio"
            name="export-format"
            value="json"
            checked={format === "json"}
            onChange={() => setFormat("json")}
            className="sr-only"
          />
          <FileJson
            className={`h-5 w-5 ${
              format === "json" ? "text-brand-400" : "text-gray-500"
            }`}
          />
          <div>
            <p
              className={`text-xs font-medium ${
                format === "json" ? "text-brand-300" : "text-gray-400"
              }`}
            >
              JSON
            </p>
            <p className="text-[10px] text-gray-600">Structured data format</p>
          </div>
        </label>

        <label
          className={`flex flex-1 cursor-pointer items-center gap-2 rounded-xl border p-3 transition-colors ${
            format === "csv"
              ? "border-brand-500/30 bg-brand-500/5"
              : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
          }`}
        >
          <input
            type="radio"
            name="export-format"
            value="csv"
            checked={format === "csv"}
            onChange={() => setFormat("csv")}
            className="sr-only"
          />
          <FileSpreadsheet
            className={`h-5 w-5 ${
              format === "csv" ? "text-brand-400" : "text-gray-500"
            }`}
          />
          <div>
            <p
              className={`text-xs font-medium ${
                format === "csv" ? "text-brand-300" : "text-gray-400"
              }`}
            >
              CSV
            </p>
            <p className="text-[10px] text-gray-600">Spreadsheet compatible</p>
          </div>
        </label>
      </div>

      {/* Progress Bar */}
      {isExporting && (
        <div className="mb-3">
          <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] text-gray-500">
            {progress < 100 ? "Preparing export..." : "Download ready"}
          </p>
        </div>
      )}

      {/* Export Button */}
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 disabled:opacity-50"
      >
        {isExporting ? (
          progress === 100 ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              Downloaded
            </>
          ) : (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Exporting...
            </>
          )
        ) : (
          <>
            <Download className="h-4 w-4" />
            Export All Thoughts
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}

      {/* Last Export Date */}
      {lastExportDate && (
        <p className="mt-2 text-[10px] text-gray-600">
          Last exported: {lastExportDate}
        </p>
      )}
    </div>
  );
}
