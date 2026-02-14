// ---------------------------------------------------------------------------
// Dream Planner -> Dream Store Sync
//
// Syncs plan milestones to Dream Store story updates. When a user
// completes milestones in Planner, they can automatically generate
// story updates for their Dream Store supporters.
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md SS4, SS13
// ---------------------------------------------------------------------------

/**
 * Sync a completed milestone to Dream Store as a suggested story update.
 *
 * In production, this would call the Store API to create a draft update.
 * For now, it returns a suggested update object that can be reviewed
 * before publishing.
 *
 * @param milestone - The completed milestone data
 * @returns Suggested story update content for Dream Store
 */
export function syncMilestoneToStore(milestone: {
  userId: string;
  title: string;
  completedAt: string;
  partNumber: number;
}): {
  suggested: boolean;
  storyUpdate: { title: string; content: string };
} {
  // In production, this would call the Store API
  console.log("[Planner->Store] Milestone synced:", milestone.title);

  return {
    suggested: true,
    storyUpdate: {
      title: `Milestone: ${milestone.title}`,
      content: `Completed Part ${milestone.partNumber} milestone: ${milestone.title}`,
    },
  };
}

/**
 * Generate suggested story updates based on Planner activity.
 *
 * Analyzes completed activities and dream statement to craft
 * update suggestions that can be posted to Dream Store.
 *
 * @param plannerData - User's planner progress data
 * @returns Array of suggested story updates
 */
export function getSuggestedStoryUpdates(plannerData: {
  completedActivities: number[];
  dreamStatement?: string;
}): Array<{ title: string; content: string }> {
  const updates: Array<{ title: string; content: string }> = [];

  if (plannerData.completedActivities.length >= 3) {
    updates.push({
      title: "Dream Planning Progress",
      content: `I've completed ${plannerData.completedActivities.length} activities in my dream planning journey!`,
    });
  }

  return updates;
}
