"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { WorkStyle } from "@/types/onboarding";

interface DreamerDNAProps {
  workStyle: WorkStyle;
  compareWith?: WorkStyle;
  compareName?: string;
  size?: number;
  /** Trust score (0-1) for the 6th dimension. Defaults to 0.5 if not provided. */
  trustScore?: number;
  /** Trust score (0-1) for the comparison partner. Defaults to 0.5 if not provided. */
  compareTrustScore?: number;
}

export function DreamerDNA({
  workStyle,
  compareWith,
  compareName = "Partner",
  size = 300,
  trustScore = 0.5,
  compareTrustScore = 0.5,
}: DreamerDNAProps) {
  // Convert trust from 0-1 to 0-100 scale to match WorkStyle dimensions
  const trustPercent = Math.round(trustScore * 100);
  const compareTrustPercent = Math.round(compareTrustScore * 100);

  const data = [
    {
      dimension: "Ideation",
      you: workStyle.ideation,
      ...(compareWith && { partner: compareWith.ideation }),
    },
    {
      dimension: "Execution",
      you: workStyle.execution,
      ...(compareWith && { partner: compareWith.execution }),
    },
    {
      dimension: "People",
      you: workStyle.people,
      ...(compareWith && { partner: compareWith.people }),
    },
    {
      dimension: "Thinking",
      you: workStyle.thinking,
      ...(compareWith && { partner: compareWith.thinking }),
    },
    {
      dimension: "Action",
      you: workStyle.action,
      ...(compareWith && { partner: compareWith.action }),
    },
    {
      dimension: "Trust",
      you: trustPercent,
      ...(compareWith && { partner: compareTrustPercent }),
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={size}>
      <RadarChart data={data}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fill: "#9ca3af", fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: "#d1d5db", fontSize: 10 }}
          tickCount={5}
        />
        <Radar
          name="You"
          dataKey="you"
          stroke="#8b5cf6"
          fill="#8b5cf6"
          fillOpacity={0.25}
          strokeWidth={2}
        />
        {compareWith && (
          <Radar
            name={compareName}
            dataKey="partner"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.15}
            strokeWidth={2}
          />
        )}
        {compareWith && <Legend />}
      </RadarChart>
    </ResponsiveContainer>
  );
}
