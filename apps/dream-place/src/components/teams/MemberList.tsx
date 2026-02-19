"use client";

import { cn } from "@dreamhub/ui";
import type { TeamMember } from "@/types";

interface MemberListProps {
  members: TeamMember[];
}

const ROLE_BADGES: Record<string, { label: string; color: string }> = {
  LEADER: { label: "Leader", color: "bg-[#E8E0FF] text-[#5429C7] dark:bg-[#6C3CE1]/10 dark:text-[#B4A0F0]" },
  CORE_DREAMER: { label: "Core", color: "bg-[#E8E0FF] text-[#5429C7] dark:bg-[#6C3CE1]/10 dark:text-[#B4A0F0]" },
  CONTRIBUTOR: { label: "Contributor", color: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" },
  SUPPORTER: { label: "Supporter", color: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" },
  DREAM_GUIDE: { label: "Dream Guide", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400" },
};

export function MemberList({ members }: MemberListProps) {
  return (
    <div className="space-y-2">
      {members.map((m) => {
        const badge = ROLE_BADGES[m.role] ?? ROLE_BADGES.CONTRIBUTOR;
        return (
          <div
            key={m.id}
            className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#B4A0F0] to-[#6C3CE1] text-sm font-bold text-white">
              {m.name?.[0] ?? "?"}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {m.name}
              </p>
              <p className="text-xs text-neutral-400">
                Joined {new Date(m.joinedAt).toLocaleDateString()}
              </p>
            </div>
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", badge.color)}>
              {badge.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
