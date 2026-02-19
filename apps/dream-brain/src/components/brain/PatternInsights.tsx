"use client";

import { useMemo, useState } from "react";
import {
  Lightbulb,
  Clock,
  Heart,
  TrendingUp,
  Link2,
  RefreshCw,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  discoverPatterns,
  type PatternInsight,
  type PatternType,
  type ThoughtForPattern,
} from "@/lib/pattern-engine";

interface PatternInsightsProps {
  thoughts: ThoughtForPattern[];
  onViewRelated?: (thoughtIds: string[]) => void;
  className?: string;
}

const PATTERN_CONFIG: Record<
  PatternType,
  { icon: LucideIcon; accentColor: string; bgColor: string; borderColor: string; badgeColor: string }
> = {
  recurring_theme: {
    icon: RefreshCw,
    accentColor: "text-[#00D4AA]",
    bgColor: "bg-[#00D4AA]/5",
    borderColor: "border-[#00D4AA]/20",
    badgeColor: "bg-[#00D4AA]/15 text-[#00D4AA]",
  },
  temporal: {
    icon: Clock,
    accentColor: "text-blue-400",
    bgColor: "bg-blue-500/5",
    borderColor: "border-blue-500/20",
    badgeColor: "bg-blue-500/15 text-blue-300",
  },
  emotional: {
    icon: Heart,
    accentColor: "text-pink-400",
    bgColor: "bg-pink-500/5",
    borderColor: "border-pink-500/20",
    badgeColor: "bg-pink-500/15 text-pink-300",
  },
  growth: {
    icon: TrendingUp,
    accentColor: "text-emerald-400",
    bgColor: "bg-emerald-500/5",
    borderColor: "border-emerald-500/20",
    badgeColor: "bg-emerald-500/15 text-emerald-300",
  },
  connection: {
    icon: Link2,
    accentColor: "text-amber-400",
    bgColor: "bg-amber-500/5",
    borderColor: "border-amber-500/20",
    badgeColor: "bg-amber-500/15 text-amber-300",
  },
};

const PATTERN_LABELS: Record<PatternType, string> = {
  recurring_theme: "Recurring",
  temporal: "Temporal",
  emotional: "Emotional",
  growth: "Growth",
  connection: "Connection",
};

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  let color = "text-gray-500";
  if (pct >= 80) color = "text-emerald-400";
  else if (pct >= 60) color = "text-blue-400";
  else if (pct >= 40) color = "text-amber-400";

  return (
    <span className={`text-[10px] font-medium ${color}`}>
      {pct}% confidence
    </span>
  );
}

function PatternCard({
  pattern,
  onViewRelated,
}: {
  pattern: PatternInsight;
  onViewRelated?: (ids: string[]) => void;
}) {
  const config = PATTERN_CONFIG[pattern.type];
  const Icon = config.icon;

  return (
    <div
      className={`rounded-[12px] border ${config.borderColor} ${config.bgColor} p-4 transition-all hover:shadow-md`}
    >
      {/* Top row: icon + type badge + confidence */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${config.bgColor}`}
          >
            <Icon className={`h-4 w-4 ${config.accentColor}`} />
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${config.badgeColor}`}
          >
            {PATTERN_LABELS[pattern.type]}
          </span>
        </div>
        <ConfidenceBadge confidence={pattern.confidence} />
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-gray-200 mb-1">
        {pattern.title}
      </h4>

      {/* Description */}
      <p className="text-xs text-gray-400 leading-relaxed mb-3">
        {pattern.description}
      </p>

      {/* Actionable suggestion */}
      {pattern.actionable && (
        <div className="flex items-start gap-2 rounded-lg bg-white/[0.03] p-2 mb-3">
          <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-[#00D4AA]" />
          <p className="text-[11px] text-gray-500 leading-relaxed">
            {pattern.actionable}
          </p>
        </div>
      )}

      {/* View related button */}
      {onViewRelated && pattern.relatedIds.length > 0 && (
        <button
          type="button"
          onClick={() => onViewRelated(pattern.relatedIds)}
          className="flex items-center gap-1 text-[11px] font-medium text-gray-500 transition-colors hover:text-gray-300"
        >
          View related thoughts ({pattern.relatedIds.length})
          <ChevronRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

export function PatternInsights({
  thoughts,
  onViewRelated,
  className,
}: PatternInsightsProps) {
  const [filterType, setFilterType] = useState<PatternType | "all">("all");

  const patterns = useMemo(
    () => discoverPatterns(thoughts),
    [thoughts]
  );

  const filteredPatterns = useMemo(() => {
    if (filterType === "all") return patterns;
    return patterns.filter((p) => p.type === filterType);
  }, [patterns, filterType]);

  const patternTypes: (PatternType | "all")[] = [
    "all",
    "recurring_theme",
    "temporal",
    "emotional",
    "growth",
    "connection",
  ];

  if (patterns.length === 0) {
    return (
      <div
        className={`rounded-[12px] border border-white/[0.06] bg-white/[0.03] p-6 text-center ${className ?? ""}`}
      >
        <Lightbulb className="mx-auto h-8 w-8 text-gray-600 mb-2" />
        <p className="text-sm text-gray-500">
          Keep recording thoughts to discover patterns
        </p>
        <p className="mt-1 text-xs text-gray-600">
          Patterns emerge after 5+ thoughts
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-200">
          Pattern Insights
        </h3>
        <span className="text-[11px] text-gray-500">
          {patterns.length} discovered
        </span>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-1.5 mb-4 overflow-x-auto scrollbar-none">
        {patternTypes.map((type) => {
          const count =
            type === "all"
              ? patterns.length
              : patterns.filter((p) => p.type === type).length;

          if (type !== "all" && count === 0) return null;

          return (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                filterType === type
                  ? type === "all"
                    ? "bg-white/10 text-gray-200"
                    : `${PATTERN_CONFIG[type].badgeColor}`
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {type === "all" ? "All" : PATTERN_LABELS[type]} ({count})
            </button>
          );
        })}
      </div>

      {/* Pattern cards */}
      <div className="flex flex-col gap-3">
        {filteredPatterns.map((pattern, idx) => (
          <PatternCard
            key={`${pattern.type}-${idx}`}
            pattern={pattern}
            onViewRelated={onViewRelated}
          />
        ))}
      </div>
    </div>
  );
}
