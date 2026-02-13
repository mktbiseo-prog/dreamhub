"use client";

import { cn } from "@dreamhub/ui";
import type { TeamMember } from "@/types";

interface MemberListProps {
  members: TeamMember[];
}

const ROLE_BADGES: Record<string, { label: string; color: string }> = {
  LEADER: { label: "Leader", color: "bg-brand-100 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300" },
  CORE_DREAMER: { label: "Core", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" },
  CONTRIBUTOR: { label: "Contributor", color: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" },
  SUPPORTER: { label: "Supporter", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
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
            className="flex items-center gap-3 rounded-[8px] border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-blue-500 text-sm font-bold text-white">
              {m.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {m.name}
              </p>
              <p className="text-xs text-gray-400">
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
