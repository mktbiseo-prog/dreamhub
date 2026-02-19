"use client";

import Link from "next/link";
import type { DreamTeam } from "@/types";

interface TeamCardProps {
  team: DreamTeam;
}

const ROLE_COLORS: Record<string, string> = {
  LEADER: "bg-[#E8E0FF] text-[#6C3CE1]",
  CORE_DREAMER: "bg-[#E8E0FF] text-[#6C3CE1]",
  CONTRIBUTOR: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  SUPPORTER: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
};

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Link
      href={`/teams/${team.id}`}
      className="block rounded-2xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950"
    >
      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
        {team.name}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
        {team.dreamStatement}
      </p>

      {/* Members */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex -space-x-2">
          {team.members.slice(0, 4).map((m) => (
            <div
              key={m.id}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#6C3CE1] text-xs font-bold text-white dark:border-neutral-950"
              title={m.name}
            >
              {m.name?.[0] ?? "?"}
            </div>
          ))}
          {team.members.length > 4 && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-neutral-100 text-xs font-medium text-neutral-600 dark:border-neutral-950 dark:bg-neutral-800 dark:text-neutral-400">
              +{team.members.length - 4}
            </div>
          )}
        </div>
        <span className="text-xs text-neutral-400">
          {team.members.length} member{team.members.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Member roles */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {team.members.slice(0, 3).map((m) => (
          <span
            key={m.id}
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ROLE_COLORS[m.role] ?? ROLE_COLORS.CONTRIBUTOR}`}
          >
            {m.name} &#8226; {m.role.replace("_", " ")}
          </span>
        ))}
      </div>
    </Link>
  );
}
