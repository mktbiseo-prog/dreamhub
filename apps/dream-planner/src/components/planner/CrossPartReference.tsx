"use client";

import { useState } from "react";
import { cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";

interface ReferenceSection {
  title: string;
  part: string;
  color: string;
  items: { label: string; value: string }[];
}

function getReferenceData(
  activityId: number,
  data: ReturnType<typeof usePlannerStore>["data"]
): ReferenceSection[] {
  const sections: ReferenceSection[] = [];

  // PART 3 activities (11-14) reference PART 1 + PART 2
  if (activityId >= 11 && activityId <= 14) {
    // PART 1: Skills & Resources
    const topSkills = data.skills.slice(0, 5);
    const strongResources = data.resources.filter((r) => r.score >= 4);
    if (topSkills.length > 0 || strongResources.length > 0) {
      sections.push({
        title: "Your Assets",
        part: "PART 1",
        color: "purple",
        items: [
          ...(topSkills.length > 0
            ? [
                {
                  label: "Top Skills",
                  value: topSkills.map((s) => `${s.name} (${s.proficiency}/5)`).join(", "),
                },
              ]
            : []),
          ...(strongResources.length > 0
            ? [
                {
                  label: "Strong Resources",
                  value: strongResources.map((r) => `${r.label} (${r.score}/5)`).join(", "),
                },
              ]
            : []),
          ...(data.currentState.filter((c) => c.key === "opportunities" && c.content.trim()).length > 0
            ? [{ label: "Opportunities", value: data.currentState.find((c) => c.key === "opportunities")!.content }]
            : []),
        ],
      });
    }

    // PART 2: Why & Ideas
    const bridge = data.part2.whyWhatBridge;
    const hasWhy = bridge.why.trim().length > 0;
    const selectedIdea = bridge.selectedIndex >= 0 ? bridge.ideas[bridge.selectedIndex] : null;
    const failureLessons = data.part2.failureEntries.filter((f) => f.lesson.trim()).slice(0, 3);

    if (hasWhy || selectedIdea || failureLessons.length > 0) {
      sections.push({
        title: "Your Dream",
        part: "PART 2",
        color: "brand",
        items: [
          ...(hasWhy ? [{ label: "Your Why", value: bridge.why }] : []),
          ...(selectedIdea ? [{ label: "Selected Idea", value: selectedIdea }] : []),
          ...(failureLessons.length > 0
            ? [{ label: "Key Lessons", value: failureLessons.map((f) => f.lesson).join("; ") }]
            : []),
        ],
      });
    }

    // Activity-specific: MVP (13) shows time and money constraints
    if (activityId === 13) {
      const constraints = data.currentState.find((c) => c.key === "constraints");
      const productiveHours = data.timeBlocks
        .filter((t) => t.type === "productive")
        .reduce((sum, t) => sum + t.duration, 0);
      const items: { label: string; value: string }[] = [];
      if (productiveHours > 0) {
        items.push({ label: "Weekly Productive Hours", value: `${productiveHours}h available` });
      }
      if (constraints && constraints.content.trim()) {
        items.push({ label: "Constraints", value: constraints.content });
      }
      if (items.length > 0) {
        sections.push({ title: "Reality Check", part: "PART 1", color: "amber", items });
      }
    }
  }

  // PART 4 activities (15-20) reference PART 1 + PART 3
  if (activityId >= 15 && activityId <= 20) {
    // PART 3: Proposal & MVP
    const proposal = data.part3.oneLineProposal.finalProposal;
    const mvpType = data.part3.mvpPlan.mvpType;
    const validatedHypotheses = data.part3.hypotheses.filter((h) => h.status === "success");
    const valueLadderItems = data.part3.valueLadder.filter((v) => v.productName.trim());

    if (proposal || mvpType || validatedHypotheses.length > 0) {
      const items: { label: string; value: string }[] = [];
      if (proposal) items.push({ label: "Your Proposal", value: proposal });
      if (mvpType) items.push({ label: "MVP Type", value: mvpType.replace(/_/g, " ") });
      if (validatedHypotheses.length > 0) {
        items.push({
          label: "Validated",
          value: validatedHypotheses.map((h) => h.hypothesis).join("; "),
        });
      }
      if (valueLadderItems.length > 0) {
        items.push({
          label: "Value Ladder",
          value: valueLadderItems.map((v) => `${v.productName} ($${v.price})`).join(" → "),
        });
      }
      sections.push({ title: "Your Idea", part: "PART 3", color: "blue", items });
    }

    // PART 1: Skills for fan/network context
    if (activityId === 15 || activityId === 16) {
      const topSkills = data.skills.filter((s) => s.proficiency >= 4).slice(0, 3);
      if (topSkills.length > 0) {
        sections.push({
          title: "Skills to Offer",
          part: "PART 1",
          color: "purple",
          items: [{ label: "Your Strengths", value: topSkills.map((s) => s.name).join(", ") }],
        });
      }
    }

    // PART 2: Dream context
    if (activityId === 16 || activityId === 17) {
      const reframed = data.part2.weaknesses.filter((w) => w.reframed.trim()).slice(0, 2);
      if (reframed.length > 0) {
        sections.push({
          title: "Reframed Strengths",
          part: "PART 2",
          color: "brand",
          items: reframed.map((w) => ({ label: w.text, value: w.reframed })),
        });
      }
    }
  }

  return sections;
}

const COLOR_MAP: Record<string, { badge: string; border: string; bg: string }> = {
  purple: {
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800",
    bg: "bg-purple-50/50 dark:bg-purple-950/30",
  },
  brand: {
    badge: "bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300",
    border: "border-brand-200 dark:border-brand-800",
    bg: "bg-brand-50/50 dark:bg-brand-950/30",
  },
  blue: {
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    bg: "bg-blue-50/50 dark:bg-blue-950/30",
  },
  amber: {
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    bg: "bg-amber-50/50 dark:bg-amber-950/30",
  },
};

export function CrossPartReference({ activityId }: { activityId: number }) {
  const { data } = usePlannerStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const sections = getReferenceData(activityId, data);

  if (sections.length === 0) return null;

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-2 rounded-[8px] bg-gray-50 px-4 py-2.5 text-left transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-750"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-brand-500"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          Your Journey Context
        </span>
        <span className="text-[10px] text-gray-400">
          {sections.length} reference{sections.length > 1 ? "s" : ""} from previous PARTs
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("shrink-0 text-gray-400 transition-transform", isExpanded && "rotate-180")}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-2">
          {sections.map((section, i) => {
            const colors = COLOR_MAP[section.color] || COLOR_MAP.brand;
            return (
              <div
                key={i}
                className={cn("rounded-[8px] border p-3", colors.border, colors.bg)}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold", colors.badge)}>
                    {section.part}
                  </span>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    {section.title}
                  </span>
                </div>
                <div className="space-y-1">
                  {section.items.map((item, j) => (
                    <div key={j} className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {item.label}:
                      </span>{" "}
                      {item.value.length > 120
                        ? item.value.slice(0, 117) + "..."
                        : item.value}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
