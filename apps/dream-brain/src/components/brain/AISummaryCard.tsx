import { Sparkles } from "lucide-react";
import { cn } from "@dreamhub/design-system";

interface AISummaryCardProps {
  summary: string;
  className?: string;
}

export function AISummaryCard({ summary, className }: AISummaryCardProps) {
  if (!summary) return null;

  return (
    <div
      className={cn(
        "rounded-[var(--dream-radius-lg)] p-4",
        "bg-[#00D4AA]/10 border-l-[3px] border-[var(--dream-color-primary)]",
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-[var(--dream-color-primary)]" />
        <span className="text-xs font-semibold text-[#00D4AA]">
          AI Summary
        </span>
      </div>
      <p className="text-sm text-gray-300 leading-relaxed">{summary}</p>
    </div>
  );
}
