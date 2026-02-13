"use client";

import { useState, useCallback } from "react";
import { Button, cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";

export function ExportButton({ className }: { className?: string }) {
  const { data } = usePlannerStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      // Dynamic import to avoid SSR issues with @react-pdf/renderer
      const [{ pdf }, { PlannerPdfDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./PlannerPdf"),
      ]);

      const doc = PlannerPdfDocument({ data });
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `dream-planner-${data.userName ? data.userName.toLowerCase().replace(/\s+/g, "-") : "report"}-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("[PDF Export] Failed:", error);
    } finally {
      setIsExporting(false);
    }
  }, [data]);

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isExporting}
      className={cn("gap-2", className)}
    >
      {isExporting ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" className="animate-spin" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
          </svg>
          Generating PDF...
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Export PDF
        </>
      )}
    </Button>
  );
}
