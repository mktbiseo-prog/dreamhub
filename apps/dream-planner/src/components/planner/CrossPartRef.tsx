"use client";

import { useState } from "react";
import { cn } from "@dreamhub/ui";
import { usePlannerStore } from "@/lib/store";

/**
 * Cross-Part Reference Panel
 * Shows contextual data from previous PARTs to inform current activity.
 */
export function CrossPartRef({ context }: { context: "proposal" | "hypothesis" | "mvp" | "value_ladder" | "fans" | "network" }) {
  const { data } = usePlannerStore();
  const [open, setOpen] = useState(false);

  const refs = getReferences(data, context);
  if (refs.length === 0) return null;

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-[8px] bg-gray-50 px-4 py-2.5 text-left transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-750"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-brand-500"
        >
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
        </svg>
        <span className="flex-1 text-xs font-medium text-gray-600 dark:text-gray-400">
          Reference data from previous PARTs ({refs.length})
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={cn("text-gray-400 transition-transform", open && "rotate-180")}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="mt-2 space-y-2 rounded-[8px] border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          {refs.map((ref, i) => (
            <div key={i} className="rounded-[6px] bg-gray-50 px-3 py-2 dark:bg-gray-800">
              <p className="text-[10px] font-semibold uppercase text-gray-400">
                {ref.source}
              </p>
              <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                {ref.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface RefItem {
  source: string;
  text: string;
}

function getReferences(data: ReturnType<typeof usePlannerStore>["data"], context: string): RefItem[] {
  const refs: RefItem[] = [];

  if (context === "proposal" || context === "hypothesis" || context === "mvp" || context === "value_ladder") {
    // PART 1 → PART 3 references
    if (data.skills.length > 0) {
      const topSkills = data.skills
        .sort((a, b) => b.proficiency - a.proficiency)
        .slice(0, 5)
        .map((s) => s.name);
      refs.push({ source: "PART 1 — Skills", text: `Your top skills: ${topSkills.join(", ")}` });
    }

    const strongResources = data.resources.filter((r) => r.score >= 4);
    if (strongResources.length > 0) {
      refs.push({
        source: "PART 1 — Resources",
        text: `Strong resources: ${strongResources.map((r) => `${r.label} (${r.score}/5)`).join(", ")}`,
      });
    }

    const weakResources = data.resources.filter((r) => r.score > 0 && r.score <= 2);
    if (weakResources.length > 0) {
      refs.push({
        source: "PART 1 — Resource Gaps",
        text: `Areas to watch: ${weakResources.map((r) => `${r.label} (${r.score}/5)`).join(", ")}`,
      });
    }

    if (data.timeBlocks.length > 0) {
      const productiveBlocks = data.timeBlocks.filter((b) => b.type === "productive");
      refs.push({
        source: "PART 1 — Time",
        text: `${productiveBlocks.length} productive time blocks available per week`,
      });
    }

    // PART 2 → PART 3 references
    if (data.part2.whyWhatBridge.why) {
      refs.push({
        source: "PART 2 — Your Why",
        text: data.part2.whyWhatBridge.why.slice(0, 120) + (data.part2.whyWhatBridge.why.length > 120 ? "..." : ""),
      });
    }

    if (data.part2.whyWhatBridge.selectedIndex >= 0) {
      const selectedIdea = data.part2.whyWhatBridge.ideas[data.part2.whyWhatBridge.selectedIndex];
      if (selectedIdea?.trim()) {
        refs.push({
          source: "PART 2 — Selected Idea",
          text: selectedIdea,
        });
      }
    }

    // Market scan insights
    const totalNotes =
      data.part2.marketScan.youtube.length +
      data.part2.marketScan.bookstore.length +
      data.part2.marketScan.community.length;
    if (totalNotes > 0) {
      const discoveries = [
        ...data.part2.marketScan.youtube,
        ...data.part2.marketScan.bookstore,
        ...data.part2.marketScan.community,
      ].filter((n) => n.type === "discovery" && n.text.trim());
      if (discoveries.length > 0) {
        refs.push({
          source: "PART 2 — Market Scan",
          text: `Key discoveries: ${discoveries.slice(0, 2).map((d) => d.text.slice(0, 50)).join("; ")}`,
        });
      }
    }
  }

  if (context === "fans" || context === "network") {
    // PART 2 → PART 4 references
    if (data.part2.strengths.length > 0) {
      refs.push({
        source: "PART 2 — Strengths",
        text: `Your strengths: ${data.part2.strengths.slice(0, 4).join(", ")}`,
      });
    }

    const unframed = data.part2.weaknesses.filter((w) => w.text.trim() && !w.reframed.trim());
    const reframed = data.part2.weaknesses.filter((w) => w.reframed.trim());
    if (reframed.length > 0) {
      refs.push({
        source: "PART 2 — Reframed Strengths",
        text: reframed.slice(0, 2).map((w) => `${w.text} → ${w.reframed}`).join("; "),
      });
    }
    if (unframed.length > 0 && context === "network") {
      refs.push({
        source: "PART 2 — Weaknesses to Complement",
        text: `Find partners strong in: ${unframed.slice(0, 3).map((w) => w.text).join(", ")}`,
      });
    }

    // PART 3 → PART 4 references
    if (data.part3.oneLineProposal.finalProposal) {
      refs.push({
        source: "PART 3 — Your Proposal",
        text: data.part3.oneLineProposal.finalProposal.slice(0, 120),
      });
    }

    if (data.skills.length > 0) {
      refs.push({
        source: "PART 1 — Skills for Value Exchange",
        text: `You can offer: ${data.skills.slice(0, 4).map((s) => s.name).join(", ")}`,
      });
    }
  }

  return refs;
}
