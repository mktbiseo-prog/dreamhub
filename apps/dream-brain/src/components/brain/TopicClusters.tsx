"use client";

import { useMemo, useState, useCallback } from "react";
import { Layers, X } from "lucide-react";
import { clusterTopics, type TopicCluster } from "@/lib/topic-clustering";

interface ThoughtInput {
  id: string;
  title: string;
  body: string;
  tags: string[];
}

interface TopicClustersProps {
  thoughts: ThoughtInput[];
  onClusterSelect?: (thoughtIds: string[]) => void;
  className?: string;
}

const BUBBLE_COLORS = [
  { bg: "from-[#00D4AA]/30 to-[#00B894]/10", border: "border-[#00D4AA]/30", text: "text-[#00D4AA]" },
  { bg: "from-blue-500/30 to-blue-600/10", border: "border-blue-500/30", text: "text-blue-300" },
  { bg: "from-emerald-500/30 to-emerald-600/10", border: "border-emerald-500/30", text: "text-emerald-300" },
  { bg: "from-amber-500/30 to-amber-600/10", border: "border-amber-500/30", text: "text-amber-300" },
  { bg: "from-pink-500/30 to-pink-600/10", border: "border-pink-500/30", text: "text-pink-300" },
  { bg: "from-cyan-500/30 to-cyan-600/10", border: "border-cyan-500/30", text: "text-cyan-300" },
  { bg: "from-red-500/30 to-red-600/10", border: "border-red-500/30", text: "text-red-300" },
  { bg: "from-indigo-500/30 to-indigo-600/10", border: "border-indigo-500/30", text: "text-indigo-300" },
];

function getBubbleSize(count: number, maxCount: number): number {
  const minSize = 80;
  const maxSize = 160;
  if (maxCount <= 1) return (minSize + maxSize) / 2;
  const ratio = count / maxCount;
  return minSize + ratio * (maxSize - minSize);
}

export function TopicClusters({
  thoughts,
  onClusterSelect,
  className,
}: TopicClustersProps) {
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);

  const clusters = useMemo(() => {
    return clusterTopics(
      thoughts.map((t) => ({ id: t.id, text: `${t.title} ${t.body}`, tags: t.tags })),
      1
    );
  }, [thoughts]);

  const maxCount = useMemo(
    () => Math.max(...clusters.map((c) => c.thoughtIds.length), 1),
    [clusters]
  );

  const handleClusterClick = useCallback(
    (cluster: TopicCluster) => {
      if (selectedCluster === cluster.id) {
        setSelectedCluster(null);
        onClusterSelect?.([]);
      } else {
        setSelectedCluster(cluster.id);
        onClusterSelect?.(cluster.thoughtIds);
      }
    },
    [selectedCluster, onClusterSelect]
  );

  if (clusters.length === 0) {
    return (
      <div className={`rounded-[12px] border border-white/[0.06] bg-white/[0.03] p-6 text-center ${className ?? ""}`}>
        <Layers className="mx-auto h-8 w-8 text-gray-600 mb-2" />
        <p className="text-sm text-gray-500">
          Add more thoughts to discover topic clusters
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-[12px] border border-white/[0.06] bg-white/[0.03] p-4 ${className ?? ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-200">
            Topic Clusters
          </h3>
          <span className="text-[11px] text-gray-500">
            {clusters.length} clusters
          </span>
        </div>

        {selectedCluster && (
          <button
            type="button"
            onClick={() => {
              setSelectedCluster(null);
              onClusterSelect?.([]);
            }}
            className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 text-[11px] text-gray-400 transition-colors hover:bg-white/10"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Bubble Chart */}
      <div className="flex flex-wrap items-center justify-center gap-3 py-4">
        {clusters.map((cluster, idx) => {
          const color = BUBBLE_COLORS[idx % BUBBLE_COLORS.length];
          const size = getBubbleSize(cluster.thoughtIds.length, maxCount);
          const isSelected = selectedCluster === cluster.id;
          const coherenceOpacity = 0.4 + cluster.coherence * 0.6;

          return (
            <button
              key={cluster.id}
              type="button"
              onClick={() => handleClusterClick(cluster)}
              className={`
                group relative flex flex-col items-center justify-center rounded-full
                border bg-gradient-to-br transition-all duration-200
                ${color.bg} ${color.border}
                ${
                  isSelected
                    ? "ring-2 ring-white/30 scale-105 shadow-lg"
                    : "hover:scale-105 hover:shadow-md"
                }
              `}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                opacity: coherenceOpacity,
              }}
            >
              {/* Keywords */}
              <div className="flex flex-col items-center gap-0.5 px-2">
                {cluster.keywords.slice(0, 3).map((keyword) => (
                  <span
                    key={keyword}
                    className={`text-[10px] font-medium leading-tight ${color.text} line-clamp-1`}
                  >
                    {keyword}
                  </span>
                ))}
              </div>

              {/* Count badge */}
              <span className="mt-1 text-[10px] text-gray-500">
                {cluster.thoughtIds.length} thought{cluster.thoughtIds.length !== 1 ? "s" : ""}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected cluster detail */}
      {selectedCluster && (() => {
        const cluster = clusters.find((c) => c.id === selectedCluster);
        if (!cluster) return null;
        const colorIdx = clusters.indexOf(cluster);
        const color = BUBBLE_COLORS[colorIdx % BUBBLE_COLORS.length];

        return (
          <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
            <h4 className={`text-sm font-medium ${color.text} mb-1`}>
              {cluster.label}
            </h4>
            <div className="flex flex-wrap gap-1 mb-2">
              {cluster.keywords.map((kw) => (
                <span
                  key={kw}
                  className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-gray-400"
                >
                  {kw}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3 text-[11px] text-gray-500">
              <span>{cluster.thoughtIds.length} thoughts</span>
              <span>Coherence: {(cluster.coherence * 100).toFixed(0)}%</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
