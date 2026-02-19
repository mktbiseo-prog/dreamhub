"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp } from "lucide-react";
import {
  analyzeTone,
  getToneColor,
  getToneTailwindColor,
  getToneBgColor,
  type ToneName,
} from "@/lib/tone-analyzer";

interface ThoughtDatapoint {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  valence?: number;
  emotion?: string;
}

interface EmotionTimelineProps {
  thoughts: ThoughtDatapoint[];
  className?: string;
}

interface ChartDataPoint {
  date: string;
  dateLabel: string;
  valence: number;
  dominantTone: ToneName;
  title: string;
  color: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
  label?: string;
}) {
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0].payload;
  return (
    <div className="rounded-xl border border-white/10 bg-[#132039] p-3 shadow-xl">
      <p className="text-xs font-medium text-gray-200 mb-1">{data.title}</p>
      <p className="text-xs text-gray-500">{data.dateLabel}</p>
      <div className="mt-2 flex items-center gap-2">
        <span
          className={`inline-block h-2 w-2 rounded-full`}
          style={{ backgroundColor: data.color }}
        />
        <span className="text-xs text-gray-400 capitalize">
          {data.dominantTone}
        </span>
        <span className="text-xs text-gray-500">
          {data.valence > 0 ? "+" : ""}
          {data.valence.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

export function EmotionTimeline({ thoughts, className }: EmotionTimelineProps) {
  const [selectedTone, setSelectedTone] = useState<ToneName | "all">("all");

  const chartData = useMemo(() => {
    return thoughts
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      .map((thought) => {
        const toneResult = analyzeTone(thought.body);
        return {
          date: thought.createdAt,
          dateLabel: formatDate(thought.createdAt),
          valence: thought.valence ?? toneResult.valence,
          dominantTone: toneResult.dominant,
          title: thought.title,
          color: getToneColor(toneResult.dominant),
        };
      });
  }, [thoughts]);

  const filteredData = useMemo(() => {
    if (selectedTone === "all") return chartData;
    return chartData.filter((d) => d.dominantTone === selectedTone);
  }, [chartData, selectedTone]);

  const tones: ToneName[] = [
    "confident",
    "anxious",
    "excited",
    "reflective",
    "determined",
  ];

  if (thoughts.length === 0) {
    return (
      <div className={`rounded-[12px] border border-white/[0.06] bg-white/[0.03] p-6 text-center ${className ?? ""}`}>
        <TrendingUp className="mx-auto h-8 w-8 text-gray-600 mb-2" />
        <p className="text-sm text-gray-500">
          Record more thoughts to see emotional trends
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-[12px] border border-white/[0.06] bg-white/[0.03] p-4 ${className ?? ""}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-200">
          Emotion Timeline
        </h3>
      </div>

      {/* Tone Filter Pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          type="button"
          onClick={() => setSelectedTone("all")}
          className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
            selectedTone === "all"
              ? "bg-white/10 text-gray-200"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          All
        </button>
        {tones.map((tone) => (
          <button
            key={tone}
            type="button"
            onClick={() => setSelectedTone(tone)}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${
              selectedTone === tone
                ? `${getToneBgColor(tone)} ${getToneTailwindColor(tone)}`
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tone}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filteredData}
            margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
          >
            <XAxis
              dataKey="dateLabel"
              tick={{ fill: "#6b7280", fontSize: 10 }}
              axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              tickLine={false}
            />
            <YAxis
              domain={[-1, 1]}
              tick={{ fill: "#6b7280", fontSize: 10 }}
              axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              tickLine={false}
              tickCount={5}
            />
            <ReferenceLine
              y={0}
              stroke="rgba(255,255,255,0.1)"
              strokeDasharray="3 3"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="valence"
              stroke="url(#emotionGradient)"
              strokeWidth={2}
              dot={(props: Record<string, unknown>) => {
                const { cx, cy, payload } = props as {
                  cx: number;
                  cy: number;
                  payload: ChartDataPoint;
                };
                return (
                  <circle
                    key={`${payload.date}-${cx}`}
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill={payload.color}
                    stroke="transparent"
                    strokeWidth={2}
                  />
                );
              }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
            />
            <defs>
              <linearGradient
                id="emotionGradient"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop offset="0%" stopColor="#00D4AA" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-1 text-[10px] text-gray-600">
        <span>-1 Negative</span>
        <div className="mx-2 h-px w-8 bg-gradient-to-r from-red-500/50 via-gray-500/30 to-emerald-500/50" />
        <span>+1 Positive</span>
      </div>
    </div>
  );
}
