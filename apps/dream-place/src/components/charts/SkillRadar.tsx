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
import { SKILL_DOMAINS } from "@/data/skills";

interface SkillRadarProps {
  skillsA: string[];
  skillsB: string[];
  nameA?: string;
  nameB?: string;
  size?: number;
}

/** Count how many skills a person has per domain */
function countByDomain(skills: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const domain of SKILL_DOMAINS) {
    const domainSkills = domain.categories.flatMap((c) =>
      c.skills.map((s) => s.name)
    );
    counts[domain.domain] = skills.filter((s) =>
      domainSkills.includes(s)
    ).length;
  }
  return counts;
}

export function SkillRadar({
  skillsA,
  skillsB,
  nameA = "You",
  nameB = "Partner",
  size = 300,
}: SkillRadarProps) {
  const countsA = countByDomain(skillsA);
  const countsB = countByDomain(skillsB);

  const data = SKILL_DOMAINS.map((d) => ({
    domain: d.domain,
    [nameA]: countsA[d.domain] ?? 0,
    [nameB]: countsB[d.domain] ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={size}>
      <RadarChart data={data}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis
          dataKey="domain"
          tick={{ fill: "#9ca3af", fontSize: 11 }}
        />
        <PolarRadiusAxis tick={false} />
        <Radar
          name={nameA}
          dataKey={nameA}
          stroke="#8b5cf6"
          fill="#8b5cf6"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Radar
          name={nameB}
          dataKey={nameB}
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
}
