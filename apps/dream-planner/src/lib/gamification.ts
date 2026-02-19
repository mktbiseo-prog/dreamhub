// ── Gamification: Badges, Titles, Milestones ──

export interface Badge {
  id: string;
  label: string;
  description: string;
  icon: "streak7" | "streak30" | "streak90" | "part1" | "part2" | "part3" | "part4" | "complete" | "first_activity";
  earned: boolean;
}

export interface Title {
  partNumber: number;
  title: string;
  subtitle: string;
}

export const TITLES: Title[] = [
  { partNumber: 1, title: "Reality Facer", subtitle: "You know where you stand." },
  { partNumber: 2, title: "Dream Discoverer", subtitle: "You found your Why." },
  { partNumber: 3, title: "Idea Builder", subtitle: "You proved it works." },
  { partNumber: 4, title: "Dream Connector", subtitle: "You built your tribe." },
];

export const FINAL_TITLE = {
  title: "Dream Launcher",
  subtitle: "You completed the entire Dream Planner. Now go make it happen.",
};

export function getEarnedBadges(data: {
  streak: number;
  completedActivities: number[];
  part2: { completedActivities: number[] };
  part3: { completedActivities: number[] };
  part4: { completedActivities: number[] };
  reflectionAnswers: string[];
}): Badge[] {
  const totalCompleted =
    data.completedActivities.length +
    data.part2.completedActivities.length +
    data.part3.completedActivities.length +
    data.part4.completedActivities.length;

  const part1Done = [1, 2, 3, 4, 5].every((id) => data.completedActivities.includes(id))
    && data.reflectionAnswers.some((a) => a.trim().length > 0);
  const part2Done = [6, 7, 8, 9, 10].every((id) => data.part2.completedActivities.includes(id));
  const part3Done = [11, 12, 13, 14].every((id) => data.part3.completedActivities.includes(id));
  const part4Done = [15, 16, 17, 18, 19, 20].every((id) => data.part4.completedActivities.includes(id));

  return [
    {
      id: "first_activity",
      label: "First Step",
      description: "Completed your first activity",
      icon: "first_activity",
      earned: totalCompleted >= 1,
    },
    {
      id: "part1_complete",
      label: "Reality Facer",
      description: "Completed PART 1: Face My Reality",
      icon: "part1",
      earned: part1Done,
    },
    {
      id: "part2_complete",
      label: "Dream Discoverer",
      description: "Completed PART 2: Discover My Dream",
      icon: "part2",
      earned: part2Done,
    },
    {
      id: "part3_complete",
      label: "Idea Builder",
      description: "Completed PART 3: Validate & Build",
      icon: "part3",
      earned: part3Done,
    },
    {
      id: "part4_complete",
      label: "Dream Connector",
      description: "Completed PART 4: Connect & Expand",
      icon: "part4",
      earned: part4Done,
    },
    {
      id: "all_complete",
      label: "Dream Launcher",
      description: "Completed the entire Dream Planner!",
      icon: "complete",
      earned: part1Done && part2Done && part3Done && part4Done,
    },
    {
      id: "streak_7",
      label: "Week Warrior",
      description: "7-day streak",
      icon: "streak7",
      earned: data.streak >= 7,
    },
    {
      id: "streak_30",
      label: "Monthly Maven",
      description: "30-day streak",
      icon: "streak30",
      earned: data.streak >= 30,
    },
    {
      id: "streak_90",
      label: "Quarter Champion",
      description: "90-day streak",
      icon: "streak90",
      earned: data.streak >= 90,
    },
  ];
}

export function getHighestTitle(data: {
  completedActivities: number[];
  part2: { completedActivities: number[] };
  part3: { completedActivities: number[] };
  part4: { completedActivities: number[] };
  reflectionAnswers: string[];
}): Title | null {
  const part1Done = [1, 2, 3, 4, 5].every((id) => data.completedActivities.includes(id))
    && data.reflectionAnswers.some((a) => a.trim().length > 0);
  const part2Done = [6, 7, 8, 9, 10].every((id) => data.part2.completedActivities.includes(id));
  const part3Done = [11, 12, 13, 14].every((id) => data.part3.completedActivities.includes(id));
  const part4Done = [15, 16, 17, 18, 19, 20].every((id) => data.part4.completedActivities.includes(id));

  if (part4Done) return TITLES[3];
  if (part3Done) return TITLES[2];
  if (part2Done) return TITLES[1];
  if (part1Done) return TITLES[0];
  return null;
}

export const BADGE_ICONS: Record<Badge["icon"], { emoji: string; color: string }> = {
  first_activity: { emoji: "\u{1F3AF}", color: "from-gray-400 to-gray-500" },
  part1: { emoji: "\u{1F4AA}", color: "from-[#FF6B35] to-orange-600" },
  part2: { emoji: "\u{2728}", color: "from-brand-400 to-brand-600" },
  part3: { emoji: "\u{1F6E0}\u{FE0F}", color: "from-blue-400 to-blue-600" },
  part4: { emoji: "\u{1F91D}", color: "from-emerald-400 to-emerald-600" },
  complete: { emoji: "\u{1F680}", color: "from-amber-400 to-orange-500" },
  streak7: { emoji: "\u{1F525}", color: "from-orange-400 to-red-500" },
  streak30: { emoji: "\u{26A1}", color: "from-yellow-400 to-orange-500" },
  streak90: { emoji: "\u{1F451}", color: "from-yellow-300 to-yellow-600" },
};
